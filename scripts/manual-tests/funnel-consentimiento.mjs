#!/usr/bin/env node
/**
 * funnel-consentimiento.mjs — prueba manual (no CI) del registro del funnel según consentimiento.
 *
 * Cubre RF-01 a RF-05 y RF-07 de proyectos/3gi-web/2026-10-16/prd-funnel-consentimiento.md.
 * Corre contra un preview LOCAL (por defecto http://localhost:4399, `npm run build && npx astro preview --port 4399`).
 * Supabase (funnel_events) y los envíos de eventos de PostHog se interceptan: no se escribe nada en producción.
 *
 * Los casos que no son de bots ocultan navigator.webdriver y usan un User-Agent normal, porque
 * funnel-track.js descarta los navegadores automatizados (RF-04).
 *
 * Uso: node scripts/manual-tests/funnel-consentimiento.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:4399';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

let fallos = 0;
function check(nombre, ok, detalle = '') {
  console.log(`${ok ? 'OK   ' : 'FALLA'} ${nombre}${detalle ? ' · ' + detalle : ''}`);
  if (!ok) fallos++;
}

async function sesion({ consent = null, bot = false, initStorage = null } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(bot ? {} : { userAgent: UA });
  if (!bot) await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  if (consent) {
    await ctx.addInitScript((c) => localStorage.setItem('tgi_consent', JSON.stringify({ status: c, ts: 'x', v: 1 })), consent);
  }
  if (initStorage) await ctx.addInitScript((kv) => Object.entries(kv).forEach(([k, v]) => sessionStorage.setItem(k, v)), initStorage);
  const page = await ctx.newPage();
  const inserts = [];
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.route(/funnel_events/, async (route) => {
    try { inserts.push(JSON.parse(route.request().postData() || '{}')); } catch { /* ignorar */ }
    await route.fulfill({ status: 201, body: '' });
  });
  await page.route(/z\.3gi\.cl/, (route) =>
    route.request().method() === 'POST' ? route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":1}' }) : route.continue());
  return { browser, page, inserts, errores };
}

const claves = (page) => page.evaluate(() => ({ s: Object.keys(sessionStorage), l: Object.keys(localStorage) }));

// RF-01 y RF-03: sin decisión y con rechazo
for (const consent of [null, 'rejected']) {
  const etiqueta = consent ? 'rechazado' : 'sin decisión';
  const { browser, page, inserts, errores } = await sesion({ consent });
  await page.goto(`${BASE}/test-era/?src=pdf&lid=abc123&utm_source=li`, { waitUntil: 'load' });
  await page.evaluate(() => window.__funnelTrack('test_start'));
  await page.waitForTimeout(500);
  const k = await claves(page);
  check(`RF-01 ${etiqueta}: no se escribe _3gi_fsid ni _3gi_futm`, !k.s.includes('_3gi_fsid') && !k.s.includes('_3gi_futm'), JSON.stringify(k.s));
  check(`RF-01 ${etiqueta}: se envían eventos solo con utm_* (sin src)`, inserts.length >= 2 && inserts.every((e) => JSON.stringify(e.utm || {}) === '{"utm_source":"li"}'), `${inserts.length} eventos, ${JSON.stringify(inserts[0]?.utm)}`);
  check(`RF-01 ${etiqueta}: mismo ID dentro de la página`, new Set(inserts.map((e) => e.session_id)).size === 1);
  check(`RF-03 ${etiqueta}: lid no viaja`, !JSON.stringify(inserts).includes('abc123'));
  check(`RNF-01 ${etiqueta}: sin errores de consola`, errores.length === 0, errores.join(' | '));
  await browser.close();
}

// UTM sin consentimiento (opción B, 2026-10-19): solo utm_* válidos, de la URL actual, sin guardar nada
// RF-UTM-01 a RF-UTM-04 de proyectos/3gi-web/2026-10-19/prd-trd-utm-sin-consentimiento.md
for (const consent of [null, 'rejected']) {
  const etiqueta = consent ? 'rechazado' : 'sin decisión';
  {
    const { browser, page, inserts } = await sesion({ consent });
    await page.goto(`${BASE}/test-era/?utm_source=linkedin&utm_medium=paid_social&utm_campaign=test-era-visitas-2026-10&utm_content=a1&utm_term=t1&src=pdf&lid=abc123`, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const u = inserts[0]?.utm || {};
    const esperado = { utm_source: 'linkedin', utm_medium: 'paid_social', utm_campaign: 'test-era-visitas-2026-10', utm_content: 'a1', utm_term: 't1' };
    check(`RF-UTM-01 ${etiqueta}: el evento lleva los 5 utm_*`, inserts.length >= 1 && inserts.every((e) => JSON.stringify(e.utm) === JSON.stringify(esperado)), JSON.stringify(u));
    const k = await claves(page);
    check(`RF-UTM-02 ${etiqueta}: nada en localStorage (salvo la decisión) ni sessionStorage`, k.s.length === 0 && k.l.every((x) => x === 'tgi_consent'), JSON.stringify(k));
    check(`RF-UTM-03 ${etiqueta}: src y lid no viajan`, !('src' in u) && !JSON.stringify(inserts).includes('abc123') && !JSON.stringify(inserts).includes('pdf'), JSON.stringify(u));
    await browser.close();
  }
  {
    const largo = 'a'.repeat(65);
    const { browser, page, inserts } = await sesion({ consent });
    await page.goto(`${BASE}/test-era/?utm_source=linkedin&utm_content=ana@correo.cl&utm_campaign=${largo}&utm_medium=con%20espacio&utm_term=x%3Cy`, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const u = inserts[0]?.utm || {};
    check(`RF-UTM-04 ${etiqueta}: valores con @, espacios, símbolos o más de 64 caracteres se omiten`, inserts.length >= 1 && JSON.stringify(u) === '{"utm_source":"linkedin"}', JSON.stringify(u));
    await browser.close();
  }
}

// RF-02 y RF-03: con consentimiento, ID compartido entre páginas y utm sin lid
{
  const { browser, page, inserts, errores } = await sesion({ consent: 'accepted' });
  await page.goto(`${BASE}/test-era/?src=pdf&lid=abc123&utm_source=li`, { waitUntil: 'load' });
  await page.evaluate(() => window.__funnelTrack('test_start'));
  const k = await claves(page);
  check('RF-02 aceptado: se guarda _3gi_fsid y _3gi_futm', k.s.includes('_3gi_fsid') && k.s.includes('_3gi_futm'), JSON.stringify(k.s));
  await page.goto(`${BASE}/test-era-ia/`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const ids = new Set(inserts.map((e) => e.session_id));
  check('RF-02 aceptado: mismo session_id entre test-era y test-era-ia', ids.size === 1 && inserts.length >= 3, `${inserts.length} eventos, ${ids.size} id(s)`);
  const ult = inserts[0]?.utm || {};
  check('RF-02 aceptado: utm incluye src y utm_source', ult.src === 'pdf' && ult.utm_source === 'li', JSON.stringify(ult));
  check('RF-03 aceptado: lid no viaja ni se guarda', !JSON.stringify(inserts).includes('abc123') && !JSON.stringify(await page.evaluate(() => ({ ...sessionStorage }))).includes('abc123'));
  check('RNF-01 aceptado: sin errores de consola', errores.length === 0, errores.join(' | '));
  await browser.close();
}

// RF-03: un lid guardado por una versión anterior se elimina
{
  const { browser, page, inserts } = await sesion({ consent: 'accepted', initStorage: { _3gi_futm: JSON.stringify({ src: 'pdf', lid: 'viejo999' }) } });
  await page.goto(`${BASE}/test-era/`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const guardado = await page.evaluate(() => sessionStorage.getItem('_3gi_futm'));
  check('RF-03 lid heredado de sesiones anteriores se elimina', !String(guardado).includes('viejo999') && !JSON.stringify(inserts).includes('viejo999'), guardado);
  await browser.close();
}

// RF-04: bots
{
  const { browser, page, inserts } = await sesion({ bot: true, consent: 'accepted' });
  await page.goto(`${BASE}/test-era/`, { waitUntil: 'load' });
  await page.evaluate(() => window.__funnelTrack('test_start'));
  await page.waitForTimeout(500);
  check('RF-04 navegador automatizado: 0 eventos', inserts.length === 0, `${inserts.length} eventos`);
  await browser.close();
}

// RF-05 y adopción del ID al aceptar a mitad de página
for (const [boton, evento] of [['#tgi-consent-accept', 'consent_accepted'], ['#tgi-consent-reject', 'consent_rejected']]) {
  const { browser, page, inserts } = await sesion();
  await page.goto(`${BASE}/test-era/`, { waitUntil: 'load' });
  await page.click(boton);
  await page.waitForTimeout(500);
  const e = inserts.find((x) => x.evento === evento);
  check(`RF-05 ${boton}: se registra ${evento}`, !!e, inserts.map((x) => x.evento).join(','));
  if (evento === 'consent_accepted') {
    const sid = await page.evaluate(() => sessionStorage.getItem('_3gi_fsid'));
    check('RF-02 al aceptar se adopta el ID en memoria (no se parte la sesión)', e && sid === e.session_id && inserts[0].session_id === sid);
  }
  await browser.close();
}

// RF-07: configuración de PostHog
{
  const { browser, page } = await sesion({ consent: 'accepted' });
  await page.goto(`${BASE}/test-era/`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.posthog && window.posthog.config, null, { timeout: 20000 }).catch(() => {});
  const cfg = await page.evaluate(() => window.posthog && window.posthog.config ? { consola: window.posthog.config.enable_recording_console_log, mask: window.posthog.config.session_recording && window.posthog.config.session_recording.maskAllInputs } : null);
  check('RF-07 PostHog: consola desactivada y maskAllInputs verdadero', !!cfg && cfg.consola === false && cfg.mask === true, JSON.stringify(cfg));
  await browser.close();
}

console.log(fallos ? `\n${fallos} fallo(s)` : '\nTodo en orden');
process.exit(fallos ? 1 : 0);
