// Verifica que la copia local de la estructura del formulario «Preparación del Radar» coincide con la fuente
// (3gi-platform/workers/radar-previo-api/estructura). Función pura: la usan el build y la prueba.
import { createHash } from 'node:crypto';

export const sha256 = (texto) => createHash('sha256').update(texto, 'utf8').digest('hex');

/** `archivos`: {nombre: contenido}; `registro`: {nombre: sha256}. Lanza si falta, sobra o difiere algún hash. */
export function verificarHashes(archivos, registro) {
  const problemas = [];
  for (const [nombre, contenido] of Object.entries(archivos)) {
    if (!registro[nombre]) problemas.push(`${nombre}: no está en el registro`);
    else if (sha256(contenido) !== registro[nombre]) problemas.push(`${nombre}: el hash no coincide con el registrado`);
  }
  for (const nombre of Object.keys(registro)) if (!(nombre in archivos)) problemas.push(`${nombre}: está en el registro pero no se cargó`);
  if (problemas.length) {
    throw new Error(`RADAR_PREVIO_ESTRUCTURA_DESALINEADA — ${problemas.join('; ')}. Copia de nuevo los archivos de 3gi-platform/workers/radar-previo-api/estructura (ver docs/radar-previo.md).`);
  }
}

/** Une core + módulos en un índice (misma regla que indexarEstructura del Worker). */
export function combinar(estructuras) {
  const preguntas = {};
  const secciones = [];
  for (const e of estructuras) {
    for (const [id, def] of Object.entries(e.preguntas)) {
      if (preguntas[id]) throw new Error(`ID_DUPLICADO:${id}`);
      preguntas[id] = def;
    }
    if (e.inserta_despues) {
      const i = secciones.findIndex((s) => s.id === e.inserta_despues);
      if (i === -1) throw new Error(`SECCION_INEXISTENTE:${e.inserta_despues}`);
      secciones.splice(i + 1, 0, ...e.secciones.map((s) => ({ ...s, modulo: e.plantilla })));
    } else {
      secciones.push(...e.secciones);
    }
  }
  return { preguntas, secciones, obligatorias: Object.keys(preguntas).filter((id) => preguntas[id].obligatoria) };
}
