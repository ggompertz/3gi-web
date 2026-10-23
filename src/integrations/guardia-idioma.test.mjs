// Pruebas de la guardia de idioma. Correr con: npm run test:guardia
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  razonesDeEspanol, quitarOmitidos, extraerTextos, revisarPar, autoprueba, CASOS_CONOCIDOS,
} from './guardia-idioma.mjs';

const doc = (lang, cuerpo, head = '') => `<!doctype html><html lang="${lang}"><head>${head}</head><body>${cuerpo}</body></html>`;

test('marca los errores reales del 2026-10-22', () => {
  for (const t of CASOS_CONOCIDOS.deben_marcarse) assert.ok(razonesDeEspanol(t).length, t);
});

test('no marca inglés correcto ni términos de marca', () => {
  for (const t of CASOS_CONOCIDOS.no_deben_marcarse) assert.deepEqual(razonesDeEspanol(t), [], t);
  for (const t of ['Radar Express', 'ERA Test', 'Flight Plan · Weeks 2–3', 'Autopilot', 'Visit our café in Santiago', 'Book a call']) {
    assert.deepEqual(razonesDeEspanol(t), [], t);
  }
});

test('marca ñ, ¿, ¡ y tildes', () => {
  assert.ok(razonesDeEspanol('Year 2024 diseño').length);
  assert.ok(razonesDeEspanol('¿Ready to start?').length);
  assert.ok(razonesDeEspanol('Our áreas').length);
});

test('quitarOmitidos respeta lang="es", translate="no" y en-row-orig, con anidados y vacíos', () => {
  const html = '<div><p lang="es">Texto de la institución</p><div class="x en-row-orig"><div>Título original en español</div></div><span translate="no">Gestión de datos</span><img alt="x" lang="es"><p>Visible text</p></div>';
  const t = extraerTextos(html).join(' | ');
  assert.ok(t.includes('Visible text'));
  assert.ok(!t.includes('institución') && !t.includes('Título original') && !t.includes('Gestión'));
  assert.equal(quitarOmitidos('<p>a</p>'), '<p>a</p>');
});

test('extraerTextos lee atributos, metadatos y JSON-LD', () => {
  const html = doc('en', '<button aria-label="Áreas de negocio">Go</button><script type="application/ld+json">{"description":"Consultoría para empresas"}</script>',
    '<title>Free ERA Test</title><meta name="description" content="Descripción de la página">');
  const t = extraerTextos(html);
  assert.ok(t.includes('Áreas de negocio'));
  assert.ok(t.includes('Consultoría para empresas'));
  assert.ok(t.includes('Descripción de la página'));
});

test('revisarPar detecta español dentro del inglés (diccionario y plantilla)', () => {
  const f = revisarPar('en/casos/index.html', doc('en', '<p><strong>Entregable:</strong> Score de Madurez IA, clasificación ERA</p><div>7 días</div>'), null);
  assert.ok(f.length >= 2, f.join('\n'));
});

test('revisarPar detecta texto idéntico al español (regresión: <html lang="es"> no debe vaciar la comparación)', () => {
  const es = doc('es', '<p>ROI proyectado a 12 meses</p>');
  const en = doc('en', '<p>ROI proyectado a 12 meses</p>');
  const f = revisarPar('en/casos/index.html', en, es);
  assert.ok(f.some((x) => x.includes('texto-identico-al-espanol')), f.join('\n'));
});

test('no marca coincidencias legítimas entre páginas', () => {
  const es = doc('es', '<p>Radar Express</p><p>3G Intelligence Chile SpA</p><p>Claude Code in Action · Introduction to Agent Skills — Anthropic</p><p>2026</p>');
  const en = doc('en', '<p>Radar Express</p><p>3G Intelligence Chile SpA</p><p>Claude Code in Action · Introduction to Agent Skills — Anthropic</p><p>2026</p>');
  assert.deepEqual(revisarPar('en/x/index.html', en, es), []);
});

test('español intencional marcado con lang="es" no falla', () => {
  const en = doc('en', '<p>Studied at <span lang="es">Fundación Telefónica España</span> in 2024.</p>');
  assert.deepEqual(revisarPar('en/nosotros/index.html', en, null), []);
});

test('la lista de permitidos exige el texto y la página', () => {
  const en = doc('en', '<p>tgi_consent (localStorage) key name</p>');
  const es = doc('es', '<p>tgi_consent (localStorage) key name</p>');
  assert.deepEqual(revisarPar('en/privacidad/index.html', en, es), []);
  assert.ok(revisarPar('en/otra/index.html', en, es).length);
});

test('la autoprueba pasa con el detector actual', () => {
  assert.doesNotThrow(() => autoprueba());
});

test('lee el mensaje precargado de los enlaces de WhatsApp y los mailto', () => {
  const es = doc('en', '<a href="https://wa.me/56900000000?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20el%20Radar">Write on WhatsApp</a>');
  const f = revisarPar('en/index.html', es, null);
  assert.ok(f.some((x) => x.includes('Hola, me interesa')), f.join('\n'));
  const ok = doc('en', "<a href=\"https://wa.me/56900000000?text=Hi%2C%20I'd%20like%20to%20learn%20more%20about%20Radar\">Write on WhatsApp</a>");
  assert.deepEqual(revisarPar('en/index.html', ok, null), []);
  const mail = doc('en', '<a href="mailto:x@y.cl?subject=Consulta%20sobre%20el%20Radar&amp;body=Hola%20equipo">Email</a>');
  assert.ok(revisarPar('en/index.html', mail, null).length);
});
