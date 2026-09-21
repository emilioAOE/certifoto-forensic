-- Rate limit del magic link (el correo lo manda Listmonk desde nuestro
-- servidor, asi que el limite es nuestro, no el de Supabase Auth).
-- Solo escribe/lee el service role: sin policies = bloqueada para anon.
create table if not exists public.cf_login_solicitudes (
  id        bigserial primary key,
  email     text not null,
  ip        text,
  creado_en timestamptz not null default now()
);
create index if not exists cf_login_solicitudes_email_idx
  on public.cf_login_solicitudes (email, creado_en desc);
create index if not exists cf_login_solicitudes_ip_idx
  on public.cf_login_solicitudes (ip, creado_en desc);
alter table public.cf_login_solicitudes enable row level security;
