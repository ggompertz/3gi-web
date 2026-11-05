// Estructura de preguntas del formulario «Preparación del Radar» (ids, tipos, opciones por clave, condiciones).
// Los archivos .json son una COPIA de 3gi-platform/workers/radar-previo-api/estructura; si difieren de su registro de hashes,
// el build falla. Los textos NO viven aquí: están en src/i18n/radar-previo.mjs.
import coreRaw from './core.v1.json?raw';
import financieroRaw from './financiero.v1.json?raw';
import registroRaw from './estructura.sha256.json?raw';
import { verificarHashes, combinar } from './verificar.mjs';

verificarHashes({ 'core.v1.json': coreRaw, 'financiero.v1.json': financieroRaw }, JSON.parse(registroRaw));

export const estructura = combinar([JSON.parse(coreRaw), JSON.parse(financieroRaw)]);
