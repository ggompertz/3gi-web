-- Tabla: prospectos_seguimiento
-- Ejecutar en Supabase SQL Editor: rfvhiuyqtfpqzjwpumav.supabase.co

CREATE TABLE prospectos_seguimiento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostico_id UUID REFERENCES diagnostico_completions(id) ON DELETE SET NULL,
  nombre TEXT,
  email TEXT NOT NULL,
  empresa TEXT,
  pais TEXT,

  -- Estado del seguimiento
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','contactado','respondio','en_proceso','propuesta_enviada','cerrado_ganado','cerrado_perdido','descartado')),

  -- Interaccion
  canal TEXT CHECK (canal IN ('email','linkedin','whatsapp','llamada','otro')),
  fecha_contacto TIMESTAMPTZ,
  notas TEXT,
  proximo_paso TEXT,
  fecha_proximo_paso DATE,

  -- Metadata
  era_diagnostico TEXT,
  fuente TEXT DEFAULT 'diagnostico_web',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospectos_seguimiento_updated_at
  BEFORE UPDATE ON prospectos_seguimiento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE prospectos_seguimiento ENABLE ROW LEVEL SECURITY;
