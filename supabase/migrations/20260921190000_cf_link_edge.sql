-- Soporte para la Edge Function cf-magic-link: la service role key del
-- proyecto compartido NUNCA sale de Supabase. CertiFoto llama a la funcion
-- con un secreto propio y acotado (solo su hash vive aqui) y la funcion se
-- niega a generar enlaces para usuarios de otros productos del proyecto.

-- Configuracion privada de CertiFoto (solo service role; sin policies).
create table if not exists public.cf_config (
  clave          text primary key,
  valor          text not null,
  actualizado_en timestamptz not null default now()
);
alter table public.cf_config enable row level security;

-- ¿El correo pertenece a un usuario de OTRO producto? (existe en auth.users
-- pero no tiene perfil cf_). Un secreto de CertiFoto filtrado no puede
-- convertirse en toma de cuenta de Tasaciones u otros.
create or replace function public.cf_email_es_de_otro_producto(p_email text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from auth.users u where lower(u.email) = lower(p_email))
     and not exists (select 1 from public.cf_perfiles p where lower(p.email) = lower(p_email));
$$;
revoke all on function public.cf_email_es_de_otro_producto(text) from public, anon, authenticated;
grant execute on function public.cf_email_es_de_otro_producto(text) to service_role;

-- Rate limit atomico (cuenta e inserta bajo lock): 3 por correo / 15 min,
-- 10 por IP / hora. Limpia lo mas viejo que un dia.
create or replace function public.cf_login_permitir(p_email text, p_ip text)
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  v_email integer;
  v_ip    integer;
begin
  perform pg_advisory_xact_lock(hashtext('cf_login:' || lower(p_email)));
  select count(*) into v_email from public.cf_login_solicitudes
   where email = lower(p_email) and creado_en > now() - interval '15 minutes';
  if v_email >= 3 then
    return false;
  end if;
  if p_ip is not null then
    select count(*) into v_ip from public.cf_login_solicitudes
     where ip = p_ip and creado_en > now() - interval '1 hour';
    if v_ip >= 10 then
      return false;
    end if;
  end if;
  insert into public.cf_login_solicitudes (email, ip) values (lower(p_email), p_ip);
  delete from public.cf_login_solicitudes where creado_en < now() - interval '1 day';
  return true;
end;
$$;
revoke all on function public.cf_login_permitir(text, text) from public, anon, authenticated;
grant execute on function public.cf_login_permitir(text, text) to service_role;
