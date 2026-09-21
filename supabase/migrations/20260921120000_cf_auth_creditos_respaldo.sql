-- ============================================================================
-- CertiFoto — identidad, créditos y respaldo de actas.
--
-- Vive en el proyecto compartido "supabase-expansiel-landing" bajo el
-- namespace cf_* (misma convención que tas_*, pj_*, lexia_*). Es 100% aditivo:
-- no toca tablas, políticas ni buckets de otros productos.
--
-- Auth: la compartida del proyecto (Supabase Auth, magic link). Todo el RLS se
-- basa en auth.uid(). El perfil cf_ se crea en el PRIMER login de CertiFoto
-- (no con un trigger en auth.users, porque la auth es compartida y crearía
-- perfiles de CertiFoto a usuarios de otros productos).
--
-- Créditos: ledger append-only. saldo = sum(delta). El cobro al certificar es
-- atómico en cf_certificar() (security definer + advisory lock + índice único
-- por acta), así que el cliente no puede descontar ni duplicar cobros.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- perfiles --
create table if not exists public.cf_perfiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  nombre         text,
  rol            text not null default 'broker'
                 check (rol in ('broker','landlord','tenant','property_manager','admin')),
  organizacion   text,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  ultimo_acceso  timestamptz
);
alter table public.cf_perfiles enable row level security;
drop policy if exists cf_perfiles_select on public.cf_perfiles;
drop policy if exists cf_perfiles_update on public.cf_perfiles;
create policy cf_perfiles_select on public.cf_perfiles
  for select using (user_id = auth.uid());
create policy cf_perfiles_update on public.cf_perfiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
-- insert: solo vía cf_asegurar_perfil()

-- ---------------------------------------------------------------- créditos --
create table if not exists public.cf_creditos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  delta       integer not null check (delta <> 0),
  motivo      text not null check (motivo in (
                'welcome','pack_purchased','redeem_code','manual_grant',
                'dev_seed','certify_acta','refund')),
  descripcion text,
  acta_id     text,
  metadata    jsonb not null default '{}'::jsonb,
  creado_en   timestamptz not null default now()
);
create index if not exists cf_creditos_user_idx
  on public.cf_creditos (user_id, creado_en desc);
-- Un acta se cobra UNA sola vez por usuario (defensa contra doble cobro).
create unique index if not exists cf_creditos_una_vez_por_acta
  on public.cf_creditos (user_id, acta_id) where motivo = 'certify_acta';
alter table public.cf_creditos enable row level security;
drop policy if exists cf_creditos_select on public.cf_creditos;
create policy cf_creditos_select on public.cf_creditos
  for select using (user_id = auth.uid());
-- Sin insert/update/delete directos: solo por funciones security definer.

-- ---------------------------------------------------- respaldo (sync cloud) --
-- El Acta completa va en `datos` SIN los dataUrl de las fotos (esos bytes van
-- al bucket privado "certifoto" y se referencian desde cf_fotos).
create table if not exists public.cf_actas (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  tipo           text,
  estado         text,
  propiedad_id   text,
  datos          jsonb not null,
  hash_documento text,
  certificada_en timestamptz,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index if not exists cf_actas_user_idx
  on public.cf_actas (user_id, actualizado_en desc);
alter table public.cf_actas enable row level security;
drop policy if exists cf_actas_all on public.cf_actas;
create policy cf_actas_all on public.cf_actas
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.cf_propiedades (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  datos          jsonb not null,
  actualizado_en timestamptz not null default now()
);
create index if not exists cf_propiedades_user_idx on public.cf_propiedades (user_id);
alter table public.cf_propiedades enable row level security;
drop policy if exists cf_propiedades_all on public.cf_propiedades;
create policy cf_propiedades_all on public.cf_propiedades
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.cf_contactos (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  datos          jsonb not null,
  actualizado_en timestamptz not null default now()
);
create index if not exists cf_contactos_user_idx on public.cf_contactos (user_id);
alter table public.cf_contactos enable row level security;
drop policy if exists cf_contactos_all on public.cf_contactos;
create policy cf_contactos_all on public.cf_contactos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.cf_fotos (
  id           text primary key,
  acta_id      text not null,
  user_id      uuid not null references auth.users(id) on delete cascade,
  ruta_storage text not null,     -- {user_id}/{acta_id}/{foto_id} en bucket certifoto
  mime         text,
  bytes        integer,
  sha256       text,
  creado_en    timestamptz not null default now()
);
create index if not exists cf_fotos_acta_idx on public.cf_fotos (user_id, acta_id);
alter table public.cf_fotos enable row level security;
drop policy if exists cf_fotos_all on public.cf_fotos;
create policy cf_fotos_all on public.cf_fotos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --------------------------------------------------------------- funciones --

-- Saldo del usuario autenticado.
create or replace function public.cf_saldo()
returns integer
language sql stable security invoker
set search_path = public
as $$
  select coalesce(sum(delta), 0)::integer
    from public.cf_creditos
   where user_id = auth.uid();
$$;

-- Crea/actualiza el perfil en el primer login de CertiFoto y otorga el crédito
-- de bienvenida una sola vez. Decisión de producto (sep-2026): sin regalo,
-- c_bienvenida = 0. Subirlo a 1 o más reactiva el crédito para cuentas nuevas.
create or replace function public.cf_asegurar_perfil(
  p_nombre text default null,
  p_rol    text default null
)
returns public.cf_perfiles
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid         uuid := auth.uid();
  v_email       text := coalesce(auth.jwt() ->> 'email', '');
  v_perfil      public.cf_perfiles;
  c_bienvenida  constant integer := 0;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.cf_perfiles (user_id, email, nombre, rol, ultimo_acceso)
  values (v_uid, v_email, p_nombre, coalesce(p_rol, 'broker'), now())
  on conflict (user_id) do update
     set email          = excluded.email,
         nombre         = coalesce(public.cf_perfiles.nombre, excluded.nombre),
         ultimo_acceso  = now(),
         actualizado_en = now()
  returning * into v_perfil;

  if c_bienvenida > 0 and not exists (
       select 1 from public.cf_creditos
        where user_id = v_uid and motivo = 'welcome') then
    insert into public.cf_creditos (user_id, delta, motivo, descripcion)
    values (v_uid, c_bienvenida, 'welcome', 'Crédito de bienvenida');
  end if;

  return v_perfil;
end;
$$;

-- Cobro atómico de 1 crédito al certificar un acta.
-- Errores: not_authenticated | already_certified | no_credits
create or replace function public.cf_certificar(p_acta_id text, p_hash text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_saldo integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  -- Serializa cobros del mismo usuario dentro de la transacción.
  perform pg_advisory_xact_lock(hashtext('cf_creditos:' || v_uid::text));

  if exists (select 1 from public.cf_creditos
              where user_id = v_uid and acta_id = p_acta_id
                and motivo = 'certify_acta') then
    raise exception 'already_certified';
  end if;

  select coalesce(sum(delta), 0) into v_saldo
    from public.cf_creditos where user_id = v_uid;
  if v_saldo < 1 then
    raise exception 'no_credits';
  end if;

  insert into public.cf_creditos (user_id, delta, motivo, descripcion, acta_id, metadata)
  values (v_uid, -1, 'certify_acta', 'Certificación de acta', p_acta_id,
          jsonb_build_object('hash', p_hash));

  update public.cf_actas
     set certificada_en = now(), hash_documento = p_hash, actualizado_en = now()
   where id = p_acta_id and user_id = v_uid;

  return jsonb_build_object('ok', true, 'saldo', v_saldo - 1);
end;
$$;

revoke all on function public.cf_saldo()                      from public, anon;
revoke all on function public.cf_asegurar_perfil(text, text)  from public, anon;
revoke all on function public.cf_certificar(text, text)       from public, anon;
grant execute on function public.cf_saldo()                     to authenticated;
grant execute on function public.cf_asegurar_perfil(text, text) to authenticated;
grant execute on function public.cf_certificar(text, text)      to authenticated;

-- ----------------------------------------------------------------- storage --
-- Bucket privado; cada usuario solo ve su carpeta {user_id}/...
insert into storage.buckets (id, name, public)
values ('certifoto', 'certifoto', false)
on conflict (id) do nothing;

drop policy if exists cf_storage_select on storage.objects;
drop policy if exists cf_storage_insert on storage.objects;
drop policy if exists cf_storage_update on storage.objects;
drop policy if exists cf_storage_delete on storage.objects;
create policy cf_storage_select on storage.objects for select
  using (bucket_id = 'certifoto' and (storage.foldername(name))[1] = auth.uid()::text);
create policy cf_storage_insert on storage.objects for insert
  with check (bucket_id = 'certifoto' and (storage.foldername(name))[1] = auth.uid()::text);
create policy cf_storage_update on storage.objects for update
  using (bucket_id = 'certifoto' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'certifoto' and (storage.foldername(name))[1] = auth.uid()::text);
create policy cf_storage_delete on storage.objects for delete
  using (bucket_id = 'certifoto' and (storage.foldername(name))[1] = auth.uid()::text);
