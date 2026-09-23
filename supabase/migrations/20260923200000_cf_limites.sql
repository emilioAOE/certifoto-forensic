-- Límite de uso para las rutas del servidor de CertiFoto (IA y envío de
-- correos). Antes no había ninguno: cualquiera podía gastar la cuenta de
-- Anthropic llamando a /api/analyze-photo en bucle, o usar /api/acta/enviar
-- para mandar correos desde el remitente compartido.
--
-- Ventana fija: una fila por (clave, inicio de ventana) con un contador. Solo
-- se usa desde el servidor con el secreto CERTIFOTO_LINK_SECRET (su sha256
-- ya vive en cf_config como link_secret_sha256), así que un visitante no
-- puede agotar el cupo de otro llamando la RPC directo.

create table if not exists public.cf_limites (
  clave   text        not null,
  ventana timestamptz not null,
  conteo  integer     not null default 0,
  primary key (clave, ventana)
);
alter table public.cf_limites enable row level security;
-- Sin políticas: solo se toca desde cf_limite() (security definer).

create or replace function public.cf_limite(
  p_secret      text,
  p_clave       text,
  p_max         integer,
  p_ventana_seg integer,
  p_cantidad    integer default 1
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ventana timestamptz;
  v_conteo  integer;
begin
  if not public.cf_secreto_ok('link_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  if p_ventana_seg < 1 or p_max < 0 or p_cantidad < 1 or length(p_clave) > 200 then
    raise exception 'bad_args';
  end if;

  v_ventana := to_timestamp(floor(extract(epoch from now()) / p_ventana_seg) * p_ventana_seg);

  insert into public.cf_limites (clave, ventana, conteo)
  values (p_clave, v_ventana, p_cantidad)
  on conflict (clave, ventana)
  do update set conteo = public.cf_limites.conteo + excluded.conteo
  returning conteo into v_conteo;

  -- Limpieza ocasional de ventanas viejas.
  if random() < 0.01 then
    delete from public.cf_limites where ventana < now() - interval '3 days';
  end if;

  return v_conteo <= p_max;
end;
$$;

revoke all on function public.cf_limite(text, text, integer, integer, integer) from public;
grant execute on function public.cf_limite(text, text, integer, integer, integer) to anon, authenticated;
