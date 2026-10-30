// Prueba de punta a punta del Test ERA en PRODUCCIÓN (3gi.cl): quiz -> OTP -> 8 preguntas -> /analizar -> informe.
// Habla con el Worker real (diagnostico-api.3gi.cl). Intercepta funnel_events/PostHog/GTM/LinkedIn para no ensuciar las métricas.
//
// EFECTOS REALES (avisar antes de correrla): crea una fila en diagnostico_completions, envía 1 correo con el código,
// 1 con el resultado y 1 aviso interno a gonzalo@3gi.cl, y 1 mensaje de Telegram. Después hay que respaldar y borrar
// esa fila por id exacto (ver 3gi-platform/CLAUDE.md, sección Diagnóstico IA). Límite del Worker: 5 códigos por correo por hora.
//
// El código OTP no llega a esta máquina (va a la bandeja de gonzalo@3gi.cl): el script imprime `OTP_SOLICITADO diag_id=...`,
// se lee `otp_code` de diagnostico_completions de esa fila y se escribe en $ERA_E2E_DIR/otp.txt (por defecto /tmp/era-e2e).
// Uso (desde la raíz de 3gi-web): node scripts/manual-tests/test-era-e2e-produccion.mjs
import { chromium } from 'playwright';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';

const DIR = process.env.ERA_E2E_DIR || '/tmp/era-e2e';
mkdirSync(DIR, { recursive: true });
const LOG = (m) => { console.log(m); };
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const NOMBRE = '[PRUEBA E2E] Claude';
const EMAIL = 'gonzalo@3gi.cl';

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1366, height: 900 } });
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
const page = await ctx.newPage();

const bloqueados = [];
await page.route(/funnel_events/, (r) => { bloqueados.push('funnel_events'); r.fulfill({ status: 201, body: '' }); });
await page.route(/z\.3gi\.cl|googletagmanager|google-analytics|linkedin\.com|posthog/, (r) => { bloqueados.push(new URL(r.request().url()).host); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });

const worker = [];
page.on('response', async (res) => {
  const u = res.url();
  if (!u.includes('diagnostico-api.3gi.cl')) return;
  let cuerpo = null;
  try { cuerpo = await res.json(); } catch { /* sin JSON */ }
  const resumen = cuerpo ? Object.fromEntries(Object.entries(cuerpo).map(([k, v]) => [k, typeof v === 'string' && v.length > 70 ? v.slice(0, 70) + '…' : (k === 'access_token' ? '(oculto)' : v)])) : null;
  worker.push({ ruta: new URL(u).pathname, status: res.status(), cuerpo: resumen });
});
page.on('pageerror', (e) => LOG('PAGEERROR ' + e.message));

// 1) Quiz de 10 preguntas
await page.goto('https://3gi.cl/test-era/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await page.evaluate(() => startQuiz('abajo'));
for (let i = 0; i < 10; i++) {
  await page.waitForSelector('#opt-1', { state: 'attached', timeout: 10000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.getElementById('opt-1').click());
  await page.waitForTimeout(900);
}
await page.waitForSelector('#gate-step', { state: 'visible', timeout: 15000 });
LOG('QUIZ_COMPLETO');

// 2) Pedir el código
await page.fill('#g-nombre', NOMBRE);
await page.fill('#g-email', EMAIL);
await page.evaluate(() => gateOtp());
await page.waitForSelector('#gate-otp-wrap', { state: 'visible', timeout: 20000 });
const diagId = await page.evaluate(() => gateDiagId);
writeFileSync(`${DIR}/diag_id.txt`, String(diagId));
LOG(`OTP_SOLICITADO diag_id=${diagId}`);

// 3) Esperar el código (lo deja un archivo)
const OTPF = `${DIR}/otp.txt`;
let otp = null;
for (let i = 0; i < 240 && !otp; i++) {
  if (existsSync(OTPF)) otp = readFileSync(OTPF, 'utf8').trim();
  else await page.waitForTimeout(1000);
}
if (!otp) { LOG('SIN_OTP_TIMEOUT'); await browser.close(); process.exit(2); }
await page.fill('#g-otp', otp);
await page.waitForURL(/test-era-ia/, { timeout: 20000 });
LOG('OTP_VERIFICADO');

// 4) Las 8 preguntas abiertas
await page.waitForSelector('#bridge-step', { state: 'visible', timeout: 15000 });
await page.evaluate(() => {
  const textos = {
    sector: 'Distribución de insumos industriales', tamanio: '10-15 empleados', modelo: 'B2B, venta recurrente a empresas',
    objetivo: 'Duplicar las ventas sin contratar más gente', intentos: 'Un ERP básico que casi no se usa',
    decision_sin_datos: 'Cuánto stock comprar cada mes', proceso_clave: 'Cotizaciones a clientes', experiencia_ia: 'Solo uso ocasional de ChatGPT',
  };
  CAMPOS.forEach((c) => {
    const el = document.getElementById('f-' + c.id);
    if (c.tipo === 'select') el.value = c.opciones[1] ?? c.opciones[0];
    else el.value = textos[c.id] ? '[PRUEBA E2E] ' + textos[c.id] : '[PRUEBA E2E] respuesta de prueba';
    el.dispatchEvent(new Event(c.tipo === 'select' ? 'change' : 'input', { bubbles: true }));
  });
  startQuiz();
});
await page.waitForTimeout(500);
await page.evaluate(() => document.getElementById('btn-submit').click());
LOG('ANALIZAR_ENVIADO');

// 5) Resultado o error
const t0 = Date.now();
let desenlace = null;
while (Date.now() - t0 < 90000 && !desenlace) {
  if (await page.locator('#result-step').isVisible()) desenlace = 'RESULTADO';
  else if (await page.locator('#error-step').isVisible()) desenlace = 'ERROR';
  else if (await page.locator('#gate-step').isVisible()) desenlace = 'GATE';
  else await page.waitForTimeout(500);
}
const segundos = ((Date.now() - t0) / 1000).toFixed(1);
let textoVisible = '';
if (desenlace === 'RESULTADO') textoVisible = (await page.locator('#result-step').innerText()).slice(0, 700);
if (desenlace === 'ERROR') textoVisible = await page.locator('#error-msg').innerText();
await page.screenshot({ path: `${DIR}/resultado.png`, fullPage: true });
LOG(JSON.stringify({ desenlace, segundos, textoVisible, worker, bloqueados: [...new Set(bloqueados)], diagId }, null, 1));
writeFileSync(`${DIR}/resumen.json`, JSON.stringify({ desenlace, segundos, textoVisible, worker, diagId }, null, 1));
await browser.close();
