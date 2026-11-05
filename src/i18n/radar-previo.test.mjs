import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { radarPrevio, problemasDeCobertura, verificarCobertura } from './radar-previo.mjs';
import { combinar } from '../data/radar-previo/verificar.mjs';
import { razonesDeEspanol } from '../integrations/guardia-idioma.mjs';

const dir = fileURLToPath(new URL('../data/radar-previo/', import.meta.url));
const estructura = combinar(['core.v1.json', 'financiero.v1.json'].map((f) => JSON.parse(readFileSync(dir + f, 'utf8'))));
const copia = (l = 'es') => structuredClone(radarPrevio[l]);
const IDIOMAS = ['es', 'en'];

/** Aplana un diccionario a {ruta: texto}. */
function aplanar(o, pref = '', out = {}) {
  for (const [k, v] of Object.entries(o)) (typeof v === 'string' ? (out[pref + k] = v) : aplanar(v, `${pref}${k}.`, out));
  return out;
}
const textos = (l) => aplanar(radarPrevio[l]);

for (const l of IDIOMAS) {
  test(`[${l}] el diccionario cubre exactamente la estructura: 35 preguntas, todas las opciones y todas las secciones`, () => {
    assert.deepEqual(problemasDeCobertura(estructura, radarPrevio[l]), []);
    assert.doesNotThrow(() => verificarCobertura(estructura, radarPrevio[l]));
  });

  test(`[${l}] los textos no usan nomenclatura interna ni palabras prohibidas por las guardias del sitio`, () => {
    const todo = JSON.stringify(radarPrevio[l]);
    assert.doesNotMatch(todo, /\bF[1-5]\b|\bEtapas?\b|\bE[1-3]\b/);
    assert.doesNotMatch(todo, /diagn[oó]stic|diagnosis/i);
    assert.doesNotMatch(todo, /15 minutos|15-minute|~\s?3 minutos|Post-?Scan|Pre-?Scan|Toolkit/i);
    assert.doesNotMatch(todo, /(?<![\p{L}])(acá|vos|tenés|querés|hacés|mirá|podés|decime|contame)(?![\p{L}])/iu);
  });

  test(`[${l}] la duración declarada (20 a 25 minutos) coincide con la suma de los minutos por sección`, () => {
    const total = Object.values(radarPrevio[l].secciones).reduce((n, s) => n + s.minutos, 0);
    assert.ok(total >= 20 && total <= 28, `suma de minutos: ${total}`);
  });
}

test('control negativo: falta un título, una opción, un campo o una sección', () => {
  for (const l of IDIOMAS) {
    let d = copia(l); delete d.preguntas.n10.titulo;
    assert.match(problemasDeCobertura(estructura, d).join(), /n10: falta el título/);
    d = copia(l); delete d.preguntas.n10.opciones.excel;
    assert.match(problemasDeCobertura(estructura, d).join(), /n10: las opciones no coinciden/);
    d = copia(l); delete d.preguntas.n02.campos.personas;
    assert.match(problemasDeCobertura(estructura, d).join(), /n02: los campos no coinciden/);
    d = copia(l); delete d.secciones.sf;
    assert.match(problemasDeCobertura(estructura, d).join(), /sección sf/);
    assert.throws(() => verificarCobertura(estructura, d), /RADAR_PREVIO_TEXTOS_INCOMPLETOS/);
  }
});

test('control negativo: sobra una pregunta, una opción o una sección en el diccionario', () => {
  for (const l of IDIOMAS) {
    let d = copia(l); d.preguntas.n99 = { titulo: 'x' };
    assert.match(problemasDeCobertura(estructura, d).join(), /n99: sobra/);
    d = copia(l); d.preguntas.n10.opciones.extra = 'x';
    assert.match(problemasDeCobertura(estructura, d).join(), /n10: las opciones no coinciden/);
    d = copia(l); d.secciones.zz = { titulo: 'x', minutos: 1 };
    assert.match(problemasDeCobertura(estructura, d).join(), /sección zz: sobra/);
  }
});

// ── Español ↔ inglés ──────────────────────────────────────────────────────────
test('paridad: ES y EN tienen exactamente las mismas claves de interfaz, secciones, preguntas, opciones y campos', () => {
  assert.deepEqual(Object.keys(textos('en')).sort(), Object.keys(textos('es')).sort());
  for (const l of IDIOMAS) assert.ok(radarPrevio[l].enlaces.privacidad.startsWith(l === 'en' ? '/en/' : '/'), `enlace de privacidad ${l}`);
  for (const id of Object.keys(radarPrevio.es.secciones)) assert.equal(radarPrevio.en.secciones[id].minutos, radarPrevio.es.secciones[id].minutos);
});

test('el inglés no contiene español: mismo detector que la guardia de idioma del build', () => {
  const malos = Object.entries(textos('en')).map(([k, v]) => [k, razonesDeEspanol(v)]).filter(([, r]) => r.length);
  assert.deepEqual(malos, []);
});

test('el detector de español marca frases en español (autoprueba: si no las ve, la prueba anterior no vale)', () => {
  for (const frase of ['Revisa antes de enviar', 'Sin conexión. Tus cambios siguen en esta pantalla', '¿Cuántos clientes activos tienes?', 'Cumplimiento normativo para las empresas']) {
    assert.ok(razonesDeEspanol(frase).length > 0, `no marcó: ${frase}`);
  }
  assert.deepEqual(razonesDeEspanol('Saved'), []);
});

// Límite conocido de la guardia del build: no ve una palabra suelta sin tildes («Guardado», «Siguiente»). Esta prueba lo cubre.
const IGUALES_PERMITIDOS = new Set(['~{m} min', 'chat@3gi.cl', 'Marketing', 'WhatsApp', 'No', 'Instagram', 'LinkedIn']);
const sinTraducir = (en, es) => Object.keys(es).filter((k) => es[k] === en[k] && !IGUALES_PERMITIDOS.has(es[k]));

test('el inglés no deja textos sin traducir: ninguno es idéntico al español salvo nombres propios y «No»', () => {
  assert.deepEqual(sinTraducir(textos('en'), textos('es')), []);
});

test('control negativo: una palabra suelta en español dentro del inglés sí se detecta (aunque la guardia del build no la vea)', () => {
  const en = textos('en'); en['ui.guardado'] = 'Guardado'; en['ui.siguiente'] = 'Siguiente';
  assert.deepEqual(razonesDeEspanol('Guardado'), [], 'si el detector llegara a verla, esta prueba ya no haría falta');
  assert.deepEqual(sinTraducir(en, textos('es')).sort(), ['ui.guardado', 'ui.siguiente']);
});

test('glosario de marca: «ERA Test» en inglés y «Test ERA» en español; Radar se conserva; ERA siempre en mayúsculas', () => {
  const en = JSON.stringify(radarPrevio.en); const es = JSON.stringify(radarPrevio.es);
  assert.match(en, /ERA Test/); assert.doesNotMatch(en, /Test ERA/);
  assert.match(es, /Test ERA/); assert.doesNotMatch(es, /ERA Test/);
  assert.match(en, /\bRadar\b/); assert.match(es, /\bRadar\b/);
  assert.doesNotMatch(`${en}${es}`, /\b[Ee]ra\b(?! de| en| a| que)/, 'ERA debe ir en mayúsculas');
});
