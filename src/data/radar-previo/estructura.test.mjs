import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verificarHashes, combinar, sha256 } from './verificar.mjs';

const dir = fileURLToPath(new URL('./', import.meta.url));
const leer = (f) => readFileSync(dir + f, 'utf8');
const archivos = () => ({ 'core.v1.json': leer('core.v1.json'), 'financiero.v1.json': leer('financiero.v1.json') });
const registro = () => JSON.parse(leer('estructura.sha256.json'));

test('la copia local coincide con el registro de hashes de la fuente', () => {
  assert.doesNotThrow(() => verificarHashes(archivos(), registro()));
});

test('control negativo: un cambio de un solo carácter hace fallar la verificación', () => {
  const a = archivos();
  a['core.v1.json'] = a['core.v1.json'].replace('"n01"', '"n01 "');
  assert.throws(() => verificarHashes(a, registro()), /RADAR_PREVIO_ESTRUCTURA_DESALINEADA.*core\.v1\.json/);
});

test('control negativo: faltan o sobran archivos respecto del registro', () => {
  const a = archivos(); delete a['financiero.v1.json'];
  assert.throws(() => verificarHashes(a, registro()), /financiero\.v1\.json: está en el registro pero no se cargó/);
  assert.throws(() => verificarHashes({ ...archivos(), 'extra.json': '{}' }, registro()), /extra\.json: no está en el registro/);
});

test('combinar: 39 preguntas (35 + 4 acompañantes de «Otro»), el módulo financiero va después de la sección 4 y las obligatorias son seis más los 4 acompañantes', () => {
  const e = combinar(Object.values(archivos()).map((t) => JSON.parse(t)));
  assert.equal(Object.keys(e.preguntas).length, 39);
  assert.deepEqual(e.secciones.map((s) => s.id), ['s1', 's2', 's3', 's4', 'sf', 's5', 's6', 's7']);
  assert.equal(e.secciones.find((s) => s.id === 'sf').modulo, 'financiero');
  assert.deepEqual([...e.obligatorias].sort(), ['n01', 'n02', 'n06', 'n09', 'n10', 'n10o', 'n13o', 'n15o', 'n26', 'n05q'].sort());
  assert.equal(JSON.parse(archivos()['core.v1.json']).version, '1.2.0');
});

test('sha256 es el hash estándar', () => {
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
