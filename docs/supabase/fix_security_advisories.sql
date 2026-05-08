-- ============================================================
-- SUPABASE SECURITY ADVISORIES — FIXES
-- Proyecto: rfvhiuyqtfpqzjwpumav
-- Fecha: 2026-05-08
-- Ejecutar en orden en el SQL Editor de Supabase
-- ============================================================


-- ============================================================
-- FIX 1: Mover extensión vector fuera del schema public
-- Advisory: Extension "vector" in public schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;


-- ============================================================
-- FIX 2: Función update_updated_at — mutable search_path
-- Advisory: Function with mutable search_path
-- Recrear con SECURITY INVOKER + search_path fijo
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ============================================================
-- FIX 3: Revocar ejecución de rls_auto_enable a roles públicos
-- Advisory: Function callable by anon
-- (Es trigger function — nunca debería ser callable directamente)
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;


-- ============================================================
-- FIX 4: Vista v_pipeline_clientes — SECURITY DEFINER
-- Advisory: View with SECURITY DEFINER
-- INSTRUCCIÓN PREVIA (ejecutar separado, copiar resultado aquí):
--   SELECT pg_get_viewdef('v_pipeline_clientes'::regclass, true);
-- Luego recrear la vista con SECURITY INVOKER:
--   CREATE OR REPLACE VIEW public.v_pipeline_clientes
--   WITH (security_invoker = true) AS
--   <pegar resultado de pg_get_viewdef aquí>;
-- ============================================================
-- PENDIENTE: necesita definición actual de la vista


-- ============================================================
-- FIX 5: Función match_memories — mutable search_path
-- Advisory: Function with mutable search_path (usa vector/extensions)
-- INSTRUCCIÓN PREVIA (ejecutar separado, copiar resultado aquí):
--   SELECT pg_get_functiondef('match_memories'::regproc);
-- Luego recrear añadiendo al header:
--   SET search_path = public, extensions
-- ============================================================
-- PENDIENTE: necesita definición actual de la función


-- ============================================================
-- OPCIONAL (recomendado): Leaked Password Protection
-- Activar desde: Authentication → Providers → Email → toggle
-- "Leaked Password Protection" — no requiere SQL
-- ============================================================
