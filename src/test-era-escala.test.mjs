// Prueba de la escala del Test ERA: debe coincidir con los cortes de era-levels.js (3gi-platform).
// Lee las funciones calcEra/calcSub directamente de las páginas (están en un <script is:inline>).
// Uso: npm run test:era   |   ERA_ARCHIVOS=a.astro,b.astro npm run test:era (para probar otras versiones)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ARCHIVOS = (process.env.ERA_ARCHIVOS || 'src/pages/test-era.astro,src/pages/en/test-era.astro').split(',');
const BLOQUE = /(?:\/\/[^\n]*\n)*function eraIndice[\s\S]*?function calcSub\(score, total\) \{[^\n]*\}\n/;

function cargar(ruta) {
  const src = readFileSync(ruta, 'utf8');
  const m = src.match(/function calcEra\(score, total\) \{[\s\S]*?\n\}\n\s*function calcSub\(score, total\) \{[\s\S]*?\n\}\n|function eraIndice[\s\S]*?function calcSub\(score, total\) \{[^\n]*\}\n/);
  assert.ok(m, `${ruta}: no se encontró calcEra/calcSub`);
  const f = new Function(`${m[0]}; return { calcEra, calcSub };`)();
  return { f, texto: (src.match(BLOQUE) || [''])[0] };
}

// Puntaje de 5 preguntas (cada una 1 a 3) → nivel esperado según la escala 1-5 del framework.
const ESPERADO = { 5: 'ERA 1-', 6: 'ERA 1-', 7: 'ERA 1', 8: 'ERA 1+', 9: 'ERA 2-', 10: 'ERA 2',
  11: 'ERA 2+', 12: 'ERA 3-', 13: 'ERA 3', 14: 'ERA 3+', 15: 'ERA 3+' };

for (const ruta of ARCHIVOS) {
  const { f } = cargar(ruta);
  const nivel = (p) => `ERA ${f.calcEra(p, 5)}${f.calcSub(p, 5)}`;

  test(`${ruta}: cada puntaje da el nivel del framework`, () => {
    for (const [p, esperado] of Object.entries(ESPERADO)) assert.equal(nivel(Number(p)), esperado, `puntaje ${p}`);
  });

  test(`${ruta}: el nivel nunca baja cuando sube el puntaje`, () => {
    const orden = ['ERA 1-', 'ERA 1', 'ERA 1+', 'ERA 2-', 'ERA 2', 'ERA 2+', 'ERA 3-', 'ERA 3', 'ERA 3+'];
    let previo = -1;
    for (let p = 5; p <= 15; p++) {
      const i = orden.indexOf(nivel(p));
      assert.ok(i >= previo, `puntaje ${p} (${nivel(p)}) quedó bajo el anterior`);
      previo = i;
    }
  });

  test(`${ruta}: caso reportado (1,2,1,2,2 = 8 puntos) no es ERA 2+`, () => {
    assert.equal(nivel(1 + 2 + 1 + 2 + 2), 'ERA 1+');
  });
}

test('la versión ES y la EN usan exactamente el mismo cálculo', () => {
  if (ARCHIVOS.length < 2) return;
  const [a, b] = ARCHIVOS.map((r) => cargar(r).texto);
  assert.ok(a.length > 0, 'bloque no encontrado en ' + ARCHIVOS[0]);
  assert.equal(a, b);
});
