-- CertiFoto · correos de ciclo de vida
--
--  - Bienvenida: se envía UNA vez, en el primer login exitoso (app/auth/confirm).
--    La marca la reclama el propio usuario (auth.uid()), así no hace falta
--    ningún secreto.
--  - Seguimiento a los 7 días: lo envía un cron de Vercel sin sesión; reclama
--    los pendientes con el secreto del cron (CRON_SECRET, sha256 en cf_config
--    clave 'cron_secret_sha256', insertado a mano como los demás).
--
-- Patrón: "reclamar" marca la fila ANTES de enviar (así dos ejecuciones
-- simultáneas no duplican) y "deshacer" la libera si el envío falla.

alter table public.cf_perfiles
  add column if not exists bienvenida_enviada_en  timestamptz,
  add column if not exists seguimiento_enviado_en timestamptz;

-- ------------------------------------------------------------- bienvenida --
-- Devuelve la fila (email, nombre) solo la primera vez; después, nada.
create or replace function public.cf_bienvenida_reclamar()
returns table (email text, nombre text)
language sql security definer
set search_path = public
as $$
  update public.cf_perfiles p
     set bienvenida_enviada_en = now()
   where p.user_id = auth.uid()
     and p.bienvenida_enviada_en is null
  returning p.email, p.nombre;
$$;
revoke all on function public.cf_bienvenida_reclamar() from public, anon;
grant execute on function public.cf_bienvenida_reclamar() to authenticated;

create or replace function public.cf_bienvenida_deshacer()
returns void
language sql security definer
set search_path = public
as $$
  update public.cf_perfiles
     set bienvenida_enviada_en = null
   where user_id = auth.uid();
$$;
revoke all on function public.cf_bienvenida_deshacer() from public, anon;
grant execute on function public.cf_bienvenida_deshacer() to authenticated;

-- ------------------------------------------------------------ seguimiento --
-- Cuentas con 7+ días que YA entraron (bienvenida enviada) y no han recibido
-- el seguimiento. Marca y devuelve hasta p_limite filas.
create or replace function public.cf_seguimiento_reclamar(
  p_secret text,
  p_limite integer default 50
)
returns table (user_id uuid, email text, nombre text)
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.cf_secreto_ok('cron_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;

  return query
    with pendientes as (
      select p.user_id
        from public.cf_perfiles p
       where p.seguimiento_enviado_en is null
         and p.bienvenida_enviada_en is not null
         and p.creado_en <= now() - interval '7 days'
       order by p.creado_en
       limit greatest(1, least(coalesce(p_limite, 50), 200))
         for update skip locked
    )
    update public.cf_perfiles p
       set seguimiento_enviado_en = now()
      from pendientes
     where p.user_id = pendientes.user_id
    returning p.user_id, p.email, p.nombre;
end;
$$;

create or replace function public.cf_seguimiento_deshacer(
  p_secret  text,
  p_user_id uuid
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.cf_secreto_ok('cron_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  update public.cf_perfiles
     set seguimiento_enviado_en = null
   where user_id = p_user_id;
end;
$$;

revoke all on function public.cf_seguimiento_reclamar(text, integer) from public;
revoke all on function public.cf_seguimiento_deshacer(text, uuid) from public;
grant execute on function public.cf_seguimiento_reclamar(text, integer) to anon, authenticated;
grant execute on function public.cf_seguimiento_deshacer(text, uuid) to anon, authenticated;

-- Recordatorio (no está en esta migración a propósito):
--   insert into public.cf_config (clave, valor) values ('cron_secret_sha256', '<sha256 hex>');
