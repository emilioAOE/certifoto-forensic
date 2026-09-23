-- Verificador público de certificados (/forensic).
--
-- Antes el verificador solo recalculaba la huella del JSON embebido en el
-- mismo PDF y la comparaba con el hash también embebido: cualquiera podía
-- fabricar un "certificado auténtico" calculando el hash él mismo. Ahora,
-- además, pregunta si esa huella fue sellada de verdad por CertiFoto:
-- cf_certificar() la guarda en cf_creditos.metadata.hash al cobrar el crédito.
--
-- Solo lectura, sin datos personales: responde si existe y cuándo se selló.
-- Un SHA-256 (64 hex) no se puede adivinar, así que exponerlo a anon no
-- permite enumerar certificados.

create index if not exists cf_creditos_hash_certificacion_idx
  on public.cf_creditos ((metadata->>'hash'))
  where motivo = 'certify_acta';

create or replace function public.cf_verificar_hash(p_hash text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then
      jsonb_build_object('registrado', false)
    else coalesce(
      (select jsonb_build_object('registrado', true, 'certificada_en', min(c.creado_en))
         from public.cf_creditos c
        where c.motivo = 'certify_acta' and c.metadata->>'hash' = p_hash
       having count(*) > 0),
      jsonb_build_object('registrado', false))
  end;
$$;

revoke all on function public.cf_verificar_hash(text) from public;
grant execute on function public.cf_verificar_hash(text) to anon, authenticated;
