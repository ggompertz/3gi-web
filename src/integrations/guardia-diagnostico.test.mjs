// Pruebas de la guardia de nomenclatura. Correr con: npm run test:guardia
import test from 'node:test';
import assert from 'node:assert/strict';
import { revisarPagina, excepcionPara, autoprueba, CASOS, PAGINAS_TEST_ERA } from './guardia-diagnostico.mjs';

const doc = (cuerpo, head = '') => `<!doctype html><html lang="es"><head>${head}</head><body>${cuerpo}</body></html>`;
const nada = { permitidos: [] };

test('marca los usos que nombran un servicio', () => {
  for (const [pagina, t] of CASOS.deben_marcarse) assert.ok(revisarPagina(pagina, doc(`<p>${t}</p>`), nada).length, t);
});

test('no marca texto correcto', () => {
  for (const [pagina, t] of CASOS.no_deben_marcarse) assert.deepEqual(revisarPagina(pagina, doc(`<p>${t}</p>`), nada), [], t);
  assert.deepEqual(revisarPagina('index.html', doc('<p>Radar, Plan de Vuelo y ERA Test</p>'), nada), []);
});

test('revisa título, metadatos, atributos, JSON-LD y mensajes de wa.me/mailto', () => {
  const head = '<title>Free ERA Diagnostic</title><meta name="description" content="AI diagnosis for SMBs">';
  assert.ok(revisarPagina('en/x/index.html', doc('<p>ok</p>', head), nada).length >= 2);
  assert.ok(revisarPagina('x/index.html', doc('<button aria-label="Hacer el diagnóstico">Go</button>'), nada).length);
  assert.ok(revisarPagina('x/index.html', doc('<script type="application/ld+json">{"name":"¿Cuánto cuesta el diagnóstico de IA?"}</script>'), nada).length);
  assert.ok(revisarPagina('x/index.html', doc('<a href="https://wa.me/1?text=Quiero%20el%20diagn%C3%B3stico">w</a>'), nada).length);
  assert.ok(revisarPagina('x/index.html', doc('<a href="mailto:a@b.cl?subject=Mi%20diagn%C3%B3stico">m</a>'), nada).length);
});

test('detecta diagnostic, diagnostics, diagnóstico, diagnósticos y diagnosis en cualquier capitalización', () => {
  for (const w of ['diagnostic', 'Diagnostics', 'DIAGNÓSTICO', 'diagnósticos', 'Diagnosis', 'diagnostica']) {
    assert.ok(revisarPagina('x/index.html', doc(`<p>Texto con ${w} dentro</p>`), nada).length, w);
  }
});

test('una excepción exige página y fragmento, y no distingue mayúsculas', () => {
  const perm = [{ pagina: 'casos/index.html', texto: 'Antes de este diagnóstico', motivo: 'cita de un cliente' }];
  const html = doc('<p>"Antes de este DIAGNÓSTICO no teníamos claridad"</p>');
  assert.deepEqual(revisarPagina('casos/index.html', html, { permitidos: perm }), []);
  assert.ok(revisarPagina('faq/index.html', html, { permitidos: perm }).length, 'otra página no hereda la excepción');
  assert.ok(revisarPagina('casos/index.html', doc('<p>Nuestro diagnóstico gratuito</p>'), { permitidos: perm }).length, 'otro texto en la misma página sí falla');
});

test('las páginas del Test ERA NO admiten excepciones', () => {
  for (const pagina of PAGINAS_TEST_ERA) {
    const perm = [{ pagina, texto: 'diagnóstico', motivo: 'intento' }, { pagina: '*', texto: 'diagnóstico', motivo: 'intento' }];
    assert.ok(revisarPagina(pagina, doc('<p>Tu diagnóstico ERA</p>'), { permitidos: perm }).length, pagina);
    assert.equal(excepcionPara(pagina, 'Tu diagnóstico ERA', perm), null);
  }
});

test('las excepciones usadas se registran para avisar de las obsoletas', () => {
  const perm = [{ pagina: 'a/index.html', texto: 'diagnóstico', motivo: 'x' }, { pagina: 'b/index.html', texto: 'diagnóstico', motivo: 'y' }];
  const usadas = new Set();
  revisarPagina('a/index.html', doc('<p>un diagnóstico</p>'), { permitidos: perm, usadas });
  assert.equal(usadas.size, 1);
  assert.ok(usadas.has(perm[0]));
});

test('la autoprueba pasa con el detector actual', () => {
  assert.doesNotThrow(() => autoprueba());
});
