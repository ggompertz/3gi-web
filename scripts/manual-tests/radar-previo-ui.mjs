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
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://localhost:4399';
const API = 'https://radar-previo-api.3gi.cl';
const TOKEN = 'T'.repeat(43);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const OBLIGATORIAS = ['n01', 'n02', 'n06', 'n09', 'n10', 'n26'];
// Validador REAL del Worker (3gi-platform). Las pruebas con `api.validar = true` lo usan en guardar y enviar; si no está, se avisa y esas pruebas se omiten.
const RAIZ_WEB = fileURLToPath(new URL('../../', import.meta.url));
const VALIDAR_JS = process.env.RADAR_VALIDAR_JS || '/home/ggomp/3gi-platform/workers/radar-previo-api/src/validar.js';
let VAL = null;
if (existsSync(VALIDAR_JS)) {
  const v = await import(VALIDAR_JS);
  const leer = (f) => JSON.parse(readFileSync(RAIZ_WEB + 'src/data/radar-previo/' + f, 'utf8'));
  VAL = { ...v, idx: v.indexarEstructura([leer('core.v1.json'), leer('financiero.v1.json')]) };
} else console.log('  (sin validador del Worker: se omiten las pruebas de «Otro» que dependen de él)');
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
      if (a.modo.rechazar) { const malos = Object.keys(cuerpo.cambios).filter((id) => a.modo.rechazar.includes(id)); if (malos.length) return json(422, { error: 'VALIDACION', campos: malos.map((id) => ({ id, codigo: a.modo.codigoRechazo ?? 'OPCION_INVALIDA' })) }); }
      if (a.modo.conflicto || cuerpo.base_actualizado_en !== ts()) {
        a.modo.conflicto = false; f.n++; f.respuestas = { ...f.respuestas, n01: 'texto del servidor' };
        return json(409, { error: 'CONFLICTO', actualizado_en: ts(), respuestas: f.respuestas });
      }
      if (a.validar && VAL) {
        const r = VAL.validarCambios(VAL.idx, cuerpo.cambios, f.respuestas);
        if (!r.ok) return json(422, { error: 'VALIDACION', campos: r.errores.map((e) => ({ id: e.id, codigo: e.codigo })) });
        cuerpo.cambios = r.normalizados;
      }
      f.respuestas = { ...f.respuestas, ...cuerpo.cambios };
      if (cuerpo.seccion) f.progreso = { ...f.progreso, [cuerpo.seccion]: true };
      if (f.estado === 'enviado') f.estado = 'borrador';
      f.n++;
      return json(200, { actualizado_en: ts(), estado: f.estado });
    }
    if (url.pathname === '/v1/enviar') {
      const faltan = a.validar && VAL ? VAL.faltantes(VAL.idx, f.respuestas) : OBLIGATORIAS.filter((id) => f.respuestas[id] === undefined);
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

// ── T18 · «No sé» sobre lo escrito, n07 sin lista y ayuda por correo (caso real del 2026-11-10) ──────────────
console.log('T18 «No sé» sobre una respuesta escrita, n07 y ayuda por correo');
{
  const api = crearApi(); const t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]');
  const ayuda = seccionVisible(t.page).locator('.rp-ayuda-pie');
  ok((await ayuda.count()) === 1, 'cada sección muestra la ayuda por correo');
  ok((await ayuda.count()) === 1 && (await ayuda.locator('a').getAttribute('href')) === 'mailto:chat@3gi.cl', 'la ayuda por correo enlaza a mailto:chat@3gi.cl');
  ok((await ayuda.count()) === 1 && (await ayuda.innerText()).includes('Responde al correo'), 'la ayuda dice que se puede responder al correo');
  await t.page.click('[data-ir="siguiente"]:visible');
  const sel = t.page.locator('[data-ref="n06"]');
  const aviso06 = t.page.locator('[data-pregunta="n06"] [data-nose-aviso]');
  const avisoRef = t.page.locator('[data-pregunta="n07"] [data-ref-aviso]');
  ok((await sel.isDisabled()) && (await avisoRef.isVisible()), 'sin tareas escritas, n07 está deshabilitada y explica qué hacer');
  await t.page.fill('[data-campo="n06[0].descripcion"]', 'Revisar saldos');
  ok(!(await sel.isDisabled()) && !(await avisoRef.isVisible()) && (await sel.locator('option').count()) === 2, 'al escribir una tarea, n07 se habilita y la ofrece');
  await sel.selectOption('0'); await esperar(1800);
  ok(api.fila.respuestas.n07 === 0, 'elegir la tarea en n07 se guarda (índice 0)');
  const antes = api.llamadas.filter((c) => c.ruta === '/v1/guardar').length;
  await t.page.check('[data-nose="n06"]'); await esperar(1800);
  ok((await aviso06.isVisible()) && (await aviso06.innerText()).includes('no enviaremos lo que escribiste'), 'al tildar «No sé» sobre una tarea escrita avisa que no se enviará');
  ok((await sel.isDisabled()) && (await sel.locator('option').count()) === 1 && (await avisoRef.isVisible()), 'con n06 en «No sé», n07 queda deshabilitada y sin tareas que ofrecer');
  const guardados = api.llamadas.filter((c) => c.ruta === '/v1/guardar').slice(antes);
  ok(guardados.length > 0 && guardados.every((c) => typeof c.cuerpo.cambios.n07 !== 'number'), 'no se envía un índice de n07 junto con n06 en «No sé»');
  ok(JSON.stringify(api.fila.respuestas.n06) === JSON.stringify({ _: 'no_se' }), 'n06 quedó guardada como «No sé»');
  // El «No sé» propio de n07 no debe volver a habilitarla mientras n06 siga sin lista (bloquear() la habilitaría).
  await t.page.check('[data-nose="n07"]'); await t.page.uncheck('[data-nose="n07"]');
  ok(await sel.isDisabled(), 'desmarcar el «No sé» de n07 no la habilita si n06 sigue en «No sé»');
  await t.page.uncheck('[data-nose="n06"]'); await esperar(300);
  ok(!(await aviso06.isVisible()) && !(await sel.isDisabled()) && (await sel.locator('option').count()) === 2, 'al desmarcar «No sé» en n06 vuelve la tarea y se habilita n07');
  // Con «No sé» propio en n07, editar n06 recalcula las opciones pero no debe volver a habilitar el selector.
  await t.page.check('[data-nose="n07"]'); await t.page.fill('[data-campo="n06[0].descripcion"]', 'Otra tarea');
  ok(await sel.isDisabled(), 'con «No sé» en n07, editar n06 no vuelve a habilitar su selector');
  await t.page.uncheck('[data-nose="n07"]');
  await t.page.fill('[data-campo="n06[0].descripcion"]', ''); await t.page.check('[data-nose="n06"]');
  ok(!(await aviso06.isVisible()), 'sin nada escrito, tildar «No sé» no muestra el aviso de descarte');
  await t.ctx.close();
}
{
  // Si el servidor igual rechaza el índice de n07, el mensaje dice qué hacer (antes era el texto genérico)
  let api = crearApi(); api.modo.rechazar = ['n07']; api.modo.codigoRechazo = 'INDICE_INVALIDO';
  let t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]'); await t.page.click('[data-ir="siguiente"]:visible');
  await t.page.fill('[data-campo="n06[0].descripcion"]', 'Revisar saldos');
  await t.page.locator('[data-ref="n06"]').selectOption('0'); await esperar(2600);
  const msg = await t.page.locator('[data-pregunta="n07"] [data-error]').innerText();
  ok(msg === 'Esa opción ya no está en tu lista de tareas. Elige otra o marca «No sé».', `el rechazo del índice de n07 explica qué hacer (${msg})`);
  await t.ctx.close();
  // Una pregunta cualquiera conserva el mensaje genérico
  api = crearApi(); api.modo.rechazar = ['n04'];
  t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]');
  await t.page.fill('[data-campo="n04"]', 'rechazado'); await esperar(2600);
  ok((await t.page.locator('[data-pregunta="n04"] [data-error]').innerText()) === 'Revisa esta respuesta: no tiene el formato esperado.', 'otras preguntas conservan el mensaje genérico');
  await t.ctx.close();
}
{
  // La ayuda por correo también está en la pantalla de revisión
  const t = await abrir({ api: crearApi() }); await ya(t.page); await t.page.click('[data-empezar]');
  for (let i = 0; i < 12 && !(await t.page.locator('[data-pantalla="revision"]:not([hidden])').count()); i++) await siguiente(t.page);
  const pie = t.page.locator('[data-pantalla="revision"]:not([hidden]) .rp-ayuda-pie a');
  ok((await pie.count()) === 1 && (await pie.getAttribute('href')) === 'mailto:chat@3gi.cl', 'la ayuda por correo también está en la revisión');
  await t.ctx.close();
}
{
  // Inglés: mismos avisos, en inglés
  const t = await abrir({ api: crearApi(), ruta: '/en/radar/previo/' }); await ya(t.page); await t.page.click('[data-empezar]');
  const ayudaEn = seccionVisible(t.page).locator('.rp-ayuda-pie');
  ok((await ayudaEn.count()) === 1 && (await ayudaEn.innerText()).includes('Reply to the email'), 'en inglés la ayuda por correo también está');
  await t.page.click('[data-ir="siguiente"]:visible');
  await t.page.fill('[data-campo="n06[0].descripcion"]', 'Review balances'); await t.page.check('[data-nose="n06"]');
  ok((await t.page.locator('[data-pregunta="n06"] [data-nose-aviso]').innerText()).includes('we will not send what you wrote'), 'en inglés el aviso de descarte está en inglés');
  ok((await t.page.locator('[data-pregunta="n07"] [data-ref-aviso]').innerText()).includes('Add your tasks above first'), 'en inglés la explicación de n07 está en inglés');
  await t.ctx.close();
}

// ── T19 · «Otro» con texto obligatorio (2026-11-10) ───────────────────────────────────────────────────────────
console.log('T19 «Otro» con texto obligatorio');
if (VAL) {
  const api = crearApi(); api.validar = true;
  const t = await abrir({ api }); await ya(t.page); await t.page.click('[data-empezar]');
  const n10o = t.page.locator('[data-pregunta="n10o"]');
  const cajaO = t.page.locator('[data-campo="n10o"]');
  const guardadosDe = (id) => api.llamadas.filter((c) => c.ruta === '/v1/guardar' && id in (c.cuerpo.cambios ?? {})).map((c) => c.cuerpo.cambios[id]);
  // sección 3: n09, n10, n10o, n11, n12
  await t.page.click('[data-ir="siguiente"]:visible'); await t.page.click('[data-ir="siguiente"]:visible');
  ok((await t.page.locator('[data-pregunta="n10"]').count()) === 1 && (await n10o.count()) === 1, 'n10 y su acompañante n10o existen en la sección 3');
  ok(!(await n10o.isVisible()), 'sin marcar «Otro» el campo no se ve');
  ok((await t.page.locator('[data-campo="n10"][value="otro"]').count()) === 1, 'n10 ofrece la opción «Otro»');
  ok((await t.page.locator('[data-pregunta="n10o"] [data-nose]').count()) === 0, 'el acompañante no tiene su propio «No sé»');

  await t.page.check('[data-campo="n10"][value="otro"]');
  ok(await n10o.isVisible(), 'al marcar «Otro» aparece el campo de texto');
  ok(await t.page.evaluate(() => document.activeElement?.dataset?.campo === 'n10o'), 'el foco pasa al campo');
  const adv = await t.page.locator('[data-pregunta="n10o"] .rp-ayuda').innerText();
  ok(adv.includes('No escribas datos personales de tus clientes'), 'la advertencia de privacidad está junto al campo');
  const descr = await cajaO.getAttribute('aria-describedby');
  ok(!!descr && (await t.page.locator(`#${descr}`).innerText()).includes('datos personales'), 'el campo está asociado a la advertencia (aria-describedby)');
  ok((await cajaO.getAttribute('maxlength')) === '300', 'el campo tiene tope de 300 caracteres');
  ok((await t.page.locator('[data-contador="n10o"]').innerText()) === '0/300', 'el contador empieza en 0/300');

  await t.page.fill('[data-campo="n10o"]', 'ab'); await esperar(1800);
  ok(guardadosDe('n10o').includes('ab') && !(await t.page.locator('[data-pregunta="n10o"] [data-error]').isVisible()), 'un texto corto se guarda mientras se escribe (el mínimo se exige al enviar) y no muestra error todavía');
  await t.page.fill('[data-campo="n10o"]', 'Libretas'); await esperar(1800);
  ok((await t.page.locator('[data-contador="n10o"]').innerText()) === '8/300', 'el contador sigue lo escrito');
  ok(api.fila.respuestas.n10o === 'Libretas' && JSON.stringify(api.fila.respuestas.n10) === '["otro"]', 'el servidor guardó «Otro» y el texto');

  // Lo que se ve es lo que se guarda: desmarcar «Otro» oculta el campo y el servidor recibe «»
  await t.page.uncheck('[data-campo="n10"][value="otro"]'); await esperar(1800);
  ok(!(await n10o.isVisible()), 'al desmarcar «Otro» el campo se oculta');
  ok(api.fila.respuestas.n10o === '', 'al desmarcar, el servidor recibe «» (el texto oculto no se guarda)');
  await t.page.check('[data-campo="n10"][value="otro"]'); await esperar(1800);
  ok((await cajaO.inputValue()) === 'Libretas' && api.fila.respuestas.n10o === 'Libretas', 'al marcar de nuevo reaparece el texto de la sesión y se vuelve a guardar');

  // «No sé» en el padre: oculta el campo, avisa que el texto no se enviará y se vacía en el servidor
  await t.page.check('[data-nose="n10"]'); await esperar(1800);
  ok(!(await n10o.isVisible()), 'con «No sé» en n10 el campo de «Otro» se oculta');
  ok(await t.page.locator('[data-pregunta="n10"] [data-nose-aviso]').isVisible(), 'y se avisa que lo escrito no se enviará');
  ok(JSON.stringify(api.fila.respuestas.n10) === '{"_":"no_se"}' && api.fila.respuestas.n10o === '', 'el servidor tiene «No sé» en n10 y el texto de «Otro» vacío');
  await t.page.uncheck('[data-nose="n10"]'); await esperar(1800);
  ok(await n10o.isVisible() && (await cajaO.inputValue()) === 'Libretas', 'al quitar «No sé» vuelve el campo con su texto');

  // Revisión: «Otro» con texto demasiado corto es un pendiente, con el mensaje junto al campo
  await t.page.fill('[data-campo="n10o"]', 'ab'); await esperar(300);
  for (let i = 0; i < 12 && !(await t.page.locator('[data-pantalla="revision"]:not([hidden])').count()); i++) await siguiente(t.page);
  const lista = await t.page.locator('[data-revision-lista]').innerText();
  ok(lista.includes('¿Dónde más vive esa información?'), 'la revisión lista «Otro» sin texto suficiente como pendiente');
  await t.page.click('[data-ir-pregunta="n10o"]');
  ok(await t.page.locator('[data-pregunta="n10o"] [data-error]').isVisible() && (await t.page.locator('[data-pregunta="n10o"] [data-error]').innerText()) === 'Escribe cuál (mínimo 3 caracteres).', 'el mensaje de error está junto al campo');
  ok(await t.page.evaluate(() => document.activeElement?.dataset?.campo === 'n10o'), 'ir a la pregunta deja el foco en el campo');
  await t.page.fill('[data-campo="n10o"]', 'abc'); await esperar(300);
  ok(!(await t.page.locator('[data-pregunta="n10o"] [data-error]').isVisible()), 'al corregir el texto el error desaparece');
  ok(api.llamadas.filter((c) => c.ruta === '/v1/guardar').every((c) => !(c.cuerpo.cambios && 'n10o' in c.cuerpo.cambios && c.cuerpo.cambios.n10o.length > 300)), 'ningún guardado superó 300 caracteres');
  ok(t.errores.length === 0, `sin errores de JavaScript (${t.errores.join(' | ')})`);
  await t.ctx.close();
}
if (VAL) {
  // n05 («¿Quién?»), n13 con «Otro» y «Ninguno» (exclusiva), y móvil sin desborde
  const api = crearApi(); api.validar = true;
  const t = await abrir({ api, viewport: { width: 375, height: 800 } }); await ya(t.page); await t.page.click('[data-empezar]');
  ok(!(await t.page.locator('[data-pregunta="n05q"]').isVisible()), '«¿Quién toma la decisión?» está oculta al inicio');
  await t.page.check('[data-campo="n05"][value="otra_persona"]');
  ok(await t.page.locator('[data-pregunta="n05q"]').isVisible(), 'con «Otra persona» aparece «¿Quién?»');
  await t.page.fill('[data-campo="n05q"]', 'Mi socio'); await esperar(1800);
  ok(api.fila.respuestas.n05q === 'Mi socio', 'n05q se guarda');
  ok(await t.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'en móvil (375 px) no hay desborde horizontal con el campo visible');
  await t.page.check('[data-campo="n05"][value="yo"]'); await esperar(1800);
  ok(!(await t.page.locator('[data-pregunta="n05q"]').isVisible()) && api.fila.respuestas.n05q === '', 'con otra opción se oculta y se vacía en el servidor');
  await t.page.click('[data-ir="siguiente"]:visible'); await t.page.click('[data-ir="siguiente"]:visible'); await t.page.click('[data-ir="siguiente"]:visible');
  await t.page.check('[data-campo="n13"][value="otro"]');
  ok(await t.page.locator('[data-pregunta="n13o"]').isVisible(), 'n13 con «Otro» muestra su campo');
  ok((await t.page.locator('[data-pregunta="n13o"] .rp-ayuda').innerText()).includes('Solo el tipo de dato, no los datos.'), 'n13o conserva la ayuda propia («solo el tipo de dato»)');
  await t.page.check('[data-campo="n13"][value="ninguno"]'); await esperar(300);
  ok(!(await t.page.locator('[data-pregunta="n13o"]').isVisible()) && !(await t.page.locator('[data-campo="n13"][value="otro"]').isChecked()), '«Ninguno» es exclusiva: desmarca «Otro» y oculta el campo');
  ok(await t.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'sin desborde horizontal en la sección 4');
  ok(t.errores.length === 0, `sin errores de JavaScript (${t.errores.join(' | ')})`);
  await t.ctx.close();
}
if (VAL) {
  // Inglés
  const api = crearApi(); api.validar = true;
  const t = await abrir({ api, ruta: '/en/radar/previo/' }); await ya(t.page); await t.page.click('[data-empezar]');
  await t.page.click('[data-ir="siguiente"]:visible'); await t.page.click('[data-ir="siguiente"]:visible');
  ok((await t.page.locator('[data-campo="n10"][value="otro"]').locator('xpath=..').innerText()).trim() === 'Other', 'en inglés la opción dice «Other»');
  await t.page.check('[data-campo="n10"][value="otro"]');
  ok((await t.page.locator('[data-pregunta="n10o"] .rp-ayuda').innerText()).includes('Do not write personal data about your clients'), 'en inglés la advertencia está en inglés');
  await t.page.fill('[data-campo="n10o"]', 'ab');
  for (let i = 0; i < 12 && !(await t.page.locator('[data-pantalla="revision"]:not([hidden])').count()); i++) await siguiente(t.page);
  await t.page.click('[data-ir-pregunta="n10o"]');
  ok((await t.page.locator('[data-pregunta="n10o"] [data-error]').innerText()) === 'Write which one (at least 3 characters).', 'en inglés el error del mínimo está en inglés');
  await t.ctx.close();
}

await browser.close();
console.log(`\n${verificaciones} verificaciones, ${fallos.length} fallas`);
if (fallos.length) { console.log('FALLAS:\n - ' + fallos.join('\n - ')); process.exit(1); }
console.log('OK');
