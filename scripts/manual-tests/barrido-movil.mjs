#!/usr/bin/env node
/**
 * barrido-movil.mjs — prueba manual (no CI): barre TODAS las páginas del build en móvil (375 px) y
 * escritorio (1280 px) y mide tres cosas que ninguna otra prueba del repo mira:
 *   1. Desborde horizontal: documentElement.scrollWidth mayor que el ancho de la ventana (FALLA).
 *   2. Contraste del texto: razón WCAG sobre el fondo opaco REAL (4,5:1; 3:1 si es texto grande) (FALLA).
 *   3. Líneas del h1 en 375 px (solo informativo: es una decisión de diseño, no un fallo).
 *
 * Origen: 2026-11-20, barrido de prueba sobre el dist local (revisión de maquina-ia-scrollweb). Encontró
 * texto verde de marca sobre el gris claro de las secciones (1,43:1), microtexto al 25-45 % de opacidad
 * (2,2 a 2,9:1), texto blanco sobre el botón verde de WhatsApp (1,98:1) y la tabla de cookies de
 * /privacidad desbordando 45 px a 375 px. Lighthouse no se corrió, así que esto no lo reemplaza.
 *
 * Aislamiento: sirve el dist desde 127.0.0.1 y ABORTA toda petición a otro host. No escribe nada en
 * Supabase, PostHog ni Sentry (los tests con Playwright inflaron funnel_events el 2026-10-17).
 * Las fuentes son locales (@fontsource), así que bloquear lo externo no cambia el salto de línea.
 *
 * Límites conocidos (no los oculta el resultado):
 *   - Solo mide texto con un fondo opaco resuelto por los ancestros. Fondos con imagen o degradado se
 *     cuentan como «indeterminados» y se imprimen; no se evalúan.
 *   - No mide pseudo-elementos (::before/::after) ni texto dentro de <svg>.
 *   - Cuenta el texto de contenido colapsado (por ejemplo respuestas del FAQ): se ve al abrirlas.
 *
 * Exenciones, cada una con su motivo (si agregas una, justifícala aquí):
 *   - Páginas EXCLUIDAS: activos de contenido que no son páginas del sitio.
 *   - Elementos dentro de [aria-hidden="true"]: decorativos por definición.
 *   - Texto de 40 px o más con opacidad baja: numerales y letras de fondo decorativas.
 *
 * Uso (requiere un build previo):
 *   npm run build && node scripts/manual-tests/barrido-movil.mjs [carpetaDist] [--json=archivo.json]
 *   (carpetaDist por defecto: dist). Sale con código 1 si hay desborde o contraste insuficiente.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const DIST = path.resolve(args.find((a) => !a.startsWith('--')) || 'dist');
const JSON_OUT = (args.find((a) => a.startsWith('--json=')) || '').slice(7);
if (!fs.existsSync(DIST)) { console.error(`No existe ${DIST}. Corre «npm run build» primero.`); process.exit(2); }

const VIEWPORTS = [{ w: 375, h: 812 }, { w: 1280, h: 800 }];
const EXCLUIDAS = new Set(['/contenido/carrusel-mayo1-era-dos-lados.html']); // activo de contenido: slides en fila horizontal por diseño
const MAX_FALLAS_POR_PAGINA = 40;
// Pendientes conocidos: se IMPRIMEN pero no hacen fallar. Cada uno lleva su motivo; si deja de fallar, el script avisa para quitarlo.
// (vacío desde 2026-11-20: los colores de nivel ERA se resolvieron con variantes oscuras sobre fondo claro)
const PENDIENTES_CONOCIDOS = [];

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = http.createServer((req, res) => {
  let f = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

const paginas = [];
(function recorrer(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) recorrer(f);
    else if (e.name.endsWith('.html')) paginas.push('/' + path.relative(DIST, f).replace(/index\.html$/, ''));
  }
})(DIST);
paginas.sort();

/** Corre DENTRO de la página. Devuelve desborde, líneas del h1 y fallas de contraste. */
function medir(maxFallas) {
  const num = (s) => parseFloat(s);
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; };
  const encima = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const razon = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const sel = (el) => `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : ''}`;

  const out = { desborde: null, h1: null, fallas: [], evaluados: 0, indeterminados: 0 };
  const iw = window.innerWidth, sw = document.documentElement.scrollWidth;
  if (sw > iw + 1) {
    const culpables = [];
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > iw + 1 && getComputedStyle(el).position !== 'fixed') culpables.push(`${sel(el)} (+${Math.round(r.right - iw)}px)`);
    }
    out.desborde = { scrollWidth: sw, innerWidth: iw, culpables: culpables.slice(0, 4) };
  }
  const h1 = document.querySelector('h1');
  if (h1) { const cs = getComputedStyle(h1); const lh = num(cs.lineHeight) || num(cs.fontSize) * 1.2; out.h1 = Math.round(h1.getBoundingClientRect().height / lh); }

  const vistos = new Map();
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName.toUpperCase()) || el.closest('svg')) continue;
    const propio = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim().length > 1).map((n) => n.textContent.trim()).join(' ');
    if (!propio) continue;
    if (el.closest('[aria-hidden="true"]')) continue; // exención: decorativo
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= num(getComputedStyle(e).opacity);
    if (op < 0.05) continue;
    const fg0 = parse(cs.color); if (!fg0) continue;
    const px = num(cs.fontSize), peso = parseInt(cs.fontWeight, 10) || 400;
    if (px >= 40 && fg0.a * op < 0.6) continue; // exención: numeral/letra decorativa grande y tenue
    const capas = []; let indet = false, opaco = false;
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e), bg = parse(s.backgroundColor);
      if (s.backgroundImage && s.backgroundImage !== 'none') indet = true;
      if (bg && bg.a > 0) { capas.push(bg); if (bg.a >= 1) { opaco = true; break; } }
    }
    out.evaluados++;
    if (indet || !opaco) { out.indeterminados++; continue; } // sin fondo opaco resuelto no se supone blanco: la marca es oscura
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) base = encima(capas[i], base);
    const fg = encima({ ...fg0, a: fg0.a * op }, base);
    const necesita = (px >= 24 || (px >= 18.66 && peso >= 700)) ? 3 : 4.5, tiene = razon(fg, base);
    if (tiene < necesita) {
      const k = `${cs.color}|${px}|${tiene.toFixed(2)}`;
      if (!vistos.has(k)) vistos.set(k, { razon: +tiene.toFixed(2), necesita, px, color: cs.color, ejemplo: propio.slice(0, 40), n: 0 });
      vistos.get(k).n++;
    }
  }
  out.fallas = [...vistos.values()].sort((a, b) => a.razon - b.razon).slice(0, maxFallas);
  return out;
}

const browser = await chromium.launch();
const resultados = [];
const bloqueados = new Map();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, locale: 'es-CL' });
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(ORIGIN) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    try { const h = new URL(u).host; bloqueados.set(h, (bloqueados.get(h) || 0) + 1); } catch { /* URL no analizable: se aborta igual */ }
    return route.abort();
  });
  for (const p of paginas) {
    if (EXCLUIDAS.has(p)) continue;
    const page = await ctx.newPage();
    try {
      await page.goto(ORIGIN + p, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(600);
      resultados.push({ ancho: vp.w, pagina: p, ...(await page.evaluate(medir, MAX_FALLAS_POR_PAGINA)) });
    } catch (e) {
      resultados.push({ ancho: vp.w, pagina: p, error: String(e.message).slice(0, 100) });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.close();

const errores = resultados.filter((r) => r.error);
const desbordes = resultados.filter((r) => r.desborde);
const conFalla = resultados.filter((r) => r.fallas?.length);
const indet = resultados.reduce((s, r) => s + (r.indeterminados || 0), 0);
const evaluados = resultados.reduce((s, r) => s + (r.evaluados || 0), 0);

console.log(`Páginas: ${paginas.length - EXCLUIDAS.size} · mediciones: ${resultados.length} · elementos de texto: ${evaluados} (${indet} indeterminados por fondo con imagen/degradado)`);
console.log(`Hosts externos bloqueados: ${JSON.stringify([...bloqueados])}`);
for (const r of errores) console.log(`  ERROR ${r.ancho}px ${r.pagina}: ${r.error}`);
console.log('\nDesborde horizontal:');
for (const r of desbordes) console.log(`  ${r.ancho}px ${r.pagina}  scrollWidth ${r.desborde.scrollWidth} > ${r.desborde.innerWidth} · ${r.desborde.culpables.join(', ')}`);
if (!desbordes.length) console.log('  ninguno');
const largos = resultados.filter((r) => r.ancho === 375 && r.h1 >= 6);
console.log(`\nH1 de 6 o más líneas en 375px (informativo): ${largos.length ? largos.map((r) => `${r.pagina} (${r.h1})`).join(', ') : 'ninguno'}`);
console.log('\nContraste insuficiente (peores por color y tamaño):');
const grupos = new Map();
for (const r of conFalla) for (const f of r.fallas) {
  const k = `${f.color}|${f.px}`; const g = grupos.get(k) || { ...f, paginas: new Set(), n: 0 };
  g.razon = Math.min(g.razon, f.razon); g.n += f.n; g.paginas.add(r.pagina); grupos.set(k, g);
}
const esConocido = (g) => PENDIENTES_CONOCIDOS.find((p) => p.colores.includes(g.color) && g.ejemplo.startsWith(p.ejemplo));
const nuevos = [...grupos.values()].filter((g) => !esConocido(g));
const conocidos = [...grupos.values()].filter(esConocido);
for (const g of nuevos.sort((a, b) => b.paginas.size - a.paginas.size).slice(0, 25))
  console.log(`  ${g.color.padEnd(26)} ${String(g.px).padStart(5)}px  peor ${g.razon}:1 (< ${g.necesita})  ${g.paginas.size} páginas, ${g.n} elementos  ej: «${g.ejemplo}»`);
if (!nuevos.length) console.log('  ninguno nuevo');
console.log('\nPendientes conocidos (no hacen fallar):');
for (const p of PENDIENTES_CONOCIDOS) {
  const hits = conocidos.filter((g) => esConocido(g) === p);
  console.log(hits.length ? `  ${hits.length} combinaciones · ${p.motivo}` : `  YA NO FALLA: quita esta excepción -> ${p.motivo.slice(0, 60)}…`);
}

if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ resultados, bloqueados: [...bloqueados] }, null, 1));
const falla = errores.length || desbordes.length || nuevos.length;
console.log(`\n${falla ? '❌ FALLA' : '✅ OK'}: ${desbordes.length} desbordes, ${nuevos.length} combinaciones de contraste nuevas (${conocidos.length} conocidas), ${errores.length} errores de carga`);
process.exit(falla ? 1 : 0);
