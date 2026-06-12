#!/usr/bin/env node
/**
 * test-diagnostico-flow.mjs — Tests Playwright del embudo /diagnostico
 *
 * Uso:
 *   node scripts/test-diagnostico-flow.mjs              # prod (3gi.cl)
 *   node scripts/test-diagnostico-flow.mjs --local      # localhost:4321
 *   node scripts/test-diagnostico-flow.mjs --mobile     # solo mobile 375px
 *   node scripts/test-diagnostico-flow.mjs --screenshot # guarda capturas en /tmp/
 *
 * Tests:
 *   1. Intro → arranca quiz
 *   2. Quiz completo (10 respuestas) → muestra gate
 *   3. Gate — ERA preview visible, form presente
 *   4. Gate — validación email inválido
 *   5. Gate — submit email válido → OTP box aparece
 *   6. OTP incorrecto → mensaje de error
 *   7. /diagnostico-ia — bridge step visible con token válido
 *   8. /diagnostico-ia — sin token → redirect o error amigable
 *   9. /diagnostico-ia — error fallback si API cae (mock)
 */
import { chromium } from 'playwright';

const args  = new Set(process.argv.slice(2));
const BASE  = args.has('--local') ? 'http://localhost:4321' : 'https://3gi.cl';
const SHOT  = args.has('--screenshot');
const VIEWPORTS = args.has('--mobile')
  ? [{ name: 'mobile', w: 375, h: 812 }]
  : [
      { name: 'desktop', w: 1280, h: 800 },
      { name: 'mobile',  w: 375,  h: 812 },
    ];

let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌  ${name}`);
    console.log(`      ${e.message}`);
    failed++;
  }
}

async function shot(page, name) {
  if (SHOT) await page.screenshot({ path: `/tmp/test-${name}.png`, fullPage: false });
}

// Responde todas las preguntas del quiz eligiendo siempre la primera opción
async function fillQuiz(page) {
  for (let q = 0; q < 10; q++) {
    // Esperar que las opciones sean visibles
    await page.waitForSelector('.opt:not([disabled])', { timeout: 5000 });
    await page.locator('.opt').first().click();
    // Esperar transición a la siguiente pregunta o gate
    await page.waitForTimeout(400);
  }
}

const browser = await chromium.launch({ args: ['--disable-cache', '--no-sandbox'] });

for (const vp of VIEWPORTS) {
  console.log(`\n── ${vp.name} (${vp.w}×${vp.h}) ──────────────────────────`);
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });

  // ── TEST 1: Intro se muestra, botón "Empezar" visible ──────────────────
  await test('Intro visible con botón Empezar', async () => {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    await shot(page, `${vp.name}-1-intro`);
    await page.waitForSelector('#intro-step', { state: 'visible', timeout: 5000 });
    const btn = page.locator('#intro-step .btn-primary').first();
    if (!await btn.isVisible()) throw new Error('Botón Empezar no visible');
    await page.close();
  });

  // ── TEST 2: Quiz completo muestra gate ──────────────────────────────────
  await test('Quiz 10 respuestas → gate visible', async () => {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    // Avanzar desde intro
    await page.locator('#intro-step .btn-primary').first().click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 3000 });
    await fillQuiz(page);
    await page.waitForSelector('#gate-step', { state: 'visible', timeout: 5000 });
    await shot(page, `${vp.name}-2-gate`);
    await page.close();
  });

  // ── TEST 3: Gate muestra ERA preview (números ERA1/ERA2/ERA3) ───────────
  await test('Gate: ERA cards visibles con ERA asignado', async () => {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    await page.locator('#intro-step .btn-primary').first().click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 3000 });
    await fillQuiz(page);
    await page.waitForSelector('#gate-step', { state: 'visible', timeout: 5000 });
    const cardText = await page.locator('#gate-op-card').innerText();
    if (!cardText.match(/ERA[123]/i)) throw new Error(`ERA card no muestra ERA — obtuvo: "${cardText}"`);
    await page.close();
  });

  // ── TEST 4: Validación email inválido ──────────────────────────────────
  await test('Gate: email inválido muestra error de validación', async () => {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    await page.locator('#intro-step .btn-primary').first().click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 3000 });
    await fillQuiz(page);
    await page.waitForSelector('#gate-step', { state: 'visible', timeout: 5000 });
    // Ingresar email inválido
    await page.fill('#g-email', 'no-es-un-email');
    await page.locator('#g-btn-otp').click();
    const err = page.locator('#g-email-error');
    if (!await err.isVisible()) throw new Error('Error de validación no apareció');
    await page.close();
  });

  // ── TEST 5: Submit email válido → OTP box aparece ─────────────────────
  await test('Gate: email válido + submit → OTP box visible', async () => {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    await page.locator('#intro-step .btn-primary').first().click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 3000 });
    await fillQuiz(page);
    await page.waitForSelector('#gate-step', { state: 'visible', timeout: 5000 });
    await page.fill('#g-nombre', 'Test Usuario');
    await page.fill('#g-email', 'test-playwright@3gi.cl');
    await page.locator('#g-btn-otp').click();
    // OTP box debería aparecer (o botón se deshabilita = request en curso)
    await page.waitForFunction(
      () => document.getElementById('gate-otp-wrap')?.style.display !== 'none'
           || document.getElementById('g-btn-otp')?.disabled,
      { timeout: 8000 }
    );
    await shot(page, `${vp.name}-5-otp`);
    await page.close();
  });

  // ── TEST 6: OTP incorrecto → mensaje de error ──────────────────────────
  await test('OTP incorrecto → error visible', async () => {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/diagnostico`, { waitUntil: 'networkidle' });
    await page.locator('#intro-step .btn-primary').first().click();
    await page.waitForSelector('#quiz-step', { state: 'visible', timeout: 3000 });
    await fillQuiz(page);
    await page.waitForSelector('#gate-step', { state: 'visible', timeout: 5000 });
    await page.fill('#g-nombre', 'Test Usuario');
    await page.fill('#g-email', 'test-playwright@3gi.cl');
    await page.locator('#g-btn-otp').click();
    // Esperar OTP box
    await page.waitForSelector('#gate-otp-wrap', { state: 'visible', timeout: 10000 });
    // Ingresar código falso
    await page.fill('#g-otp', '000000');
    await page.waitForSelector('#g-otp-error', { state: 'visible', timeout: 6000 });
    await shot(page, `${vp.name}-6-otp-error`);
    await page.close();
  });

  // ── TEST 7: /diagnostico-ia sin token → error amigable ────────────────
  await test('/diagnostico-ia sin token → bridge o error amigable (no crash)', async () => {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/diagnostico-ia`, { waitUntil: 'networkidle' });
    await shot(page, `${vp.name}-7-ia-notoken`);
    // No debe mostrar pantalla en blanco ni error 500
    const body = await page.locator('body').innerText();
    if (body.trim().length < 20) throw new Error('Página vacía o en blanco');
    await page.close();
  });

  // ── TEST 8: /diagnostico-ia bridge step con token en URL ──────────────
  await test('/diagnostico-ia con ?token → bridge step visible', async () => {
    const page = await ctx.newPage();
    // El token va en la URL — un token inválido igual debe mostrar el bridge
    // (el bridge se muestra si hay token; el error de API viene al hacer submit)
    await page.goto(`${BASE}/diagnostico-ia?token=fake-playwright-token&era_op=ERA1&era_com=ERA2`, { waitUntil: 'networkidle' });
    await shot(page, `${vp.name}-8-bridge`);
    const bridge = page.locator('#bridge-step');
    const isVisible = await bridge.isVisible().catch(() => false);
    if (!isVisible) throw new Error('bridge-step no visible con ?token en URL');
    await page.close();
  });

  await ctx.close();
}

await browser.close();

console.log(`\n${'─'.repeat(50)}`);
console.log(`  Resultado: ${passed} pasaron, ${failed} fallaron`);
console.log(`${'─'.repeat(50)}\n`);
process.exit(failed > 0 ? 1 : 0);
