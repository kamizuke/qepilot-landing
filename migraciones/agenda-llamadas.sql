-- ============================================================
-- AGENDA DE DEMOS Y SEGUIMIENTO DE LLAMADAS · evidran.com/llamadas
-- Migración de la LANDING (repo qepilot-landing), no de la app.
-- Se aplica en el MISMO Supabase de la app (akyjdcjpkiummngokvmq),
-- pero estas tablas son del trabajo comercial: no forman parte del
-- producto, no van al instalador on-premise y no se anotan en
-- public._migraciones (ese registro es el contrato del instalador).
-- El rastro de esta migración es este fichero y
-- docs/agenda-llamadas-manual.md.
--
-- Pegar ENTERO en Supabase → SQL Editor → Run. Es idempotente.
-- Solo accede el servidor de la landing con la service key: RLS
-- activado SIN políticas (anon/authenticated no ven nada).
-- ============================================================

-- 1) Configuración de la agenda: una sola fila (id = 1).
--    horario = {"1":[["10:00","13:00"],["16:00","18:00"]], …}
--    (1 = lunes … 7 = domingo; horas peninsulares, Europe/Madrid).
create table if not exists public.agenda_config (
  id               smallint primary key default 1 check (id = 1),
  horario          jsonb not null default '{}'::jsonb,
  duracion_min     int not null default 30 check (duracion_min between 15 and 120),
  margen_min       int not null default 15 check (margen_min between 0 and 60),
  antelacion_horas int not null default 12 check (antelacion_horas between 0 and 168),
  dias_vista       int not null default 21 check (dias_vista between 1 and 90),
  enlace_reunion   text,               -- enlace fijo de Teams
  actualizado_en   timestamptz not null default now()
);
insert into public.agenda_config (id, horario)
values (1, '{"1":[["10:00","13:00"],["16:00","18:00"]],"2":[["10:00","13:00"],["16:00","18:00"]],"3":[["10:00","13:00"],["16:00","18:00"]],"4":[["10:00","13:00"],["16:00","18:00"]]}'::jsonb)
on conflict (id) do nothing;

-- 2) Bloqueos: ratos en los que no se dan demos (vacaciones, médico…).
create table if not exists public.agenda_bloqueo (
  id        uuid primary key default gen_random_uuid(),
  desde     timestamptz not null,
  hasta     timestamptz not null,
  motivo    text,
  creado_en timestamptz not null default now(),
  check (hasta > desde)
);

-- 3) Contactos a los que llama la setter (los carga Lissette).
create table if not exists public.seg_contacto (
  id             uuid primary key default gen_random_uuid(),
  empresa        text not null,
  persona        text,
  cargo          text,
  telefono       text,
  email          text,
  web            text,
  ciudad         text,
  origen         text,                 -- de dónde sale (Apollo, ENAC…) y por qué encaja
  notas          text,                 -- lo que se va sabiendo de la empresa
  resultado      text check (resultado in
                   ('demo','volver','info','no_contesta','no_esta',
                    'no_interesa','herramienta_propia','no_encaja','no_llamar','erroneo')),
  intentos       int not null default 0,
  ultima_llamada timestamptz,
  volver_en      timestamptz,          -- solo con resultado «volver»
  no_llamar      boolean not null default false,
  cita_id        uuid,
  creado_en      timestamptz not null default now()
);
create index if not exists seg_contacto_resultado_idx on public.seg_contacto (resultado);

-- 4) Citas de demo. El token del enlace «cambiar o cancelar» que recibe
--    la persona por correo se guarda con hash (sha256), nunca en claro.
create table if not exists public.agenda_cita (
  id           uuid primary key default gen_random_uuid(),
  inicio       timestamptz not null,
  fin          timestamptz not null,
  nombre       text not null,
  empresa      text,
  email        text not null,
  telefono     text,
  notas        text,                   -- normas, herramienta actual, qué le preocupa…
  origen       text not null default 'setter' check (origen in ('setter','admin','web')),
  contacto_id  uuid references public.seg_contacto(id) on delete set null,
  estado       text not null default 'confirmada' check (estado in ('confirmada','cancelada')),
  token_hash   text not null unique,
  secuencia    int not null default 0, -- versión de la invitación de calendario
  creada_en    timestamptz not null default now(),
  cancelada_en timestamptz,
  cancelada_por text,
  check (fin > inicio)
);
create index if not exists agenda_cita_inicio_idx on public.agenda_cita (inicio) where estado = 'confirmada';

-- 5) Cada intento de llamada (es lo que cuenta para el pago de la setter).
--    Si se borra el contacto, el intento queda (sin nota) para que el
--    recuento no cambie.
create table if not exists public.seg_llamada (
  id          uuid primary key default gen_random_uuid(),
  contacto_id uuid references public.seg_contacto(id) on delete set null,
  hecha_en    timestamptz not null default now(),
  resultado   text not null check (resultado in
                ('demo','volver','info','no_contesta','no_esta',
                 'no_interesa','herramienta_propia','no_encaja','no_llamar','erroneo')),
  nota        text,
  rol         text not null check (rol in ('setter','admin'))
);
create index if not exists seg_llamada_contacto_idx on public.seg_llamada (contacto_id);
create index if not exists seg_llamada_fecha_idx on public.seg_llamada (hecha_en);

-- 6) RLS sin políticas: solo la service key del servidor.
alter table public.agenda_config  enable row level security;
alter table public.agenda_bloqueo enable row level security;
alter table public.seg_contacto   enable row level security;
alter table public.agenda_cita    enable row level security;
alter table public.seg_llamada    enable row level security;
revoke all on public.agenda_config  from anon, authenticated;
revoke all on public.agenda_bloqueo from anon, authenticated;
revoke all on public.seg_contacto   from anon, authenticated;
revoke all on public.agenda_cita    from anon, authenticated;
revoke all on public.seg_llamada    from anon, authenticated;

-- 7) ¿Choca [p_inicio, p_fin) con otra cita (más el margen) o con un
--    bloqueo? Uso interno de las funciones de abajo.
create or replace function public.agenda_choque(
  p_inicio timestamptz, p_fin timestamptz, p_margen_min int, p_excepto uuid
) returns text
language sql
stable
set search_path = public, pg_temp
as $$
  select case
    when exists (
      select 1 from public.agenda_cita c
       where c.estado = 'confirmada'
         and (p_excepto is null or c.id <> p_excepto)
         and c.inicio - make_interval(mins => p_margen_min) < p_fin
         and c.fin + make_interval(mins => p_margen_min) > p_inicio
    ) then 'hueco_ocupado'
    when exists (
      select 1 from public.agenda_bloqueo b
       where b.desde < p_fin and b.hasta > p_inicio
    ) then 'hueco_bloqueado'
    else null
  end
$$;

-- 8) Reservar: con candado para que dos personas no se queden el mismo
--    hueco. Si viene de un contacto, anota la llamada «demo» en la misma
--    transacción.
create or replace function public.agenda_reservar(
  p_inicio     timestamptz,
  p_fin        timestamptz,
  p_margen_min int,
  p_nombre     text,
  p_empresa    text,
  p_email      text,
  p_telefono   text,
  p_notas      text,
  p_origen     text,
  p_contacto   uuid,
  p_token_hash text,
  p_rol        text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_choque text;
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('agenda_cita'));
  v_choque := public.agenda_choque(p_inicio, p_fin, p_margen_min, null);
  if v_choque is not null then
    raise exception '%', v_choque using errcode = 'P0001';
  end if;
  insert into public.agenda_cita
    (inicio, fin, nombre, empresa, email, telefono, notas, origen, contacto_id, token_hash)
  values
    (p_inicio, p_fin, p_nombre, p_empresa, p_email, p_telefono, p_notas, p_origen, p_contacto, p_token_hash)
  returning id into v_id;
  if p_contacto is not null then
    insert into public.seg_llamada (contacto_id, resultado, rol)
    values (p_contacto, 'demo', p_rol);
    update public.seg_contacto
       set resultado = 'demo', intentos = intentos + 1, ultima_llamada = now(),
           volver_en = null, cita_id = v_id
     where id = p_contacto;
  end if;
  return v_id;
end $$;

-- 9) Cambiar la hora de una cita confirmada (mismo candado).
create or replace function public.agenda_mover(
  p_id uuid, p_inicio timestamptz, p_fin timestamptz, p_margen_min int
) returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_choque text;
  v_sec int;
begin
  perform pg_advisory_xact_lock(hashtext('agenda_cita'));
  v_choque := public.agenda_choque(p_inicio, p_fin, p_margen_min, p_id);
  if v_choque is not null then
    raise exception '%', v_choque using errcode = 'P0001';
  end if;
  update public.agenda_cita
     set inicio = p_inicio, fin = p_fin, secuencia = secuencia + 1
   where id = p_id and estado = 'confirmada'
  returning secuencia into v_sec;
  if v_sec is null then
    raise exception 'cita_no_disponible' using errcode = 'P0001';
  end if;
  return v_sec;
end $$;

-- 10) Cancelar. El contacto vuelve a la cola de «volver a llamar».
create or replace function public.agenda_cancelar(p_id uuid, p_por text)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_sec int;
  v_contacto uuid;
begin
  update public.agenda_cita
     set estado = 'cancelada', secuencia = secuencia + 1,
         cancelada_en = now(), cancelada_por = p_por
   where id = p_id and estado = 'confirmada'
  returning secuencia, contacto_id into v_sec, v_contacto;
  if v_sec is null then
    raise exception 'cita_no_disponible' using errcode = 'P0001';
  end if;
  if v_contacto is not null then
    update public.seg_contacto
       set resultado = 'volver', volver_en = now(), cita_id = null
     where id = v_contacto and cita_id = p_id;
  end if;
  return v_sec;
end $$;

-- 11) Anotar un intento de llamada y dejar el contacto al día.
create or replace function public.seg_registrar_llamada(
  p_contacto uuid, p_resultado text, p_nota text, p_volver_en timestamptz, p_rol text
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from public.seg_contacto where id = p_contacto) then
    raise exception 'contacto_no_existe' using errcode = 'P0001';
  end if;
  insert into public.seg_llamada (contacto_id, resultado, nota, rol)
  values (p_contacto, p_resultado, nullif(btrim(p_nota), ''), p_rol);
  update public.seg_contacto
     set resultado = p_resultado,
         intentos = intentos + 1,
         ultima_llamada = now(),
         volver_en = case when p_resultado = 'volver' then p_volver_en else null end,
         no_llamar = no_llamar or p_resultado = 'no_llamar'
   where id = p_contacto;
end $$;

-- 12) Borrar un contacto y sus datos: las notas de sus llamadas se
--     vacían; el intento queda (sin datos personales) para el recuento.
create or replace function public.seg_borrar_contacto(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.seg_llamada set nota = null where contacto_id = p_id;
  delete from public.seg_contacto where id = p_id;
end $$;

revoke all on function public.agenda_choque(timestamptz, timestamptz, int, uuid) from public, anon, authenticated;
revoke all on function public.agenda_reservar(timestamptz, timestamptz, int, text, text, text, text, text, text, uuid, text, text) from public, anon, authenticated;
revoke all on function public.agenda_mover(uuid, timestamptz, timestamptz, int) from public, anon, authenticated;
revoke all on function public.agenda_cancelar(uuid, text) from public, anon, authenticated;
revoke all on function public.seg_registrar_llamada(uuid, text, text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.seg_borrar_contacto(uuid) from public, anon, authenticated;

-- 13) (29 oct) Nuevo resultado «herramienta_propia»: ya tienen o están
--     desarrollando su propia herramienta. Para bases creadas antes.
alter table public.seg_contacto drop constraint if exists seg_contacto_resultado_check;
alter table public.seg_contacto add constraint seg_contacto_resultado_check check (resultado in
  ('demo','volver','info','no_contesta','no_esta','no_interesa','herramienta_propia','no_encaja','no_llamar','erroneo'));
alter table public.seg_llamada drop constraint if exists seg_llamada_resultado_check;
alter table public.seg_llamada add constraint seg_llamada_resultado_check check (resultado in
  ('demo','volver','info','no_contesta','no_esta','no_interesa','herramienta_propia','no_encaja','no_llamar','erroneo'));
