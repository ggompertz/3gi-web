-- =============================================================
-- Fix advertencias de seguridad Supabase — 3G Intelligence
-- Ejecutar en SQL Editor: rfvhiuyqtfpqzjwpumav.supabase.co
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- PASO 1: Ver definición actual de v_pipeline_clientes
-- (copiar el resultado antes de ejecutar el fix de la vista)
-- ─────────────────────────────────────────────────────────────
-- SELECT pg_get_viewdef('v_pipeline_clientes'::regclass, true);
-- SELECT pg_get_functiondef('match_memories'::regproc);


-- ─────────────────────────────────────────────────────────────
-- FIX 1: Extensión vector — mover de public a extensions
-- ─────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;


-- ─────────────────────────────────────────────────────────────
-- FIX 2: update_updated_at — fijar search_path
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS 4035000
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
4035000;


-- ─────────────────────────────────────────────────────────────
-- FIX 3: rls_auto_enable — revocar acceso anon y cambiar a SECURITY INVOKER
-- Es una función trigger: no puede ejecutarse directamente,
-- pero igual debe estar protegida.
-- ─────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;


-- ─────────────────────────────────────────────────────────────
-- FIX 4: v_pipeline_clientes — SECURITY INVOKER
-- PENDIENTE: ejecutar primero el PASO 1 y pegar el SELECT aquí
-- ─────────────────────────────────────────────────────────────
-- CREATE OR REPLACE VIEW public.v_pipeline_clientes
-- WITH (security_invoker = true)
-- AS
-- << PEGAR RESULTADO DEL SELECT pg_get_viewdef >>;


-- ─────────────────────────────────────────────────────────────
-- FIX 5: match_memories — fijar search_path
-- PENDIENTE: ejecutar primero el PASO 1 y pegar la definición aquí
-- con SET search_path = public, extensions agregado
-- ─────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────
-- FIX 6: Leaked Password Protection
-- No requiere SQL — activar en:
-- Authentication > Providers > Email > Leaked Password Protection
-- ─────────────────────────────────────────────────────────────
