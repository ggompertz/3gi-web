-- Ejecutar cada query por separado en el SQL Editor de Supabase
-- Copiar el resultado y compartirlo para completar fix_security_advisories.sql

-- QUERY 1: definición de la vista v_pipeline_clientes
SELECT pg_get_viewdef('v_pipeline_clientes'::regclass, true);

-- QUERY 2: definición de la función match_memories
SELECT pg_get_functiondef('match_memories'::regproc);
