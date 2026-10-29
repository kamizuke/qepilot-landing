-- ============================================================
-- SALA DEL DECK · evidran.com/d/<enlace>
-- Migración de la LANDING (repo qepilot-landing), no de la app.
-- Se aplica en el MISMO Supabase de la app (akyjdcjpkiummngokvmq),
-- pero estas tablas son del material comercial: no forman parte del
-- producto, no van al instalador on-premise y no se anotan en
-- public._migraciones (ese registro es el contrato del instalador).
-- El rastro de esta migración es este fichero y docs/sala-deck-manual.md.
--
-- Pegar ENTERO en Supabase → SQL Editor → Run. Es idempotente.
-- Solo accede el servidor de la landing con la service key: RLS
-- activado SIN políticas, igual que _migraciones (anon/authenticated
-- no ven nada).
-- ============================================================

-- 1) Bucket privado para los PDF (el panel lo lista; se sube desde
--    Supabase → Storage → decks → Upload file).
insert into storage.buckets (id, name, public)
values ('decks', 'decks', false)
on conflict (id) do nothing;

-- 2) Documentos: cada PDF registrado (deck, propuesta, dossier…).
create table if not exists public.deck_documento (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  archivo     text not null,          -- ruta dentro del bucket decks
  num_paginas int,                    -- lo aprende el visor en la primera lectura
  creado_en   timestamptz not null default now()
);

-- 3) Enlaces: uno por persona/fondo/cliente. token = la parte secreta
--    de la URL (/d/<token>); la clave va aparte, con hash (scrypt).
create table if not exists public.deck_enlace (
  id            uuid primary key default gen_random_uuid(),
  documento_id  uuid not null references public.deck_documento(id) on delete cascade,
  token         text not null unique,
  destinatario  text not null,        -- nombre de la persona (y marca de agua)
  empresa       text,
  nota          text,
  clave_hash    text not null,
  clave_salt    text not null,
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);
create index if not exists deck_enlace_documento_idx on public.deck_enlace (documento_id);

-- 4) Visitas: cada vez que alguien entra con la clave correcta.
create table if not exists public.deck_visita (
  id               uuid primary key default gen_random_uuid(),
  enlace_id        uuid not null references public.deck_enlace(id) on delete cascade,
  iniciada_en      timestamptz not null default now(),
  ultima_actividad timestamptz not null default now(),
  agente           text,               -- navegador/dispositivo, sin IP
  pagina_max       int not null default 0
);
create index if not exists deck_visita_enlace_idx on public.deck_visita (enlace_id);

-- 5) Lectura: milisegundos acumulados por página y visita.
create table if not exists public.deck_lectura (
  visita_id uuid not null references public.deck_visita(id) on delete cascade,
  pagina    int not null,
  ms        bigint not null default 0,
  primary key (visita_id, pagina)
);

-- 6) RLS sin políticas: nadie con la clave pública (anon/authenticated)
--    puede leer ni escribir; solo la service key del servidor.
alter table public.deck_documento enable row level security;
alter table public.deck_enlace    enable row level security;
alter table public.deck_visita    enable row level security;
alter table public.deck_lectura   enable row level security;
revoke all on public.deck_documento from anon, authenticated;
revoke all on public.deck_enlace    from anon, authenticated;
revoke all on public.deck_visita    from anon, authenticated;
revoke all on public.deck_lectura   from anon, authenticated;

-- 7) RPC transaccional del latido de lectura: suma los milisegundos de
--    varias páginas de una vez y actualiza la visita, todo en una llamada.
create or replace function public.deck_registrar_lectura(
  p_visita  uuid,
  p_eventos jsonb                      -- [{"pagina":3,"ms":5200}, …]
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  ev jsonb;
  v_max int := 0;
begin
  if p_eventos is null or jsonb_typeof(p_eventos) <> 'array' then
    return;
  end if;
  for ev in select * from jsonb_array_elements(p_eventos) loop
    if (ev->>'pagina') ~ '^[0-9]+$' and (ev->>'ms') ~ '^[0-9]+$' then
      insert into public.deck_lectura (visita_id, pagina, ms)
      values (p_visita, (ev->>'pagina')::int, least((ev->>'ms')::bigint, 600000))
      on conflict (visita_id, pagina)
      do update set ms = public.deck_lectura.ms + excluded.ms;
      v_max := greatest(v_max, (ev->>'pagina')::int);
    end if;
  end loop;
  update public.deck_visita
     set ultima_actividad = now(),
         pagina_max = greatest(pagina_max, v_max)
   where id = p_visita;
end $$;
revoke all on function public.deck_registrar_lectura(uuid, jsonb) from public, anon, authenticated;
