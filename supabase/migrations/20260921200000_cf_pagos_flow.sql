-- Pagos con Flow (flow.cl): compra de packs de créditos.
--
-- Sin service role en Vercel: las escrituras van por funciones security
-- definer gateadas por un secreto acotado (CERTIFOTO_PAGOS_SECRET; aquí solo
-- su sha256 en cf_config con clave 'pagos_secret_sha256'). El abono de
-- créditos es idempotente: fila bloqueada (for update) y transición única a
-- 'pagado'; un webhook repetido no duplica créditos.

create table if not exists public.cf_pagos (
  commerce_order text primary key,            -- nuestro id: cf-<uuid sin guiones>
  user_id        uuid not null references auth.users(id) on delete cascade,
  pack_id        text not null,
  creditos       integer not null check (creditos > 0),
  monto_clp      integer not null check (monto_clp > 0),
  estado         text not null default 'creado'
                 check (estado in ('creado','pendiente','pagado','rechazado','anulado')),
  flow_order     bigint,
  flow_token     text,
  payload        jsonb,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  pagado_en      timestamptz
);
create index if not exists cf_pagos_user_idx on public.cf_pagos (user_id, creado_en desc);
create unique index if not exists cf_pagos_flow_order_idx
  on public.cf_pagos (flow_order) where flow_order is not null;
alter table public.cf_pagos enable row level security;
drop policy if exists cf_pagos_select on public.cf_pagos;
create policy cf_pagos_select on public.cf_pagos
  for select using (user_id = auth.uid());
-- Sin insert/update directos: solo por las funciones de abajo.

-- ¿El secreto entregado coincide con el hash guardado en cf_config?
create or replace function public.cf_secreto_ok(p_clave text, p_secret text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cf_config
     where clave = p_clave
       and valor = encode(extensions.digest(p_secret, 'sha256'), 'hex')
  );
$$;
revoke all on function public.cf_secreto_ok(text, text) from public, anon, authenticated;

-- 1) Crear la orden (con la sesión del comprador: user_id = auth.uid()).
create or replace function public.cf_pago_crear(
  p_secret    text,
  p_pack_id   text,
  p_creditos  integer,
  p_monto_clp integer
)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_order text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  if p_creditos <= 0 or p_monto_clp <= 0 then raise exception 'bad_request'; end if;
  v_order := 'cf-' || replace(gen_random_uuid()::text, '-', '');
  insert into public.cf_pagos (commerce_order, user_id, pack_id, creditos, monto_clp)
  values (v_order, v_uid, p_pack_id, p_creditos, p_monto_clp);
  return v_order;
end;
$$;

-- 2) Guardar token/flowOrder cuando Flow acepta la orden.
create or replace function public.cf_pago_iniciar(
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
  update public.cf_pagos
     set flow_order = p_flow_order, flow_token = p_flow_token,
         estado = 'pendiente', actualizado_en = now()
   where commerce_order = p_commerce_order and estado = 'creado';
end;
$$;

-- 3) Confirmar (webhook o retorno). Idempotente. Solo 'pagado' abona créditos.
create or replace function public.cf_pago_confirmar(
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
  r       public.cf_pagos%rowtype;
  v_saldo integer;
begin
  if not public.cf_secreto_ok('pagos_secret_sha256', p_secret) then
    raise exception 'unauthorized';
  end if;
  if p_estado not in ('pendiente','pagado','rechazado','anulado') then
    raise exception 'bad_estado';
  end if;

  select * into r from public.cf_pagos where commerce_order = p_commerce_order for update;
  if not found then raise exception 'not_found'; end if;

  if r.estado = 'pagado' then
    select coalesce(sum(delta), 0) into v_saldo from public.cf_creditos where user_id = r.user_id;
    return jsonb_build_object('ok', true, 'ya_estaba', true, 'creditos', r.creditos, 'saldo', v_saldo);
  end if;

  if p_estado = 'pagado' then
    insert into public.cf_creditos (user_id, delta, motivo, descripcion, metadata)
    values (r.user_id, r.creditos, 'pack_purchased',
            'Compra de pack ' || r.pack_id || ' vía Flow',
            jsonb_build_object('commerce_order', r.commerce_order,
                               'flow_order', r.flow_order,
                               'monto_clp', r.monto_clp));
    update public.cf_pagos
       set estado = 'pagado', pagado_en = now(), actualizado_en = now(), payload = p_payload
     where commerce_order = p_commerce_order;
    select coalesce(sum(delta), 0) into v_saldo from public.cf_creditos where user_id = r.user_id;
    return jsonb_build_object('ok', true, 'creditos', r.creditos, 'saldo', v_saldo);
  end if;

  update public.cf_pagos
     set estado = p_estado, actualizado_en = now(), payload = p_payload
   where commerce_order = p_commerce_order;
  return jsonb_build_object('ok', true, 'estado', p_estado);
end;
$$;

revoke all on function public.cf_pago_crear(text, text, integer, integer)      from public, anon;
revoke all on function public.cf_pago_iniciar(text, text, bigint, text)         from public;
revoke all on function public.cf_pago_confirmar(text, text, text, jsonb)        from public;
grant execute on function public.cf_pago_crear(text, text, integer, integer)     to authenticated;
grant execute on function public.cf_pago_iniciar(text, text, bigint, text)        to anon, authenticated;
grant execute on function public.cf_pago_confirmar(text, text, text, jsonb)       to anon, authenticated;
