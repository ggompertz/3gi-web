// Prueba del interruptor de la Academia (src/data/academia.mjs): construye el sitio apagado y encendido (PUBLIC_ACADEMIA=1) en
// carpetas temporales y comprueba qué aparece en cada caso. Correr con: npm run test:academia (tarda unos 40 s).
// No escribe nada en el Supabase del embudo: solo construye, no carga páginas en un navegador.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'academia-'));
let fallas = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FALLA'} ${msg}`); if (!cond) fallas++; };

function construir(nombre, env) {
  const out = path.join(tmp, nombre);
  const e = { ...process.env }; delete e.PUBLIC_ACADEMIA; Object.assign(e, env);
  const r = spawnSync('npx', ['astro', 'build', '--outDir', out], { cwd: raiz, env: e, encoding: 'utf8' });
  if (r.status !== 0) { console.log((r.stdout + r.stderr).slice(-1500)); throw new Error(`el build «${nombre}» falló`); }
  return out;
}
const leer = (d, f) => (fs.existsSync(path.join(d, f)) ? fs.readFileSync(path.join(d, f), 'utf8') : null);
function archivos(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) archivos(p, acc); else if (/\.(html|txt|xml)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

try {
  const off = construir('apagado', {});
  const on = construir('encendido', { PUBLIC_ACADEMIA: '1' });

  // APAGADO: ningún rastro visible de la Academia
  ok(!fs.existsSync(path.join(off, 'academia')), 'apagado: no existe dist/academia');
  const rastros = archivos(off).filter((f) => /academia/i.test(fs.readFileSync(f, 'utf8')));
  ok(rastros.length === 0, `apagado: ningún archivo html, txt o xml menciona «academia» (${rastros.map((f) => path.relative(off, f)).join(', ') || 'ninguno'})`);

  // ENCENDIDO: aparecen las cinco piezas
  const pag = leer(on, 'academia/index.html');
  ok(!!pag, 'encendido: existe dist/academia/index.html');
  ok(pag && pag.includes('Academia 3GI') && pag.includes('Saca Valor a la IA · Módulo 1'), 'encendido: la página trae el título y el programa');
  ok(pag && /name="robots" content="noindex/i.test(pag), 'encendido por variable: la página lleva noindex (es solo una vista de revisión)');
  const contenido = pag ? pag.slice(pag.indexOf('<div class="pg-academia"'), pag.indexOf('<footer')) : '';
  ok(contenido.length > 500 && !/<button|<form|<input|<a\s/i.test(contenido), 'encendido: el contenido de la página no tiene botones, formularios, campos ni enlaces');
  ok(pag && !/hreflang="en"/.test(pag) && /hreflang="es"/.test(pag) && /hreflang="x-default"/.test(pag), 'encendido: solo hreflang es y x-default');
  ok(pag && !pag.includes('/en/academia') && !/class="lang-toggle"/.test(pag), 'encendido: sin selector de idioma ni enlace a /en/academia');
  const home = leer(on, 'index.html');
  ok(home && /<li><a href="\/academia"/.test(home), 'encendido: ítem «Academia» en el menú de la home (escritorio y móvil)');
  ok(home && (home.match(/href="\/academia"/g) || []).length >= 3, 'encendido: el enlace aparece en menú de escritorio, menú móvil y pie');
  ok(home && home.includes('existe la Academia 3GI, un programa aparte'), 'encendido: la frase del FAQ está en la home');
  ok(home && /existe la Academia 3GI, un programa aparte/.test(home.match(/application\/ld\+json">([\s\S]*?)<\/script>/g).join('')), 'encendido: la frase también está en el JSON-LD del FAQ');
  const homeEn = leer(on, 'en/index.html');
  ok(homeEn && !/academia|academy/i.test(homeEn.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')) , 'encendido: la home en inglés no menciona la Academia');
  ok((leer(on, 'llms.txt') || '').includes('Academia 3GI'), 'encendido: llms.txt la menciona');
  ok(!(leer(off, 'llms.txt') || '').includes('Academia'), 'apagado: llms.txt no la menciona');
  ok(!(leer(on, 'sitemap.xml') || '').includes('/academia'), 'el sitemap NO la incluye todavía (se agrega solo al abrir)');
  ok((leer(off, 'faq/index.html') || '') !== '' && !(leer(off, 'faq/index.html')).includes('Academia'), 'apagado: /faq no la menciona');
} catch (e) {
  console.log(`ERROR: ${e.message}`); fallas++;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(fallas ? `\n${fallas} comprobación(es) fallaron` : '\nTodas las comprobaciones pasaron');
process.exit(fallas ? 1 : 0);
