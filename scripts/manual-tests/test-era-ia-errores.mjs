#!/usr/bin/env node
/**
 * test-era-ia-errores.mjs — prueba manual (no CI) de los mensajes de error de /test-era-ia (ES y EN).
 *
 * Regla que protege: la página solo puede decir que las respuestas están guardadas cuando el Worker lo
 * confirma con `guardado: true` (30-oct-2026: un prospecto vio «Tus respuestas están guardadas» y no había nada).
 * Las respuestas del Worker (`/analizar`) están simuladas; funnel_events y PostHog se interceptan: no se escribe nada real.
 *
 * Corre contra un preview LOCAL: `npm run build && node_modules/.bin/astro preview --port 4399`.
 * Uso: node scripts/manual-tests/test-era-ia-errores.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:4399';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const TOKEN = '11111111-2222-4333-8444-555555555555';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST, OPTIONS' };

let fallos = 0;
function check(nombre, ok, detalle = '') {
  console.log(`${ok ? 'OK   ' : 'FALLA'} ${nombre}${detalle ? ' · ' + detalle : ''}`);
  if (!ok) fallos++;
}

const IDIOMAS = {
  es: {
    ruta: '/test-era-ia/',
    visible: async (page) => ({
      mostrado: await page.locator('#error-step').isVisible(),
      texto: (await page.locator('#error-msg').innerText().catch(() => '')) || '',
    }),
    guardadoSi: /quedaron guardadas en nuestro sistema/,
    conexion: /No pudimos conectar con el servicio/,
    afirmaGuardado: /guardad/i,
  },
  en: {
    ruta: '/en/test-era-ia/',
    visible: async (page) => ({
      mostrado: await page.locator('#submit-error').isVisible(),
      texto: (await page.locator('#submit-error-text').innerText().catch(() => '')) || '',
    }),
    guardadoSi: /were saved in our system/,
    conexion: /We couldn't reach the service/,
    afirmaGuardado: /saved/i,
  },
};

const RESPUESTAS = {
  guardado_true: { status: 502, body: { ok: false, error: 'No pudimos generar el análisis en este momento.', guardado: true } },
  guardado_false: { status: 502, body: { ok: false, error: 'No pudimos generar el análisis en este momento.', guardado: false } },
  worker_antiguo: { status: 500, body: { error: 'Error interno. Intenta nuevamente.', detail: 'claude: Claude error: 401 invalid x-api-key' } },
  sin_conexion: 'abort',
  html_de_cloudflare: { status: 502, raw: '<html>Bad gateway</html>', contentType: 'text/html' },
  exito: { status: 200, body: { ok: true, diagnostico_id: 'x', era_operacional: 'ERA2-', era_comercial: 'ERA1+', interpretacion: 'Texto.', dolor_principal: 'Dolor.', oportunidad: 'Oportunidad.', fortaleza: 'Fortaleza.', alerta: 'Alerta.' } },
  token_vencido: { status: 401, body: { error: 'El acceso expiró. Solicita un nuevo código.' } },
};

async function correr(idioma, caso) {
  const cfg = IDIOMAS[idioma];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA });
  await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await ctx.addInitScript((tok) => sessionStorage.setItem('eraHandoff', JSON.stringify({
    token: tok, email: 'ana@example.com', nombre: 'Ana', era_mode: 'ambas', era_op: 'ERA2-', era_com: 'ERA1+',
    era_answers: { q1: 2, q2: 2, q3: 1, q4: 2, q5: 2, c1: 1, c2: 2, c3: 1, c4: 2, c5: 1 },
  })), TOKEN);
  const page = await ctx.newPage();
  const pedidos = [];
  await page.route(/funnel_events/, (r) => r.fulfill({ status: 201, body: '' }));
  await page.route(/z\.3gi\.cl/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":1}' }));
  await page.route(/diagnostico-api\.3gi\.cl\/analizar/, async (route) => {
    pedidos.push(route.request().method());
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const r = RESPUESTAS[caso];
    if (r === 'abort') return route.abort('failed');
    return route.fulfill({ status: r.status, headers: CORS, contentType: r.contentType || 'application/json', body: r.raw ?? JSON.stringify(r.body) });
  });
  await page.goto(BASE + cfg.ruta, { waitUntil: 'domcontentloaded' });
  // ES pasa por una pantalla puente antes del cuestionario; EN lo muestra directo.
  await page.waitForSelector(idioma === 'es' ? '#bridge-step' : '#quiz-step', { state: 'visible', timeout: 10000 });
  await page.evaluate(() => {
    CAMPOS.forEach((c) => {
      const el = document.getElementById('f-' + c.id);
      el.value = c.tipo === 'select' ? c.opciones[0] : 'respuesta de prueba';
      el.dispatchEvent(new Event(c.tipo === 'select' ? 'change' : 'input', { bubbles: true }));
    });
    if (typeof startQuiz === 'function') startQuiz();
  });
  await page.click('#btn-submit');
  await page.waitForTimeout(1500);
  const estado = {
    ...(await cfg.visible(page)),
    resultado: await page.locator('#result-step').isVisible(),
    gate: await page.locator('#gate-step').isVisible(),
    pedidos: pedidos.filter((m) => m === 'POST').length,
  };
  await browser.close();
  return { cfg, estado };
}

for (const idioma of ['es', 'en']) {
  const etiqueta = idioma.toUpperCase();
  let r = await correr(idioma, 'guardado_true');
  check(`[${etiqueta}] guardado:true → muestra el error y dice que están guardadas`, r.estado.mostrado && r.cfg.guardadoSi.test(r.estado.texto), r.estado.texto.slice(0, 60));

  for (const caso of ['guardado_false', 'worker_antiguo', 'sin_conexion', 'html_de_cloudflare']) {
    r = await correr(idioma, caso);
    check(`[${etiqueta}] ${caso} → NO afirma que están guardadas`, r.estado.mostrado && r.cfg.conexion.test(r.estado.texto) && !r.cfg.afirmaGuardado.test(r.estado.texto), r.estado.texto.slice(0, 60));
    check(`[${etiqueta}] ${caso} → no filtra «Error interno» ni detalles`, !/Error interno|detail|x-api-key|Internal/i.test(r.estado.texto));
  }

  r = await correr(idioma, 'exito');
  check(`[${etiqueta}] éxito → muestra el informe y ningún error`, r.estado.resultado && !r.estado.mostrado);

  r = await correr(idioma, 'token_vencido');
  check(`[${etiqueta}] 401 → vuelve a pedir el código (sin pantalla de error)`, r.estado.gate && !r.estado.mostrado);
}

console.log(fallos ? `\n${fallos} verificación(es) fallaron` : '\nTodas las verificaciones pasaron');
process.exit(fallos ? 1 : 0);
