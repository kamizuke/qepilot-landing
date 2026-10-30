-- ============================================================
-- CALCULADORA DE HUELLA GRATUITA · evidran.com/huella
-- Migración de la LANDING (repo qepilot-landing), no de la app. Se aplica
-- en el MISMO Supabase de la app, pero estas tablas son del material
-- comercial: no van al instalador on-premise ni a public._migraciones.
-- Rastro: este fichero y docs/huella-calculadora-manual.md.
--
-- Pegar ENTERO en Supabase → SQL Editor → Run. Es idempotente.
-- Solo accede el servidor de la web con la service key: RLS sin políticas.
-- ============================================================

-- 1) Cálculos: los consumos y el resultado, SIN datos personales.
create table if not exists public.huella_calculo (
  id        uuid primary key default gen_random_uuid(),
  creado_en timestamptz not null default now(),
  anio      int not null,
  entrada   jsonb not null,           -- lo que escribió (combustibles, vehículos, electricidad)
  total_kg  numeric not null,
  a1_kg     numeric not null,
  a2_kg     numeric not null
);
create index if not exists huella_calculo_fecha_idx on public.huella_calculo (creado_en);

-- 2) Quien pide el informe. El token del enlace del correo se guarda con
--    hash (sha256). confirmado_en = cuando abrió el enlace (doble confirmación).
create table if not exists public.huella_contacto (
  id               uuid primary key default gen_random_uuid(),
  calculo_id       uuid not null references public.huella_calculo(id) on delete cascade,
  creado_en        timestamptz not null default now(),
  email            text not null,
  empresa          text not null,
  telefono         text,
  acepta_novedades boolean not null default false,  -- aviso anual y novedades de Evidran
  acepta_llamada   boolean not null default false,  -- que le llamen para enseñarle Evidran
  token_hash       text not null unique,
  confirmado_en    timestamptz,
  visitas_informe  int not null default 0,
  baja_en          timestamptz
);
create index if not exists huella_contacto_email_idx on public.huella_contacto (lower(email));

alter table public.huella_calculo  enable row level security;
alter table public.huella_contacto enable row level security;
revoke all on public.huella_calculo  from anon, authenticated;
revoke all on public.huella_contacto from anon, authenticated;
