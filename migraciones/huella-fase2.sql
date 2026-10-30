-- ============================================================
-- CALCULADORA DE HUELLA · FASE 2 (30 oct 2026)
-- 1) Última actividad de cada contacto, para borrarlo a los 24 meses sin
--    actividad (lo hace el cron semanal de Vercel, ver vercel.json).
-- 2) «Contacto caliente» en la lista de llamadas: quien pide en la
--    calculadora que le llamen sale arriba en /llamadas.
-- Migración de la LANDING; mismo Supabase que la app. Idempotente.
-- Pegar ENTERO en Supabase → SQL Editor → Run, ANTES del Commit + Push.
-- ============================================================

alter table public.huella_contacto add column if not exists ultima_actividad timestamptz;
update public.huella_contacto
   set ultima_actividad = coalesce(confirmado_en, creado_en)
 where ultima_actividad is null;
alter table public.huella_contacto alter column ultima_actividad set default now();
alter table public.huella_contacto alter column ultima_actividad set not null;
create index if not exists huella_contacto_actividad_idx on public.huella_contacto (ultima_actividad);

-- Desde cuándo pidió que le llamaran; deja de ser «caliente» en cuanto
-- se anota una llamada posterior (ultima_llamada > caliente_desde).
alter table public.seg_contacto add column if not exists caliente_desde timestamptz;
