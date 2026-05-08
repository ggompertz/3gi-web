-- =============================================================
-- Fix advertencias de seguridad Supabase — 3G Intelligence
-- Ejecutar en SQL Editor: rfvhiuyqtfpqzjwpumav.supabase.co
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- PASO 1: Ver definición actual de v_pipeline_clientes
-- (copiar el resultado antes de ejecutar el fix #2)
-- ─────────────────────────────────────────────────────────────
SELECT pg_get_viewdef('v_pipeline_clientes'::regclass, true);


-- ─────────────────────────────────────────────────────────────
-- FIX 1: Extensión vector — mover de public a extensions
-- ─────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;


-- ─────────────────────────────────────────────────────────────
-- FIX 2: v_pipeline_clientes — SECURITY INVOKER
-- IMPORTANTE: reemplazar el SELECT de abajo con el resultado
-- del PASO 1 antes de ejecutar.
-- ─────────────────────────────────────────────────────────────
-- CREATE OR REPLACE VIEW public.v_pipeline_clientes
-- WITH (security_invoker = true)
-- AS
-- << PEGAR AQUÍ EL RESULTADO DEL PASO 1 >>;


-- ─────────────────────────────────────────────────────────────
-- FIX 3: update_updated_at — fijar search_path
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS 4034508
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
4034508;


-- ─────────────────────────────────────────────────────────────
-- FIX 4: match_memories — fijar search_path
-- Ejecutar primero para ver la definición actual:
--   SELECT pg_get_functiondef('match_memories'::regproc);
-- Luego reemplazar el cuerpo abajo con el resultado.
-- ─────────────────────────────────────────────────────────────
-- Una vez que tengas la definición actual, agrega esta línea
-- al CREATE OR REPLACE FUNCTION match_memories:
--   SET search_path = public, extensions
-- (extensions porque usa la extensión vector)
--
-- Ejemplo de estructura esperada:
-- CREATE OR REPLACE FUNCTION public.match_memories(
--   query_embedding vector,
--   match_threshold float,
--   match_count int
-- )
-- RETURNS TABLE (...)
-- LANGUAGE plpgsql
-- SECURITY INVOKER
-- SET search_path = public, extensions
-- AS 4034508
--   << CUERPO ACTUAL >>
-- 4034508;
