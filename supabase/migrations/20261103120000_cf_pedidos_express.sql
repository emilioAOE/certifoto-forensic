-- Certificado express: sube contrato y fotos, paga $2.000 y recibe el PDF.
-- Sin cuenta: el pedido se identifica por un token de 32 hex que solo conoce
-- quien lo creó (y el correo de confirmación). Sin service role en Vercel:
-- escrituras por funciones security definer gateadas por el secreto de pagos
-- (CERTIFOTO_PAGOS_SECRET, sha256 en cf_config 'pagos_secret_sha256').
--
-- Los archivos (fotos, acta.json, certificado.pdf) van al bucket privado
-- cf-pedidos bajo <token>/..., SIN políticas para anon: toda lectura y
-- escritura pasa por URLs firmadas que emite la Edge Function
-- cf-pedido-archivos (service role dentro de Supabase). Así nadie puede
-- listar la carpeta raíz y descubrir tokens ajenos.

create table if not exists public.cf_pedidos (
  token                text primary key,
  commerce_order       text not null unique,          -- cfx-<uuid hex>, la orden en Flow
  email                text not null,
  nombre               text,
  monto_clp            integer not null check (monto_clp > 0),
  estado               text not null default 'creado'
                       check (estado in ('creado','pendiente','pagado','rechazado','anulado')),
  acta_id              text,
  resumen              jsonb not null default '{}'::jsonb,  -- direccion, tipo, fotos (sin datos sensibles)
  ip                   text,
  flow_order           bigint,
  flow_token           text,
  payload              jsonb,
  hash_documento       text,
  certificada_en       timestamptz,
  enviado_en           timestamptz,
  archivos_borrados_en timestamptz,
  creado_en            timestamptz not null default now(),
  actualizado_en       timestamptz not null default now(),
  pagado_en            timestamptz
);
create index if not exists cf_pedidos_email_idx on public.cf_pedidos (email, creado_en desc);
create unique index if not exists cf_pedidos_flow_order_idx
  on public.cf_pedidos (flow_order) where flow_order is not null;
create index if not exists cf_pedidos_hash_idx
  on public.cf_pedidos (hash_documento) where hash_documento is not null;
alter table public.cf_pedidos enable row level security;
-- Sin políticas: solo por las funciones de abajo.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cf-pedidos', 'cf-pedidos', false, 15728640,
        array['image/jpeg','image/png','image/webp','application/pdf','application/json'])
on conflict (id) do nothing;

-- 1) Crear el pedido (al llegar a la pantalla de revisión; aún sin orden en Flow).
create or replace function public.cf_pedido_crear(
  p_secret    text,
  p_email     text,
  p_nombre    text,
  p_monto_clp integer,
  p_acta_id   text,
  p_resumen   jsonb default '{}'::jsonb,
  p_ip        text default null
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_token text;
  v_order text;
  v_email text := lower(trim(p_email));
begin
  if not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' or length(v_email) > 200 then
    raise exception 'bad_email';
  end if;
  if p_monto_clp <= 0 then raise exception 'bad_request'; end if;
  v_token := encode(extensions.gen_random_bytes(16), 'hex');
  v_order := 'cfx-' || replace(gen_random_uuid()::text, '-', '');
  insert into public.cf_pedidos (token, commerce_order, email, nombre, monto_clp, acta_id, resumen, ip)
  values (v_token, v_order, v_email, nullif(trim(coalesce(p_nombre, '')), ''), p_monto_clp,
          p_acta_id, coalesce(p_resumen, '{}'::jsonb), p_ip);
  return jsonb_build_object('token', v_token, 'commerce_order', v_order);
end;
$$;

-- 2) Preparar el pago: devuelve la orden para Flow. Si ya hubo un intento
--    (flow_order), emite una orden nueva para no reutilizar commerceOrder.
create or replace function public.cf_pedido_pagar(
  p_secret  text,
  p_token   text,
  p_email   text default null,
  p_resumen jsonb default null
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  r public.cf_pedidos%rowtype;
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  select * into r from public.cf_pedidos where token = p_token for update;
  if not found then raise exception 'not_found'; end if;
  if r.estado = 'pagado' then raise exception 'already_paid'; end if;
  if v_email <> '' and v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'bad_email'; end if;
  if r.flow_order is not null then
    r.commerce_order := 'cfx-' || replace(gen_random_uuid()::text, '-', '');
  end if;
  update public.cf_pedidos
     set commerce_order = r.commerce_order,
         email = case when v_email <> '' then v_email else email end,
         resumen = coalesce(p_resumen, resumen),
         flow_order = null, flow_token = null,
         estado = 'creado', actualizado_en = now()
   where token = p_token;
  return jsonb_build_object('commerce_order', r.commerce_order, 'monto_clp', r.monto_clp,
                            'email', case when v_email <> '' then v_email else r.email end);
end;
$$;

-- 3) Guardar token/flowOrder cuando Flow acepta la orden.
create or replace function public.cf_pedido_iniciar(
  p_secret         text,
  p_commerce_order text,
  p_flow_order     bigint,
  p_flow_token     text
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  update public.cf_pedidos
     set flow_order = p_flow_order, flow_token = p_flow_token,
         estado = 'pendiente', actualizado_en = now()
   where commerce_order = p_commerce_order and estado = 'creado';
end;
$$;

-- 4) Confirmar (webhook o retorno). Idempotente: una sola transición a 'pagado'.
create or replace function public.cf_pedido_confirmar(
  p_secret         text,
  p_commerce_order text,
  p_estado         text,
  p_payload        jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  r public.cf_pedidos%rowtype;
begin
  if not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  if p_estado not in ('pendiente','pagado','rechazado','anulado') then
    raise exception 'bad_estado';
  end if;
  select * into r from public.cf_pedidos where commerce_order = p_commerce_order for update;
  if not found then raise exception 'not_found'; end if;

  if r.estado = 'pagado' then
    return jsonb_build_object('ok', true, 'ya_estaba', true, 'token', r.token,
                              'email', r.email, 'estado', 'pagado', 'resumen', r.resumen);
  end if;
  if p_estado = 'pagado' then
    update public.cf_pedidos
       set estado = 'pagado', pagado_en = now(), actualizado_en = now(), payload = p_payload
     where token = r.token;
    return jsonb_build_object('ok', true, 'ya_estaba', false, 'token', r.token,
                              'email', r.email, 'estado', 'pagado', 'resumen', r.resumen);
  end if;
  update public.cf_pedidos
     set estado = p_estado, actualizado_en = now(), payload = p_payload
   where token = r.token;
  return jsonb_build_object('ok', true, 'ya_estaba', false, 'token', r.token,
                            'email', r.email, 'estado', p_estado, 'resumen', r.resumen);
end;
$$;

-- 5) Estado del pedido para quien tiene el token (navegador, sin cuenta).
--    El correo va parcialmente oculto: el token podría quedar en un historial.
create or replace function public.cf_pedido_estado(p_token text)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select case
    when p_token !~ '^[0-9a-f]{32}$' then jsonb_build_object('existe', false)
    else coalesce(
      (select jsonb_build_object(
         'existe', true,
         'estado', estado,
         'email_oculto', regexp_replace(email, '^(.).*(@.*)$', '\1***\2'),
         'nombre', nombre,
         'acta_id', acta_id,
         'monto_clp', monto_clp,
         'hash', hash_documento,
         'certificada_en', certificada_en,
         'enviado_en', enviado_en,
         'resumen', resumen)
         from public.cf_pedidos where token = p_token),
      jsonb_build_object('existe', false))
  end;
$$;

-- 6) Sellar: registra la huella del documento. Solo con el pedido pagado y
--    una sola vez; si ya había huella, informa si coincide.
create or replace function public.cf_pedido_certificar(p_token text, p_hash text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  r public.cf_pedidos%rowtype;
begin
  if p_token !~ '^[0-9a-f]{32}$' or p_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'bad_request';
  end if;
  select * into r from public.cf_pedidos where token = p_token for update;
  if not found then raise exception 'not_found'; end if;
  if r.estado <> 'pagado' then raise exception 'not_paid'; end if;
  if r.hash_documento is null then
    update public.cf_pedidos
       set hash_documento = p_hash, certificada_en = now(), actualizado_en = now()
     where token = p_token
     returning * into r;
    return jsonb_build_object('ok', true, 'hash', r.hash_documento,
                              'certificada_en', r.certificada_en, 'coincide', true);
  end if;
  return jsonb_build_object('ok', true, 'hash', r.hash_documento,
                            'certificada_en', r.certificada_en, 'coincide', r.hash_documento = p_hash);
end;
$$;

-- 7) El servidor marca que el PDF ya se envió por correo.
create or replace function public.cf_pedido_marcar_enviado(p_secret text, p_token text)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  update public.cf_pedidos set enviado_en = now(), actualizado_en = now() where token = p_token;
end;
$$;

revoke all on function public.cf_pedido_crear(text, text, text, integer, text, jsonb, text) from public;
revoke all on function public.cf_pedido_pagar(text, text, text, jsonb)                   from public;
revoke all on function public.cf_pedido_iniciar(text, text, bigint, text)                 from public;
revoke all on function public.cf_pedido_confirmar(text, text, text, jsonb)               from public;
revoke all on function public.cf_pedido_estado(text)                                      from public;
revoke all on function public.cf_pedido_certificar(text, text)                            from public;
revoke all on function public.cf_pedido_marcar_enviado(text, text)                        from public;
grant execute on function public.cf_pedido_crear(text, text, text, integer, text, jsonb, text) to anon, authenticated;
grant execute on function public.cf_pedido_pagar(text, text, text, jsonb)                   to anon, authenticated;
grant execute on function public.cf_pedido_iniciar(text, text, bigint, text)                 to anon, authenticated;
grant execute on function public.cf_pedido_confirmar(text, text, text, jsonb)               to anon, authenticated;
grant execute on function public.cf_pedido_estado(text)                                      to anon, authenticated;
grant execute on function public.cf_pedido_certificar(text, text)                            to anon, authenticated;
grant execute on function public.cf_pedido_marcar_enviado(text, text)                        to anon, authenticated;

-- El verificador público reconoce también las huellas de pedidos express.
create or replace function public.cf_verificar_hash(p_hash text)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select case
    when p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then
      jsonb_build_object('registrado', false)
    else coalesce(
      (select jsonb_build_object('registrado', true, 'certificada_en', min(t.certificada_en))
         from (
           select c.creado_en as certificada_en
             from public.cf_creditos c
            where c.motivo = 'certify_acta' and c.metadata->>'hash' = p_hash
           union all
           select p.certificada_en
             from public.cf_pedidos p
            where p.hash_documento = p_hash and p.estado = 'pagado'
         ) t
       having count(*) > 0),
      jsonb_build_object('registrado', false))
  end;
$$;

-- Limpieza diaria: la Edge Function borra los archivos de pedidos no pagados
-- (> 3 días) y de pedidos pagados antiguos (> 90 días; la fila con la huella
-- se conserva para el verificador). Sin secreto: solo borra lo vencido.
select cron.unschedule('cf-pedidos-limpiar') where exists (select 1 from cron.job where jobname = 'cf-pedidos-limpiar');
select cron.schedule('cf-pedidos-limpiar', '40 4 * * *', $$
  select net.http_post(
    url := 'https://alksowkwsnjeesmnosvg.supabase.co/functions/v1/cf-pedido-archivos',
    headers := jsonb_build_object('content-type', 'application/json'),
    body := '{"op":"limpiar"}'::jsonb
  );
$$);

-- 8) Datos completos del pedido para el servidor (correo real, para adjuntar el PDF).
create or replace function public.cf_pedido_datos(p_secret text, p_token text)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select case
    when not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then null
    else (select to_jsonb(p) - 'flow_token' - 'payload' - 'ip' from public.cf_pedidos p where p.token = p_token)
  end;
$$;

-- 9) Token del pedido a partir del token de Flow: el retorno de Flow solo trae
--    ese dato, y si la confirmación falla igual hay que llevar a la persona a
--    su pedido y no a "Mis créditos".
create or replace function public.cf_pedido_por_flow_token(p_secret text, p_flow_token text)
returns text
language sql stable security definer
set search_path = public
as $$
  select case
    when not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then null
    else (select token from public.cf_pedidos where flow_token = p_flow_token limit 1)
  end;
$$;

revoke all on function public.cf_pedido_datos(text, text)          from public;
revoke all on function public.cf_pedido_por_flow_token(text, text) from public;
grant execute on function public.cf_pedido_datos(text, text)          to anon, authenticated;
grant execute on function public.cf_pedido_por_flow_token(text, text) to anon, authenticated;
