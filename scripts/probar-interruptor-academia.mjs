// Prueba del interruptor de la Academia (src/data/academia.mjs). Construye el sitio en sus dos modos y comprueba qué aparece:
//  - modo normal (hoy): /academia muestra solo «Página en construcción» y no hay ningún enlace ni mención en el resto del sitio;
//  - modo revisión (PUBLIC_ACADEMIA=1): página completa, ítem de menú, frase del FAQ y línea de llms.txt.
// Correr con: npm run test:academia (tarda unos 40 s). Solo construye: no abre navegador ni escribe en el Supabase del embudo.
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
// Texto del cuerpo de la página (entre el contenedor de la Academia y el pie), sin menú ni pie.
const contenidoDe = (pag) => (pag ? pag.slice(pag.indexOf('<div class="pg-academia"'), pag.indexOf('<footer')) : '');
const sinEnlaces = (c) => c.length > 500 && !/<button|<form|<input|<a\s/i.test(c);

try {
  const normal = construir('normal', {});
  const revision = construir('revision', { PUBLIC_ACADEMIA: '1' });

  // ---------- MODO NORMAL: en construcción ----------
  const p1 = leer(normal, 'academia/index.html');
  ok(!!p1, 'normal: /academia existe');
  ok(p1 && p1.includes('Página en construcción') && p1.includes('Academia 3GI'), 'normal: dice «Página en construcción» y «Academia 3GI»');
  ok(p1 && !/Saca Valor|16 horas|Módulo 1|sesiones|diploma/i.test(contenidoDe(p1)), 'normal: no revela el programa (nombre, horas, módulo ni diploma)');
  ok(p1 && /name="robots" content="noindex/i.test(p1), 'normal: lleva noindex');
  ok(sinEnlaces(contenidoDe(p1)), 'normal: el contenido no tiene botones, formularios, campos ni enlaces');
  ok(p1 && !/hreflang="en"/.test(p1) && /hreflang="es"/.test(p1) && /hreflang="x-default"/.test(p1), 'normal: solo hreflang es y x-default');
  ok(p1 && !p1.includes('/en/academia') && !/class="lang-toggle"/.test(p1), 'normal: sin selector de idioma ni enlace a /en/academia');
  const otros = archivos(normal).filter((f) => path.relative(normal, f) !== path.join('academia', 'index.html') && /academia|academy/i.test(fs.readFileSync(f, 'utf8')));
  ok(otros.length === 0, `normal: ningún otro archivo (html, txt, xml) menciona la Academia (${otros.map((f) => path.relative(normal, f)).join(', ') || 'ninguno'})`);
  ok(!/href="\/academia"/.test(leer(normal, 'index.html') || ''), 'normal: sin ítem de menú ni enlace en la home');
  ok(!(leer(normal, 'llms.txt') || '').includes('Academia'), 'normal: llms.txt no la menciona');
  ok(!(leer(normal, 'sitemap.xml') || '').includes('/academia'), 'normal: el sitemap no la incluye');

  // ---------- MODO REVISIÓN: página completa ----------
  const p2 = leer(revision, 'academia/index.html');
  ok(!!p2, 'revisión: /academia existe');
  ok(p2 && p2.includes('Saca Valor a la IA · Módulo 1') && !p2.includes('Página en construcción'), 'revisión: muestra la página completa');
  ok(p2 && /name="robots" content="noindex/i.test(p2), 'revisión: lleva noindex (es solo una vista de revisión)');
  ok(sinEnlaces(contenidoDe(p2)), 'revisión: el contenido no tiene botones, formularios, campos ni enlaces');
  ok(p2 && !/hreflang="en"/.test(p2) && !/class="lang-toggle"/.test(p2), 'revisión: solo hreflang es y sin selector de idioma');
  const home = leer(revision, 'index.html');
  ok(home && (home.match(/href="\/academia"/g) || []).length >= 3, 'revisión: el ítem aparece en el menú de escritorio, el menú móvil y el pie');
  ok(home && home.includes('existe la Academia 3GI, un programa aparte'), 'revisión: la frase del FAQ está en la home');
  ok(home && /existe la Academia 3GI, un programa aparte/.test((home.match(/application\/ld\+json">([\s\S]*?)<\/script>/g) || []).join('')), 'revisión: la frase también está en el JSON-LD del FAQ');
  ok(!/academia|academy/i.test((leer(revision, 'en/index.html') || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')), 'revisión: la home en inglés no menciona la Academia');
  ok((leer(revision, 'llms.txt') || '').includes('Academia 3GI'), 'revisión: llms.txt la menciona');
  ok(!(leer(revision, 'sitemap.xml') || '').includes('/academia'), 'revisión: el sitemap no la incluye (se agrega solo al publicar)');
} catch (e) {
  console.log(`ERROR: ${e.message}`); fallas++;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(fallas ? `\n${fallas} comprobación(es) fallaron` : '\nTodas las comprobaciones pasaron');
process.exit(fallas ? 1 : 0);
