import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { radarPrevio, problemasDeCobertura, verificarCobertura } from './radar-previo.mjs';
import { combinar } from '../data/radar-previo/verificar.mjs';

const dir = fileURLToPath(new URL('../data/radar-previo/', import.meta.url));
const estructura = combinar(['core.v1.json', 'financiero.v1.json'].map((f) => JSON.parse(readFileSync(dir + f, 'utf8'))));
const copia = () => structuredClone(radarPrevio.es);

test('el diccionario ES cubre exactamente la estructura: 35 preguntas, todas las opciones y todas las secciones', () => {
  assert.deepEqual(problemasDeCobertura(estructura, radarPrevio.es), []);
  assert.doesNotThrow(() => verificarCobertura(estructura, radarPrevio.es));
});

test('control negativo: falta un título, una opción, un campo o una sección', () => {
  let d = copia(); delete d.preguntas.n10.titulo;
  assert.match(problemasDeCobertura(estructura, d).join(), /n10: falta el título/);
  d = copia(); delete d.preguntas.n10.opciones.excel;
  assert.match(problemasDeCobertura(estructura, d).join(), /n10: las opciones no coinciden/);
  d = copia(); delete d.preguntas.n02.campos.personas;
  assert.match(problemasDeCobertura(estructura, d).join(), /n02: los campos no coinciden/);
  d = copia(); delete d.secciones.sf;
  assert.match(problemasDeCobertura(estructura, d).join(), /sección sf/);
  assert.throws(() => verificarCobertura(estructura, d), /RADAR_PREVIO_TEXTOS_INCOMPLETOS/);
});

test('control negativo: sobra una pregunta, una opción o una sección en el diccionario', () => {
  let d = copia(); d.preguntas.n99 = { titulo: 'x' };
  assert.match(problemasDeCobertura(estructura, d).join(), /n99: sobra/);
  d = copia(); d.preguntas.n10.opciones.extra = 'x';
  assert.match(problemasDeCobertura(estructura, d).join(), /n10: las opciones no coinciden/);
  d = copia(); d.secciones.zz = { titulo: 'x', minutos: 1 };
  assert.match(problemasDeCobertura(estructura, d).join(), /sección zz: sobra/);
});

test('los textos no usan nomenclatura interna ni palabras prohibidas por las guardias del sitio', () => {
  const todo = JSON.stringify(radarPrevio.es);
  assert.doesNotMatch(todo, /\bF[1-5]\b|\bEtapas?\b|\bE[1-3]\b/);
  assert.doesNotMatch(todo, /diagn[oó]stic|diagnosis/i);
  assert.doesNotMatch(todo, /15 minutos|~\s?3 minutos|Post-?Scan|Pre-?Scan|Toolkit/i);
  assert.doesNotMatch(todo, /(?<![\p{L}])(acá|vos|tenés|querés|hacés|mirá|podés|decime|contame)(?![\p{L}])/iu);
});

test('la duración declarada (20 a 25 minutos) coincide con la suma de los minutos por sección', () => {
  const total = Object.values(radarPrevio.es.secciones).reduce((n, s) => n + s.minutos, 0);
  assert.ok(total >= 20 && total <= 28, `suma de minutos: ${total}`);
});
