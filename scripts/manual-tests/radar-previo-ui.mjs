#!/usr/bin/env node
/**
 * radar-previo-ui.mjs — prueba manual (no CI) de /radar/previo/ (formulario «Preparación del Radar») con un Worker SIMULADO.
 *
 * No escribe nada real: el Worker, Supabase y toda solicitud externa se interceptan. Cubre: token del enlace (fragmento, Authorization,
 * Referer), pantallas de enlace inválido y error, restauración de respuestas, guardado automático («Guardado» solo tras el 200), fallas y
 * reintentos, sin conexión, conflicto 409, rechazo 422, condiciones, precarga, repetidor, revisión, envío y reapertura, móvil,
 * cookies y Sentry (con control positivo en una página pública).
 *
 * Preparación:
 *   npm run build && node_modules/.bin/astro preview --port 4399
 * Uso:
 *   node scripts/manual-tests/radar-previo-ui.mjs [baseUrl]    (por defecto http://localhost:4399)
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:4399';
const API = 'https://radar-previo-api.3gi.cl';
const TOKEN = 'T'.repeat(43);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const OBLIGATORIAS = ['n01', 'n02', 'n06', 'n09', 'n10', 'n26'];
const fallos = [];
let verificaciones = 0;
const ok = (cond, msg) => { verificaciones++; if (!cond) { fallos.push(msg); console.log(`  ✗ ${msg}`); } };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Worker simulado ───────────────────────────────────────────────────────────
function crearApi(inicial = {}) {
  const a = {
    fila: { estado: 'borrador', idioma: 'es', plantilla: 'core+financiero', plantilla_version: '1.0.0', respuestas: {}, precarga: {}, progreso: {}, n: 0, ...inicial },
    llamadas: [], externas: [], modo: {}, retraso: 0,
  };
  const ts = () => `2026-11-05T12:00:${String(a.fila.n).padStart(2, '0')}.000000+00:00`;
  a.ts = ts;
  a.manejar = async (route) => {
    const req = route.request(); const url = new URL(req.url());
    if (a.modo.sinRed) return route.abort('internetdisconnected'); // setOffline no alcanza a las respuestas servidas por la intercepción
    const cors ={ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const h = req.headers();
    const cuerpo = req.postData() ? JSON.parse(req.postData()) : {};
    a.llamadas.push({ ruta: url.pathname, cuerpo, auth: h.authorization, referer: h.referer, url: req.url() });
    const json = (status, datos) => route.fulfill({ status, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
    if (a.retraso) await esperar(a.retraso);
    if (h.authorization !== `Bearer ${TOKEN}` || a.modo.invalido) return json(401, { error: 'NO_AUTORIZADO' });
    const f = a.fila;
    if (url.pathname === '/v1/cargar') {
      if (a.modo.errorCarga) return route.abort();
      return json(200, { estado: f.estado, idioma: f.idioma, plantilla: f.plantilla, plantilla_version: f.plantilla_version, respuestas: f.respuestas, precarga: f.precarga, progreso: f.progreso, actualizado_en: ts() });
    }
    if (url.pathname === '/v1/guardar') {
      if (a.modo.fallaGuardado > 0) { a.modo.fallaGuardado--; return json(500, { error: 'ERROR_INTERNO' }); }
      if (a.modo.rechazar) { const malos = Object.keys(cuerpo.cambios).filter((id) => a.modo.rechazar.includes(id)); if (malos.length) return json(422, { error: 'VALIDACION', campos: malos.map((id) => ({ id, codigo: 'OPCION_INVALIDA' })) }); }
      if (a.modo.conflicto || cuerpo.base_actualizado_en !== ts()) {
        a.modo.conflicto = false; f.n++; f.respuestas = { ...f.respuestas, n01: 'texto del servidor' };
        return json(409, { error: 'CONFLICTO', actualizado_en: ts(), respuestas: f.respuestas });
      }
      f.respuestas = { ...f.respuestas, ...cuerpo.cambios };
      if (cuerpo.seccion) f.progreso = { ...f.progreso, [cuerpo.seccion]: true };
      if (f.estado === 'enviado') f.estado = 'borrador';
      f.n++;
      return json(200, { actualizado_en: ts(), estado: f.estado });
    }
    if (url.pathname === '/v1/enviar') {
      const faltan = OBLIGATORIAS.filter((id) => f.respuestas[id] === undefined);
      if (faltan.length) return json(422, { error: 'FALTAN', ids: faltan });
      f.estado = 'enviado'; f.n++;
      return json(200, { enviado_en: ts(), actualizado_en: ts() });
    }
    return json(404, { error: 'NO_ENCONTRADO' });
  };
  return a;
}

const browser = await chromium.launch();

async function abrir({ api = crearApi(), hash = `#t=${TOKEN}`, viewport = { width: 1280, height: 900 }, ruta = '/radar/previo/', extraContexto = {} } = {}) {
  const ctx = await browser.newContext({ viewport, userAgent: UA, ...extraContexto });
  await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  const externas = []; const sentry = [];
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.origin === BASE) return route.continue();
    if (u.origin === API) return api.manejar(route);
    if (/sentry\.io/.test(u.host)) { sentry.push(u.href); return route.fulfill({ status: 200, body: '{}' }); }
    externas.push(u.href);
    return route.abort(); // Supabase, PostHog, GTM, etc.: nada sale
  });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto(BASE + ruta + hash, { waitUntil: 'load', timeout: 60000 });
  return { ctx, page, api, externas, sentry, errores };
}
// Sentry deja `window.__SENTRY__` con un cliente solo si se llamó a init; no depende de que el build tenga DSN.
const sentryIniciado = (page) => page.evaluate(() => {
  const c = window.__SENTRY__;
  if (!c) return false;
  const ver = Object.keys(c).find((k) => /^\d/.test(k));
  return !!(c[ver]?.defaultCurrentScope?.getClient?.() ?? c[ver]?.defaultIsolationScope?.getClient?.());
});
const estadoTxt = (page) => page.locator('[data-estado]').innerText().catch(() => '');
const seccionVisible = (page) => page.locator('[data-pantalla="seccion"]:not([hidden])');
const siguiente = (page) => seccionVisible(page).locator('[data-ir="siguiente"]').click();
const pantalla = async (page) => page.evaluate(() => { const p = [...document.querySelectorAll('[data-pantalla]')].find((x) => !x.hidden); return p ? (p.dataset.pantalla === 'seccion' ? `seccion:${p.dataset.seccion}` : p.dataset.pantalla) : null; });
const ya = (page) => page.waitForSelector('[data-pantalla="intro"]:not([hidden]), [data-pantalla="enviado"]:not([hidden])', { timeout: 8000 });

// ── T1 · token ────────────────────────────────────────────────────────────────
console.log('T1 token del enlace');
{
  const t = await abrir(); await ya(t.page);
  ok((await t.page.evaluate(() => location.hash)) === '', 'el fragmento #t= se quita de la URL');
  ok(t.api.llamadas[0]?.auth === `Bearer ${TOKEN}`, 'la primera llamada lleva Authorization: Bearer <token>');
  ok(t.api.llamadas.every((c) => !c.url.includes(TOKEN)), 'el token nunca aparece en una URL solicitada');
  ok(t.api.llamadas.every((c) => !c.referer), 'las llamadas a la API no llevan Referer');
  ok((await t.page.evaluate(() => sessionStorage.getItem('rp_t'))) === TOKEN, 'el token queda en sessionStorage para poder recargar');
  await t.page.reload(); await ya(t.page);
  ok(t.api.llamadas.length === 2 && (await pantalla(t.page)) === 'intro', 'al recargar sin fragmento el formulario vuelve a cargar con el token guardado');
  ok(t.errores.length === 0, `sin errores de JavaScript (${t.errores.join(' | ')})`);
  await t.ctx.close();
}

// ── T2/T3 · enlace inválido, error de carga ───────────────────────────────────
console.log('T2 enlace inválido y errores de carga');
{
  let t = await abrir({ hash: '' }); await esperar(500);
  ok((await pantalla(t.page)) === 'invalido' && t.api.llamadas.length === 0, 'sin token: pantalla «enlace no válido» y ninguna llamada a la API');
  await t.ctx.close();
  t = await abrir({ api: crearApi({}) }); t.api.modo.invalido = true; await t.page.reload(); await esperar(800);
  ok((await pantalla(t.page)) === 'invalido', 'un 401 del Worker muestra «enlace no válido»');
  await t.ctx.close();
  const api = crearApi(); api.modo.errorCarga = true;
  t = await abrir({ api }); await esperar(800);
  ok((await pantalla(t.page)) === 'error-carga', 'una caída de red al cargar muestra «no pudimos cargar» con reintento');
  api.modo.errorCarga = false; await t.page.click('[data-reintentar-carga]'); await ya(t.page);
  ok((await pantalla(t.page)) === 'intro', 'reintentar carga el formulario');
  await t.ctx.close();
  t = await abrir({ api: crearApi({ estado: 'cerrado' }) }); await esperar(800);
  ok((await pantalla(t.page)) === 'cerrado', 'un formulario cerrado muestra el aviso y no permite editar');
  await t.ctx.close();
}

// ── T4 · restaurar respuestas ─────────────────────────────────────────────────
console.log('T4 restauración de respuestas');
{
  const api = crearApi({ respuestas: { n01: 'Asesoría de inversiones', n10: 'excel', n13: ['salud', 'menores'], n06: [{ area: 'cumplimiento', descripcion: 'Registrar recomendaciones', horas: 6, frecuencia: 'semanal' }, { descripcion: 'Enviar reportes' }], n03: { _: 'no_se' }, n02: { personas: 3, composicion: 'ambos' } }, progreso: { s1: true } });
  const t = await abrir({ api }); await ya(t.page);
  ok((await t.page.locator('[data-empezar-txt]').innerText()) === 'Continuar donde quedé', 'con progreso el botón dice «Continuar donde quedé»');
  ok((await t.page.inputValue('[data-campo="n01"]')) === 'Asesoría de inversiones', 'restaura un texto');
  ok(await t.page.isChecked('[data-campo="n10"][value="excel"]'), 'restaura una selección');
  ok((await t.page.locator('[data-campo="n13"]:checked').count()) === 2, 'restaura una multiselección');
  ok((await t.page.locator('[data-fila-activa]').count()) === 2 && (await t.page.inputValue('[data-campo="n06[1].descripcion"]')) === 'Enviar reportes', 'restaura las dos filas del repetidor con sus índices');
  ok(await t.page.isChecked('[data-nose="n03"]') && await t.page.locator('[data-campo="n03.clientes"]').first().isDisabled(), '«No sé» queda marcado y bloquea los controles');
  ok((await t.page.inputValue('[data-campo="n02.personas"]')) === '3', 'restaura un número dentro de una pregunta compuesta');
  await t.ctx.close();
}

// ── T5 · guardado automático y errores ────────────────────────────────────────
console.log('T5 guardado automático');
{
  const api = crearApi(); const t = await abrir({ api }); await ya(t.page);
  await t.page.click('[data-empezar]');
  await t.page.fill('[data-campo="n01"]', 'Mi negocio');
  await esperar(1800);
  const g = api.llamadas.find((c) => c.ruta === '/v1/guardar');
  ok(g && g.cuerpo.cambios.n01 === 'Mi negocio', 'a los ~1,2 s se envía el cambio a /v1/guardar');
  ok(g?.cuerpo.base_actualizado_en === '2026-11-05T12:00:00.000000+00:00', 'envía la versión base que devolvió el Worker');
  ok(/Guardado/.test(await estadoTxt(t.page)), '«Guardado» se muestra tras el 200');
  ok(api.fila.respuestas.n01 === 'Mi negocio', 'el Worker simulado quedó con el valor');

  // el 500 no muestra «Guardado», conserva lo escrito y reintenta
  api.modo.fallaGuardado = 1;
  await t.page.fill('[data-campo="n04"]', 'Crecer');
  await esperar(1800);
  const e1 = await estadoTxt(t.page);
  ok(/No pudimos guardar/.test(e1) && !/^Guardado/.test(e1), 'tras un 500 NO dice «Guardado»: avisa que reintentará');
  ok((await t.page.inputValue('[data-campo="n04"]')) === 'Crecer', 'lo escrito sigue en pantalla');
  await esperar(3500);
  ok(api.fila.respuestas.n04 === 'Crecer' && /Guardado/.test(await estadoTxt(t.page)), 'el reintento automático guarda y recién ahí dice «Guardado»');
  ok(!/internal|ERROR_INTERNO|500/i.test(await t.page.locator('body').innerText()), 'nunca se muestra texto del servidor');
  await t.ctx.close();
}

// ── T6 · sin conexión ─────────────────────────────────────────────────────────
console.log('T6 sin conexión');
{
  const api = crearApi(); const t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]');
  api.modo.sinRed = true;
  await t.page.fill('[data-campo="n01"]', 'escrito sin red');
  await esperar(1800);
  ok(/Sin conexión/.test(await estadoTxt(t.page)), 'sin red avisa «Sin conexión»');
  ok(api.fila.respuestas.n01 === undefined, 'no se guardó nada mientras no hay red');
  ok((await t.page.inputValue('[data-campo="n01"]')) === 'escrito sin red', 'lo escrito sigue en pantalla');
  api.modo.sinRed = false;
  await t.page.evaluate(() => window.dispatchEvent(new Event('online')));
  await esperar(1500);
  ok(api.fila.respuestas.n01 === 'escrito sin red', 'al volver la red se guarda lo escrito');
  await t.ctx.close();
}

// ── T7/T8 · conflicto y rechazo por formato ───────────────────────────────────
console.log('T7 conflicto y rechazo');
{
  let api = crearApi(); let t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]');
  api.modo.conflicto = true;
  await t.page.fill('[data-campo="n01"]', 'mi versión');
  await esperar(1800);
  ok(await t.page.locator('[data-conflicto]').isVisible(), 'un 409 muestra el aviso de conflicto');
  await t.page.click('[data-cargar-servidor]');
  ok((await t.page.inputValue('[data-campo="n01"]')) === 'texto del servidor', '«Cargar la versión guardada» trae lo que tiene el servidor');
  await t.ctx.close();

  api = crearApi(); api.modo.rechazar = ['n04']; t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]');
  await t.page.fill('[data-campo="n01"]', 'ok'); await t.page.fill('[data-campo="n04"]', 'rechazado');
  await esperar(2600);
  ok(await t.page.locator('[data-pregunta="n04"] [data-error]').isVisible(), 'un 422 marca solo la pregunta rechazada');
  ok(api.fila.respuestas.n01 === 'ok' && api.fila.respuestas.n04 === undefined, 'lo válido se guarda y lo rechazado no se reintenta');
  const antes = api.llamadas.filter((c) => c.ruta === '/v1/guardar').length;
  await esperar(1500);
  ok(api.llamadas.filter((c) => c.ruta === '/v1/guardar').length === antes, 'no hay bucle de reenvíos');
  await t.ctx.close();
}

// ── T9 · condiciones y módulo de sector ───────────────────────────────────────
console.log('T9 condiciones y módulo financiero');
{
  const t = await abrir(); await ya(t.page); await t.page.click('[data-empezar]');
  await t.page.fill('[data-campo="n02.personas"]', '1');
  ok(!(await t.page.locator('[data-pregunta="n25"]').isVisible()) && (await t.page.locator('[data-pregunta="n25"]').getAttribute('hidden')) !== null, 'con equipo de 1 persona se oculta la pregunta de reacción del equipo (n25)');
  await t.page.fill('[data-campo="n02.personas"]', '3');
  ok((await t.page.locator('[data-pregunta="n25"]').getAttribute('hidden')) === null, 'con 3 personas n25 reaparece');
  await t.page.check('[data-campo="n05"][value="yo"]');
  ok((await t.page.locator('[data-pregunta="n28"]').getAttribute('hidden')) !== null, 'si el directivo decide solo, se oculta la pregunta de quién más decide (n28)');
  await t.page.check('[data-campo="n05"][value="otra_persona"]');
  ok((await t.page.locator('[data-pregunta="n28"]').getAttribute('hidden')) === null, 'si decide otra persona, n28 aparece');
  ok((await t.page.locator('[data-prog-txt]').first().innerText()).includes('de 8'), 'plantilla core+financiero: 8 secciones');
  await t.ctx.close();
  const t2 = await abrir({ api: crearApi({ plantilla: 'core' }) }); await ya(t2.page); await t2.page.click('[data-empezar]');
  ok((await t2.page.locator('[data-pantalla="seccion"]:not([hidden]) [data-prog-txt]').innerText()).includes('de 7'), 'plantilla core: 7 secciones (sin módulo financiero)');
  let vistas = [];
  for (let i = 0; i < 7; i++) { vistas.push(await pantalla(t2.page)); if (i < 6) await siguiente(t2.page); }
  ok(!vistas.includes('seccion:sf'), 'la sección del módulo financiero no se recorre en la plantilla core');
  await t2.ctx.close();
}

// ── T10/T11 · revisión, envío y reapertura ────────────────────────────────────
console.log('T10 revisión y envío');
{
  const api = crearApi(); const t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]');
  for (let i = 0; i < 8; i++) await siguiente(t.page);
  ok((await pantalla(t.page)) === 'revision', 'tras la última sección se llega a la revisión');
  const frase = (await t.page.locator('[data-revision-resumen]').textContent()).trim();
  const m = /^(\d+) de (\d+) preguntas contestadas \(respondidas: (\d+) · «No sé»: (\d+)\)$/.exec(frase);
  ok(!!m, `el resumen usa la frase única del sistema («${frase}»)`);
  ok(m && Number(m[1]) === Number(m[3]) + Number(m[4]), '«No sé» cuenta como contestada: contestadas = respondidas + «No sé»');
  const pend = await t.page.locator('[data-revision-lista] button').count();
  ok(pend === 6, `la revisión lista las 6 obligatorias pendientes (hay ${pend})`);
  await t.page.locator('[data-revision-lista] button').first().click();
  ok((await pantalla(t.page)) === 'seccion:s1', 'cada pendiente lleva a su pregunta');
  // s1: n01 y n02 · s2: n06 · s3: n09 y n10 · s7: n26 (el módulo financiero ocupa la 5.ª posición)
  await t.page.fill('[data-campo="n01"]', 'Asesoría');
  await t.page.fill('[data-campo="n02.personas"]', '1');
  await siguiente(t.page);
  await t.page.fill('[data-campo="n06[0].descripcion"]', 'Registrar recomendaciones');
  await siguiente(t.page);
  await t.page.check('[data-nose="n09"]'); await t.page.check('[data-campo="n10"][value="excel"]');
  for (let i = 0; i < 5; i++) await siguiente(t.page); // s4, sf, s5, s6, s7
  ok((await pantalla(t.page)) === 'seccion:s7', 'se llega a la sección 7');
  await t.page.fill('[data-campo="n26"]', 'Cumplir la norma');
  await siguiente(t.page);
  ok((await pantalla(t.page)) === 'revision', 'vuelve a la revisión');
  ok(await t.page.locator('[data-revision-ok]').isVisible(), '«No sé» cuenta como respuesta: no quedan obligatorias pendientes');
  await t.page.click('[data-enviar]'); await esperar(900);
  ok((await pantalla(t.page)) === 'enviado' && api.fila.estado === 'enviado', 'enviar deja guardado todo y muestra «Recibimos tus respuestas»');
  const orden = api.llamadas.map((c) => c.ruta);
  ok(orden.lastIndexOf('/v1/guardar') < orden.lastIndexOf('/v1/enviar'), 'el envío se hace DESPUÉS de guardar lo pendiente');
  await t.page.click('[data-editar]'); await t.page.fill('[data-campo="n01"]', 'Asesoría de inversiones'); await esperar(1800);
  ok(api.fila.estado === 'borrador' && /otra vez/.test(await estadoTxt(t.page)), 'editar tras enviar reabre el formulario y lo avisa');
  await t.ctx.close();
}

// ── T12/T13 · precarga y repetidor ────────────────────────────────────────────
console.log('T12 precarga y repetidor');
{
  const api = crearApi({ precarga: { n01: { sugerencia: 'Ingresos por mantener clientes', fuente: 'test_era' }, n02: { sugerencia: 'Micro — hasta 4 personas', fuente: 'test_era' }, n24: { sugerencia: 'Ninguna', fuente: 'test_era' } } });
  const t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]');
  ok(await t.page.locator('[data-pregunta="n01"] [data-precarga]').isVisible() && (await t.page.locator('[data-pregunta="n01"] [data-precarga-texto]').innerText()).includes('Ingresos por mantener'), 'muestra lo que el cliente contó en el Test ERA');
  ok(await t.page.locator('[data-pregunta="n01"] [data-usar-precarga]').isVisible(), 'en una pregunta de texto ofrece «Usar esta respuesta»');
  ok(await t.page.locator('[data-pregunta="n02"] [data-precarga]').isVisible() && !(await t.page.locator('[data-pregunta="n02"] [data-usar-precarga]').isVisible()), 'en una pregunta numérica solo sirve de referencia (sin botón)');
  await t.page.click('[data-pregunta="n01"] [data-usar-precarga]'); await esperar(1800);
  ok((await t.page.inputValue('[data-campo="n01"]')) === 'Ingresos por mantener clientes' && api.fila.respuestas.n01 === 'Ingresos por mantener clientes', '«Usar esta respuesta» la copia y la guarda');
  ok(!(await t.page.locator('[data-pregunta="n01"] [data-precarga]').isVisible()), 'una vez respondida, el aviso desaparece');
  await t.page.click('[data-ir="siguiente"]:visible');
  // repetidor en la sección 2
  const ag = t.page.locator('[data-pregunta="n06"] [data-agregar-fila]');
  await ag.click(); await ag.click();
  ok((await t.page.locator('[data-pregunta="n06"] [data-fila-activa]').count()) === 3 && !(await ag.isVisible()), 'el repetidor llega a 3 tareas y el botón de agregar desaparece');
  await t.page.fill('[data-campo="n06[0].descripcion"]', 'Tarea A'); await t.page.fill('[data-campo="n06[1].descripcion"]', 'Tarea B'); await t.page.fill('[data-campo="n06[2].descripcion"]', 'Tarea C');
  ok((await t.page.locator('[data-ref="n06"] option').count()) === 4, 'n07 ofrece las tres tareas escritas');
  await t.page.locator('[data-pregunta="n06"] [data-quitar-fila]').first().click();
  const nombres = await t.page.locator('[data-pregunta="n06"] [data-campo$=".descripcion"]').evaluateAll((els) => els.map((e) => e.dataset.campo));
  ok(JSON.stringify(nombres) === JSON.stringify(['n06[0].descripcion', 'n06[1].descripcion']), `al quitar una fila los índices se renumeran (${nombres})`);
  await esperar(1800);
  ok(JSON.stringify(api.fila.respuestas.n06?.map((x) => x.descripcion)) === JSON.stringify(['Tarea B', 'Tarea C']), 'lo guardado coincide con las filas que quedan');
  await t.ctx.close();
}

// ── T14 · móvil ───────────────────────────────────────────────────────────────
console.log('T14 móvil 375 px');
{
  const t = await abrir({ viewport: { width: 375, height: 812 }, extraContexto: { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } }); await ya(t.page);
  const m = async () => t.page.evaluate(() => ({ ancho: document.documentElement.scrollWidth, vp: innerWidth }));
  let r = await m(); ok(r.ancho <= r.vp, `intro sin desborde horizontal (${r.ancho} ≤ ${r.vp})`);
  await t.page.click('[data-empezar]');
  for (let i = 0; i < 8; i++) { r = await m(); ok(r.ancho <= r.vp, `sección ${i + 1} sin desborde horizontal (${r.ancho} ≤ ${r.vp})`); if (i === 1) { await t.page.click('[data-pregunta="n06"] [data-agregar-fila]'); r = await m(); ok(r.ancho <= r.vp, 'con filas del repetidor sin desborde'); } await siguiente(t.page); }
  await t.page.goto(BASE + '/radar/previo/'); await t.page.waitForTimeout(300);
  const chicos = await t.page.evaluate(() => [...document.querySelectorAll('.rp-btn, .rp-opcion, .rp-input, .rp-nose')].filter((e) => e.offsetParent && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 44).map((e) => e.className));
  ok(chicos.length === 0, `objetivos táctiles ≥ 44 px (menores: ${chicos.length})`);
  await t.ctx.close();
}

// ── T15 · privacidad: cookies, solicitudes externas y Sentry ──────────────────
console.log('T15 privacidad');
{
  const t = await abrir(); await ya(t.page); await t.page.click('[data-empezar]'); await t.page.fill('[data-campo="n01"]', 'x'); await esperar(1700);
  ok((await t.ctx.cookies()).length === 0 && (await t.page.evaluate(() => document.cookie)) === '', 'ninguna cookie');
  ok(t.externas.length === 0, `ninguna solicitud a terceros (${t.externas.join(', ')})`);
  ok((await sentryIniciado(t.page)) === false, 'Sentry NO se inicializa en la página privada (sus trazas llevarían la URL con el token)');
  ok(t.sentry.length === 0, `la página privada no envía nada a Sentry (${t.sentry.length} solicitudes)`);
  const html = await t.page.content();
  ok(!/googletagmanager|posthog|funnel-track|linkedin\.com|__loadGTM/i.test(html), 'el HTML no incluye GTM, PostHog, LinkedIn ni el registro de embudo');
  ok(/<meta name="robots" content="noindex/.test(html), 'lleva <meta robots noindex>');
  ok(!/destino|sugiere|evidencia:/.test(html), 'el HTML no expone el mapeo interno al Radar');
  await t.ctx.close();
  // control positivo: en una página pública Sentry SÍ debe enviar (si el build tiene DSN); valida que el detector funciona
  const p = await abrir({ ruta: '/nosotros/', hash: '' }); await esperar(1000);
  ok((await sentryIniciado(p.page)) === true, 'control positivo: en una página pública Sentry SÍ se inicializa (el detector funciona)');
  await p.ctx.close();
}

// ── T16 · textos visibles ─────────────────────────────────────────────────────
console.log('T16 textos');
{
  const t = await abrir({ api: crearApi({ respuestas: {} }) }); await ya(t.page);
  const texto = await t.page.evaluate(() => document.body.textContent);
  ok(!/diagn[oó]stic|Post-?Scan|Pre-?Scan|Toolkit|\bF[1-5]\b|\bEtapa/i.test(texto), 'sin nomenclatura interna en ningún texto de la página');
  ok(!/(?<![\p{L}])(acá|vos|tenés|querés|hacés|mirá)(?![\p{L}])/iu.test(texto), 'sin voseo ni regionalismos');
  ok(texto.includes('Preparación de tu Radar'), 'el título usa el nombre público');
  await t.ctx.close();
}

// ── T17 · versión en inglés ───────────────────────────────────────────────────
console.log('T17 inglés (/en/radar/previo/)');
{
  const RUTA_EN = '/en/radar/previo/';
  // Palabras de interfaz en español que NO deben aparecer en ningún texto de la página en inglés (visible u oculto)
  const ESPANOL = /[ñ¿¡áéíóúÁÉÍÓÚ]|\b(Guardado|Guardando|Siguiente|Anterior|Empezar|Obligatoria|Enviar|Revisar|Cargando|cuestionario|respuestas|conexión|reunión|pregunta|empresa|clientes)\b/;
  const api = crearApi({ respuestas: { n01: 'My business' }, progreso: { s1: true } });
  const t = await abrir({ api, ruta: RUTA_EN }); await ya(t.page);
  ok((await t.page.evaluate(() => document.documentElement.lang)) === 'en', '<html lang="en">');
  ok((await t.page.locator('[data-pantalla="intro"] h1').innerText()) === 'Radar Preparation', 'el título usa el nombre público en inglés («Radar Preparation»)');
  ok((await t.page.locator('[data-empezar-txt]').innerText()) === 'Continue where I left off', 'con progreso el botón dice «Continue where I left off»');
  ok((await t.page.locator('[data-pantalla="intro"] a').getAttribute('href')) === '/en/privacidad/', 'el enlace de privacidad apunta a la política en inglés');
  // Texto de la página, visible u oculto, sin el JSON de estructura (sus claves son identificadores internos, no texto que alguien lea)
  const todo = await t.page.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll('script, style').forEach((e) => e.remove()); return c.textContent; });
  ok(!ESPANOL.test(todo), `ningún texto en español, ni visible ni oculto (${(todo.match(ESPANOL) || [''])[0]})`);
  ok(!/diagnosis|diagnostic|Post-?Scan|Pre-?Scan|Toolkit|\bF[1-5]\b|\bStage/i.test(todo), 'sin nomenclatura interna en inglés');
  ok(/ERA Test/.test(todo) && !/Test ERA/.test(todo), 'glosario de marca: «ERA Test»');
  ok((await t.page.locator('footer').innerText()).includes('AI applied to real business'), 'el pie está en inglés');

  await t.page.click('[data-empezar]');
  ok((await t.page.locator('[data-pantalla="seccion"]:not([hidden]) [data-prog-txt]').innerText()).includes('Section 1 of 8'), 'el progreso dice «Section 1 of 8»');
  await t.page.fill('[data-campo="n04"]', 'Grow'); await esperar(1800);
  ok(/Saved/.test(await estadoTxt(t.page)), 'el estado dice «Saved» tras el 200');
  api.modo.fallaGuardado = 1; await t.page.fill('[data-campo="n04"]', 'Grow again'); await esperar(1800);
  ok(/We could not save/.test(await estadoTxt(t.page)), 'el error de guardado está en inglés y sin texto del servidor');
  await esperar(3500);
  api.modo.sinRed = true; await t.page.fill('[data-campo="n04"]', 'Grow more'); await esperar(1800);
  ok(/No connection/.test(await estadoTxt(t.page)), 'sin red dice «No connection»');
  api.modo.sinRed = false; await t.page.evaluate(() => window.dispatchEvent(new Event('online'))); await esperar(1500);

  for (let i = 0; i < 8; i++) await siguiente(t.page);
  ok((await pantalla(t.page)) === 'revision', 'llega a la revisión');
  ok((await t.page.locator('[data-pantalla="revision"] h2').innerText()) === 'Review before sending', 'la revisión está en inglés');
  ok((await t.page.locator('[data-revision-lista] button').first().innerText()).includes('Go to the question'), 'los pendientes ofrecen «Go to the question»');
  ok(await t.page.locator('[data-revision-pendientes]').innerText().then((x) => /These required questions are still missing/.test(x)), 'aviso de obligatorias pendientes en inglés');
  const revision = await t.page.locator('[data-pantalla="revision"]').innerText();
  ok(!ESPANOL.test(revision), 'la pantalla de revisión no tiene español');

  // completar lo obligatorio y enviar
  api.fila.respuestas = { ...api.fila.respuestas, n01: 'x', n02: { personas: 1 }, n06: [{ descripcion: 'x' }], n09: { herramientas: ['excel'] }, n10: 'excel', n26: 'x' };
  api.fila.n++;
  await t.page.reload(); await ya(t.page);
  await t.page.click('[data-empezar]');
  for (let i = 0; i < 8; i++) await siguiente(t.page);
  ok(await t.page.locator('[data-revision-ok]').isVisible(), 'sin pendientes: «All required questions are answered.»');
  await t.page.click('[data-enviar]'); await esperar(900);
  ok((await t.page.locator('[data-pantalla="enviado"] h1').innerText()) === 'We received your answers', 'tras enviar: «We received your answers»');
  await t.page.click('[data-editar]'); await t.page.fill('[data-campo="n01"]', 'Edited'); await esperar(1800);
  ok(/send them again/.test(await estadoTxt(t.page)), 'editar tras enviar avisa en inglés que hay que reenviar');
  await t.ctx.close();

  const inv = await abrir({ hash: '', ruta: RUTA_EN }); await esperar(500);
  ok((await inv.page.locator('[data-pantalla="invalido"] h1').innerText()) === 'This link is not valid or has expired', 'enlace inválido en inglés');
  await inv.ctx.close();
  const cer = await abrir({ api: crearApi({ estado: 'cerrado' }), ruta: RUTA_EN }); await esperar(800);
  ok((await cer.page.locator('[data-pantalla="cerrado"] h1').innerText()) === 'This form is now closed', 'formulario cerrado en inglés');
  await cer.ctx.close();

  const mov = await abrir({ viewport: { width: 375, height: 812 }, ruta: RUTA_EN, extraContexto: { isMobile: true, hasTouch: true } }); await ya(mov.page);
  await mov.page.click('[data-empezar]');
  let desborde = false;
  for (let i = 0; i < 8; i++) { const r = await mov.page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (r > 0) desborde = true; await siguiente(mov.page); }
  ok(!desborde, 'en inglés tampoco hay desborde horizontal a 375 px (los textos son más largos)');
  ok(mov.externas.length === 0 && (await mov.ctx.cookies()).length === 0 && (await sentryIniciado(mov.page)) === false, 'la versión en inglés tampoco usa cookies, terceros ni Sentry');
  await mov.ctx.close();
}

await browser.close();
console.log(`\n${verificaciones} verificaciones, ${fallos.length} fallas`);
if (fallos.length) { console.log('FALLAS:\n - ' + fallos.join('\n - ')); process.exit(1); }
console.log('OK');
