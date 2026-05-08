-- Fix: v_pipeline_clientes con SECURITY INVOKER en lugar de SECURITY DEFINER
-- Ejecutar en Supabase SQL Editor: rfvhiuyqtfpqzjwpumav.supabase.co
-- Referencia: https://supabase.com/docs/guides/database/database-advisors

-- Recrear la vista con SECURITY INVOKER (comportamiento por defecto y seguro)
CREATE OR REPLACE VIEW public.v_pipeline_clientes
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.empresa,
  c.sector,
  c.etapa_actual,
  c.score_madurez,
  c.era,
  c.recomendar_df,
  c.fecha_e0,
  c.toolkits_completados,
  c.total_oportunidades,
  c.oportunidades_alta,
  c.score_top_oportunidad,
  c.outputs_generados,
  c.algun_output_validado
FROM public.v_pipeline_clientes c;

-- Nota: si la vista tiene JOINs o lógica compleja, este script puede necesitar
-- ajustarse con la definicion completa. En ese caso ejecutar primero:
-- SELECT pg_get_viewdef('v_pipeline_clientes'::regclass, true);
-- para ver la definicion actual antes de reemplazarla.
