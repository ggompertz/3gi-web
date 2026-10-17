#!/usr/bin/env node
/**
 * banner-movil.mjs — prueba manual (no CI): el banner de cookies no debe tapar el botón
 * "Empezar Test ERA" al cargar /test-era/ en pantallas de móvil (ES y EN).
 *
 * Contexto: el banner fijo de ~124 px tapaba la mitad inferior del botón en 390x844 (iPhone 12 a 14),
 * justo en el tráfico de la campaña de LinkedIn (ver Memoria de Soluciones #12 y 3gi-web/CLAUDE.md).
 *
 * Criterios por cada combinación de pantalla: (1) el banner mide 100 px o menos; (2) el CENTRO del botón
 * no queda bajo el banner (el toque natural cae en el centro). Los cruces parciales (solo el borde) se
 * cuentan pero no hacen fallar: un CSS de banner inferior no puede eliminarlos porque el botón queda
 * siempre a ~700 px del borde superior, así que roza el banner en cierto rango de alturas.
 *
 * Supabase y PostHog se interceptan: no se escribe nada. Uso:
 *   node scripts/manual-tests/banner-movil.mjs [baseUrl]   (por defecto http://localhost:4399)
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:4399';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.30.1';
const anchos = [320, 360, 375, 390, 393, 412, 414, 430];
const altos = [568, 640, 667, 736, 780, 812, 844, 852, 896, 915, 932];
const rutas = [['/test-era/', /Empezar/], ['/en/test-era/', /Start/]];

// Línea base medida el 2026-10-17 con el banner compacto (antes, con el banner de 124 px: 28 de 176).
// Bajarla cuando se suba el botón en móvil; la prueba falla si empeora.
const MAX_CENTROS_TAPADOS = 17;
let fallos = 0;
let combinaciones = 0;
let cruces = 0;
let centrosTapados = 0;
let bannersAltos = 0;
const browser = await chromium.launch();
for (const [ruta, textoBoton] of rutas) {
  for (const w of anchos) {
    const ctx = await browser.newContext({ viewport: { width: w, height: altos[0] }, userAgent: UA, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
    const page = await ctx.newPage();
    await page.route(/funnel_events/, (r) => r.fulfill({ status: 201, body: '' }));
    await page.route(/z\.3gi\.cl/, (r) => (r.request().method() === 'POST' ? r.fulfill({ status: 200, body: '{}' }) : r.continue()));
    await page.goto(BASE + ruta, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(800);
    for (const h of altos) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(120);
      const m = await page.evaluate((src) => {
        const re = new RegExp(src);
        const btn = [...document.querySelectorAll('button.btn-primary')].find((b) => re.test(b.textContent));
        const bn = document.getElementById('tgi-consent');
        if (!btn || !bn || bn.hidden) return { sinDatos: true };
        const a = btn.getBoundingClientRect();
        const c = bn.getBoundingClientRect();
        const enPantalla = a.bottom > 0 && a.top < innerHeight;
        const cruza = enPantalla && a.bottom > c.top && a.top < c.bottom;
        const centro = (a.top + a.bottom) / 2;
        const centroTapado = enPantalla && centro > c.top && centro < c.bottom;
        return { altoBanner: Math.round(c.height), cruza, centroTapado, botonTop: Math.round(a.top), botonBottom: Math.round(a.bottom), bannerTop: Math.round(c.top) };
      }, textoBoton.source);
      combinaciones++;
      if (m.sinDatos) { console.log(`FALLA ${ruta} ${w}x${h}: no se encontró el botón o el banner`); fallos++; continue; }
      if (m.cruza) cruces++;
      if (m.centroTapado) centrosTapados++;
      if (m.altoBanner > 100) bannersAltos++;
      if (m.altoBanner > 100) fallos++;
      if (m.centroTapado) {
        console.log(`FALLA ${ruta} ${w}x${h}: banner ${m.altoBanner}px, botón ${m.botonTop}-${m.botonBottom}, banner desde ${m.bannerTop}${m.cruza ? ' (CENTRO TAPADO)' : ''}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`\nCruces parciales: ${cruces} · centro del botón tapado: ${centrosTapados} · banners de más de 100 px: ${bannersAltos}`);
if (centrosTapados > MAX_CENTROS_TAPADOS) fallos++;
console.log(fallos ? `\nFALLA: banners altos o más centros tapados que la línea base (${MAX_CENTROS_TAPADOS}) en ${combinaciones} combinaciones` : `\nTodo en orden: ${combinaciones} combinaciones, banner de 100 px o menos y centros tapados (${centrosTapados}) dentro de la línea base (${MAX_CENTROS_TAPADOS})`);
process.exit(fallos ? 1 : 0);
