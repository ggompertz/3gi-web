#!/usr/bin/env node
/**
 * test-e2e-full.mjs — SCRIPT DE PRUEBAS MANUAL, NO AUTOMÁTICO/CI.
 *
 * Corre contra 3gi.cl en PRODUCCIÓN por defecto (no un entorno de staging/mock).
 * Cada corrida crea un diagnostico_id real en Supabase y envía hasta 3 OTPs
 * reales al correo indicado — requiere que una persona los lea y los tipee
 * cuando el script los pida por consola. No apto para pipelines automatizados.
 *
 * Tests E2E con flujo real de OTP
 *
 * Uso:
 *   node scripts/manual-tests/test-e2e-full.mjs
 *   node scripts/manual-tests/test-e2e-full.mjs --local    # localhost:4321
 *
 * Requiere que el usuario ingrese el OTP desde su correo cuando se solicite.
 * Usa ggompertz@gmail.com por defecto.
 */
import { chromium } from 'playwright';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const args  = new Set(process.argv.slice(2));
const BASE  = args.has('--local') ? 'http://localhost:4321' : 'https://3gi.cl';
const EMAIL = 'ggompertz@gmail.com';
const NOMBRE = 'Gonzalo';

const rl = readline.createInterface({ input, output });

let passed = 0, failed = 0;

function log(msg)  { console.log(`\n  ${msg}`); }
function ok(name)  { console.log(`  ✅  ${name}`); passed++; }
function fail(name, err) { console.log(`  ❌  ${name}\n      ${err}`); failed++; }

async function askOtp(email) {
  console.log(`\n  📧 Se envió un OTP a ${email}`);
  const code = await rl.question('  → Ingresa el código OTP: ');
  return code.trim();
}

async function fillQuiz(page, firstOpt = true) {
  for (let q = 0; q < 10; q++) {
    await page.waitForSelector('.opt:not([disabled])', { timeout: 6000 });
    const opts = page.locator('.opt');
    // Alternar opciones para scores más variados
    const idx = firstOpt ? 0 : Math.min(q % 3, (await opts.count()) - 1);
    await opts.nth(idx).click();
    await page.waitForTimeout(350);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Flujo completo — Quiz → Gate → OTP real → /diagnostico-ia
// ─────────────────────────────────────────────────────────────────────────────
async function test1(browser) {
  console.log('\n══ TEST 1: Flujo completo desktop — Quiz → Gate → OTP → /diagnostico-ia ══');
  const ctx  = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  try {
    // 1. Llegar a /diagnostico
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    ok('Página /diagnostico cargó');

    // 2. Intro → quiz
    await page.locator('#intro-step .btn-primary').first().click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 4000 });
    ok('Intro → Quiz arrancó');

    // 3. Responder 10 preguntas
    await fillQuiz(page, false);
    await page.waitForSelector('#gate-step', { state: 'visible', timeout: 6000 });
    const eraText = await page.locator('#gate-op-card').innerText();
    ok(`Quiz completado → Gate visible (ERA: ${eraText.match(/ERA[123][+-]?/)?.[0] ?? '?'})`);

    // 4. Llenar form gate
    await page.fill('#g-nombre', NOMBRE);
    await page.fill('#g-email', EMAIL);
    await page.screenshot({ path: '/tmp/e2e-t1-gate.png' });

    // Capturar diagnostico_id desde la respuesta de request-otp
    const otpReqPromise = page.waitForResponse(r => r.url().includes('/request-otp'), { timeout: 12000 });
    await page.locator('#g-btn-otp').click();
    const otpReqRes = await otpReqPromise;
    const otpReqData = await otpReqRes.json();
    const diagId = otpReqData.diagnostico_id;
    if (!diagId) throw new Error(`No se recibió diagnostico_id: ${JSON.stringify(otpReqData)}`);

    // 5. Esperar OTP box
    await page.waitForSelector('#gate-otp-wrap', { state: 'visible', timeout: 6000 });
    ok(`Email enviado a ${EMAIL} — OTP box visible (diagId: ${diagId.slice(0,8)}...)`);
    await page.screenshot({ path: '/tmp/e2e-t1-otp-box.png' });

    // 6. Pedir OTP al usuario y verificar via fetch directo
    const otp = await askOtp(EMAIL);
    const WORKER = 'https://diagnostico-api.3g-ia-agents.com';
    const verifyBody = await page.evaluate(async ({ worker, id, code }) => {
      const res = await fetch(`${worker}/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostico_id: id, otp_code: code }),
      });
      return res.json();
    }, { worker: WORKER, id: diagId, code: otp });
    log(`verify-otp: ${JSON.stringify(verifyBody)}`);
    if (!verifyBody.ok) throw new Error(verifyBody.error || 'OTP incorrecto');

    // 7. Navegar manualmente a /diagnostico-ia con el token
    const params = new URLSearchParams({ token: verifyBody.access_token, era_op: 'ERA1', era_com: 'ERA1' });
    await page.goto(`${BASE}/diagnostico-ia?${params}`, { waitUntil: 'networkidle' });
    ok('OTP verificado → /diagnostico-ia ✓');
    await page.screenshot({ path: '/tmp/e2e-t1-bridge.png' });

    // 8. Bridge step visible
    await page.waitForSelector('#bridge-step', { state: 'visible', timeout: 5000 });
    ok('Bridge step visible en /diagnostico-ia');

    // 9. Pasar bridge → quiz de 8 preguntas
    await page.locator('#bridge-step .btn-primary').click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 4000 });
    ok('Bridge → Quiz 8 preguntas arrancó');

    // 10. Responder las 8 preguntas del postscan
    await page.waitForSelector('.f-input, .f-select', { timeout: 6000 });
    const textInputs = page.locator('input.f-input, textarea.f-input');
    const selects    = page.locator('select.f-select');
    const tCount = await textInputs.count();
    const sCount = await selects.count();
    for (let i = 0; i < tCount; i++) {
      await textInputs.nth(i).fill('Empresa de servicios logísticos B2B, 20 empleados, Chile');
    }
    for (let i = 0; i < sCount; i++) {
      const opts = await selects.nth(i).locator('option').all();
      if (opts.length > 1) await selects.nth(i).selectOption({ index: 1 });
    }
    await page.screenshot({ path: '/tmp/e2e-t1-postscan.png' });
    ok(`Postscan completado (${tCount} texto, ${sCount} select)`);

  } catch (e) {
    fail('Test 1', e.message);
    await page.screenshot({ path: '/tmp/e2e-t1-error.png' }).catch(() => {});
  } finally {
    await ctx.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: Flujo mobile 375px — mismo recorrido
// ─────────────────────────────────────────────────────────────────────────────
async function test2(browser) {
  console.log('\n══ TEST 2: Flujo mobile 375px — Quiz → Gate → OTP → bridge ══');
  const ctx  = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();

  try {
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    ok('Página /diagnostico cargó (mobile)');

    await page.locator('#intro-step .btn-primary').first().click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 4000 });
    await fillQuiz(page, true);
    await page.waitForSelector('#gate-step', { state: 'visible', timeout: 6000 });
    ok('Quiz completado → Gate visible (mobile)');

    // Verificar que el gate es usable en 375px (sin overflow)
    const gateBox = await page.locator('#gate-step').boundingBox();
    if (gateBox && gateBox.width > 390) throw new Error(`Gate demasiado ancho: ${gateBox.width}px`);
    ok('Gate cabe en 375px sin overflow');

    await page.fill('#g-nombre', NOMBRE);
    await page.fill('#g-email', EMAIL);
    await page.screenshot({ path: '/tmp/e2e-t2-gate-mobile.png' });
    const otpReqPromise2 = page.waitForResponse(r => r.url().includes('/request-otp'), { timeout: 12000 });
    await page.locator('#g-btn-otp').click();
    const otpReqRes2 = await otpReqPromise2;
    const diagId2 = (await otpReqRes2.json()).diagnostico_id;
    await page.waitForSelector('#gate-otp-wrap', { state: 'visible', timeout: 6000 });
    ok(`OTP box visible en mobile`);

    const otp2 = await askOtp(EMAIL);
    const WORKER = 'https://diagnostico-api.3g-ia-agents.com';
    const verifyBody2 = await page.evaluate(async ({ worker, id, code }) => {
      const res = await fetch(`${worker}/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostico_id: id, otp_code: code }),
      });
      return res.json();
    }, { worker: WORKER, id: diagId2, code: otp2 });
    if (!verifyBody2.ok) throw new Error(verifyBody2.error || 'OTP incorrecto');
    const params2 = new URLSearchParams({ token: verifyBody2.access_token, era_op: 'ERA1', era_com: 'ERA1' });
    await page.goto(`${BASE}/diagnostico-ia?${params2}`, { waitUntil: 'networkidle' });
    ok('OTP verificado → /diagnostico-ia (mobile)');
    await page.screenshot({ path: '/tmp/e2e-t2-bridge-mobile.png' });

    const bridgeBox = await page.locator('#bridge-step').boundingBox();
    if (bridgeBox && bridgeBox.width > 390) throw new Error(`Bridge demasiado ancho: ${bridgeBox.width}px`);
    ok('Bridge step cabe en 375px sin overflow');

  } catch (e) {
    fail('Test 2', e.message);
    await page.screenshot({ path: '/tmp/e2e-t2-error.png' }).catch(() => {});
  } finally {
    await ctx.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Reenvío OTP — pedir código, solicitar reenvío, verificar con el nuevo
// ─────────────────────────────────────────────────────────────────────────────
async function test3(browser) {
  console.log('\n══ TEST 3: Reenvío de OTP — verificar que "reenviar código" funciona ══');
  const ctx  = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  try {
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    await page.locator('#intro-step .btn-primary').first().click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 4000 });
    await fillQuiz(page, true);
    await page.waitForSelector('#gate-step', { state: 'visible', timeout: 6000 });

    await page.fill('#g-nombre', NOMBRE);
    await page.fill('#g-email', EMAIL);
    const otpReqPromise3a = page.waitForResponse(r => r.url().includes('/request-otp'), { timeout: 12000 });
    await page.locator('#g-btn-otp').click();
    const diagId3 = (await (await otpReqPromise3a).json()).diagnostico_id;
    await page.waitForSelector('#gate-otp-wrap', { state: 'visible', timeout: 6000 });
    ok('Primer OTP enviado');

    // Ingresar código incorrecto (verificar directo con diagId)
    const WORKER = 'https://diagnostico-api.3g-ia-agents.com';
    const wrongRes = await page.evaluate(async ({ worker, id }) => {
      const res = await fetch(`${worker}/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostico_id: id, otp_code: '000000' }),
      });
      return res.json();
    }, { worker: WORKER, id: diagId3 });
    if (wrongRes.ok) throw new Error('OTP 000000 no debería ser correcto');
    ok(`Código incorrecto → error: "${wrongRes.error}"`);

    // Pedir reenvío — gateResend() vuelve al form
    await page.locator('.otp-resend button').click();
    await page.waitForSelector('#gate-form', { state: 'visible', timeout: 5000 });
    ok('Botón "Reenviar código" → volvió al form de email');

    // Re-submit — capturar nuevo diagId (puede ser mismo con OTP distinto)
    const otpReqPromise3b = page.waitForResponse(r => r.url().includes('/request-otp'), { timeout: 12000 });
    await page.locator('#g-btn-otp').click();
    const diagId3b = (await (await otpReqPromise3b).json()).diagnostico_id;
    await page.waitForSelector('#gate-otp-wrap', { state: 'visible', timeout: 6000 });
    ok('Segundo OTP solicitado — OTP box visible');

    // Verificar con OTP real
    const otp3 = await askOtp(`${EMAIL} (código NUEVO)`);
    const verifyBody3 = await page.evaluate(async ({ worker, id, code }) => {
      const res = await fetch(`${worker}/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostico_id: id, otp_code: code }),
      });
      return res.json();
    }, { worker: WORKER, id: diagId3b, code: otp3 });
    if (!verifyBody3.ok) throw new Error(verifyBody3.error || 'OTP incorrecto');
    ok('OTP reenviado verificado → /diagnostico-ia ✓');
    await page.screenshot({ path: '/tmp/e2e-t3-resend-ok.png' });

  } catch (e) {
    fail('Test 3', e.message);
    await page.screenshot({ path: '/tmp/e2e-t3-error.png' }).catch(() => {});
  } finally {
    await ctx.close();
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(56)}`);
console.log(`  🎭 Tests E2E con OTP real — 3gi.cl /diagnostico`);
console.log(`  Email: ${EMAIL}`);
console.log(`  Base:  ${BASE}`);
console.log(`${'═'.repeat(56)}`);
console.log('\n  ⚠️  Mantén tu correo abierto — se pedirá el OTP 3 veces.\n');

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-cache', '--no-sandbox'],
});

await test1(browser);
await test2(browser);
await test3(browser);

await browser.close();
await rl.close();

console.log(`\n${'─'.repeat(56)}`);
console.log(`  Resultado: ${passed} pasaron, ${failed} fallaron`);
console.log(`  Screenshots en /tmp/e2e-t*.png`);
console.log(`${'─'.repeat(56)}\n`);
process.exit(failed > 0 ? 1 : 0);
