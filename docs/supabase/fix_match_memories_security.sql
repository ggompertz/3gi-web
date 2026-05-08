-- Fix: match_memories con search_path fijo
-- Advisory: Function with mutable search_path
-- Ejecutar en Supabase SQL Editor: rfvhiuyqtfpqzjwpumav.supabase.co

CREATE OR REPLACE FUNCTION public.match_memories(
  query_embedding extensions.vector,
  match_count integer DEFAULT 5,
  filter_cliente text DEFAULT NULL::text
)
RETURNS TABLE(id uuid, cliente text, categoria text, contenido text, metadata jsonb, similarity double precision)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT
    id, cliente, categoria, contenido, metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM memory_entries
  WHERE
    (filter_cliente IS NULL OR cliente = filter_cliente)
    AND embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
