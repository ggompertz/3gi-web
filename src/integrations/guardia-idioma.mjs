// Guardia de idioma: hace FALLAR el build si una página en inglés tiene español, o si una página en inglés
// comparte frases largas, idénticas, con su par en español (texto sin traducir). Corre sobre el HTML generado,
// que es lo que ve la persona y lo que indexa Google; no depende de dónde esté escrito el texto (diccionario,
// plantilla, JSON-LD, atributos).
//
// Origen: 5 casos de «español dentro del inglés» en 2026 (el último, 2026-10-22, 4 textos en /en/metodologia y
// /en/casos hallados por una persona en producción). Ver CLAUDE.md (sección i18n) y
// my-config/claude-config/specs/process-rules.yaml → textos_bilingues_es_en.
//
// Español intencional dentro de una página EN: marcarlo en el HTML con lang="es" (o translate="no", o la clase
// en-row-orig que ya usa /contenido). Si no es posible, agregarlo a src/data/idioma-permitidos.mjs CON su motivo.
//
// Va como integración de Astro (no en package.json) para correr con cualquier comando de build (Cloudflare incluido).
// La integración ejecuta primero una autoprueba con los errores reales conocidos: si el detector no los marca,
// el build falla (un escáner que dice «0» sin haber demostrado que encuentra algo no vale).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PERMITIDOS } from '../data/idioma-permitidos.mjs';

// Palabras funcionales del español que no existen como palabras inglesas corrientes.
// Se dejan fuera las ambiguas (a, no, son, me, la, el, y, en, se, su, al, lo, es).
const FUNCIONALES_ES = new Set([
  'de', 'del', 'los', 'las', 'una', 'unos', 'unas', 'para', 'con', 'que', 'por', 'sobre', 'entre', 'pero',
  'sus', 'sin', 'desde', 'hasta', 'también', 'cuando', 'donde', 'porque', 'nuestro', 'nuestra', 'nuestros',
  'nuestras', 'tus', 'más', 'está', 'están', 'este', 'esta', 'estos', 'estas', 'cada', 'como', 'muy', 'todo',
  'toda', 'todos', 'todas', 'mismo', 'misma', 'hacia', 'según', 'mediante',
]);
const FUNCIONALES_EN = new Set([
  'the', 'and', 'of', 'to', 'in', 'is', 'for', 'with', 'that', 'on', 'your', 'you', 'an', 'are', 'as', 'by', 'or',
  'it', 'this', 'from', 'be', 'at', 'we', 'our', 'not', 'can', 'will', 'have', 'what', 'how', 'who',
]);
// Palabras inglesas que llevan tilde legítimamente.
const TILDE_VALIDA_EN = new Set(['café', 'résumé', 'resumé', 'fiancé', 'cliché', 'naïve', 'protégé', 'née']);

const palabrasDe = (t) => t.match(/[\p{L}][\p{L}'’-]*/gu) ?? [];

/** Devuelve las razones por las que un texto en inglés parece estar en español ([] si parece inglés). */
export function razonesDeEspanol(texto) {
  const razones = [];
  if (/[ñÑ¿¡]/.test(texto)) razones.push('ñ, ¿ o ¡');
  const palabras = palabrasDe(texto);
  const conTilde = palabras.filter((p) => /[áéíóúÁÉÍÓÚ]/.test(p) && !TILDE_VALIDA_EN.has(p.toLowerCase()));
  if (conTilde.length) razones.push(`tilde en «${conTilde[0]}»`);
  const es = palabras.map((p) => p.toLowerCase()).filter((p) => FUNCIONALES_ES.has(p));
  const en = palabras.map((p) => p.toLowerCase()).filter((p) => FUNCIONALES_EN.has(p));
  if (es.length >= 2 || (es.length === 1 && palabras.length >= 4 && en.length === 0)) {
    razones.push(`palabras en español: ${[...new Set(es)].join(', ')}`);
  }
  return razones;
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const OMITIR = /\blang\s*=\s*["']es(?:-[A-Za-z]+)?["']|\btranslate\s*=\s*["']no["']|\bclass\s*=\s*["'][^"']*\ben-row-orig\b/i;

/** Quita del HTML los elementos marcados como español intencional (lang="es", translate="no", .en-row-orig). */
export function quitarOmitidos(html) {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let out = '';
  let ultimo = 0;
  let saltando = null;
  for (const m of html.matchAll(re)) {
    const [tag, cierre, nombre, attrs] = m;
    const n = nombre.toLowerCase();
    const autocierre = /\/\s*$/.test(attrs) || VOID.has(n);
    if (saltando) {
      if (n === saltando.tag && !autocierre) {
        if (cierre) {
          saltando.profundidad -= 1;
          if (saltando.profundidad === 0) { saltando = null; ultimo = m.index + tag.length; }
        } else saltando.profundidad += 1;
      }
      continue;
    }
    if (!cierre && OMITIR.test(attrs)) {
      out += html.slice(ultimo, m.index);
      if (autocierre) ultimo = m.index + tag.length;
      else saltando = { tag: n, profundidad: 1 };
    }
  }
  return out + (saltando ? '' : html.slice(ultimo));
}

const decodificar = (s) =>
  s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const normalizar = (s) => decodificar(s).replace(/\s+/g, ' ').trim();

function cadenasDeJson(valor, acc) {
  if (typeof valor === 'string') acc.push(valor);
  else if (Array.isArray(valor)) valor.forEach((v) => cadenasDeJson(v, acc));
  else if (valor && typeof valor === 'object') Object.values(valor).forEach((v) => cadenasDeJson(v, acc));
  return acc;
}

/** Extrae los textos que ve (o lee) la persona: nodos de texto, JSON-LD, alt/title/placeholder/aria-label y metadatos. */
export function extraerTextos(html, { omitirEspanol = true } = {}) {
  // En la página en español NO se omite nada: <html lang="es"> sería «español intencional» y vaciaría la comparación.
  const sinOmitidos = omitirEspanol ? quitarOmitidos(html) : html;
  const textos = [];
  for (const m of sinOmitidos.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { cadenasDeJson(JSON.parse(m[1]), textos); } catch { /* JSON-LD inválido: no es tema de esta guardia */ }
  }
  const limpio = sinOmitidos
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  for (const m of limpio.matchAll(/\b(?:alt|title|placeholder|aria-label)\s*=\s*"([^"]+)"/gi)) textos.push(m[1]);
  // El mensaje precargado de wa.me/?text= y el asunto/cuerpo de mailto: viven en la dirección del enlace, pero la persona los envía.
  for (const m of limpio.matchAll(/href="([^"]*(?:wa\.me\/[^"]*[?&]text=|mailto:[^"]*[?&](?:subject|body)=)[^"]*)"/gi)) {
    for (const q of m[1].replace(/&amp;/g, '&').split(/[?&]/).slice(1)) {
      const [k, v] = [q.slice(0, q.indexOf('=')), q.slice(q.indexOf('=') + 1)];
      if (!['text', 'subject', 'body'].includes(k)) continue;
      try { textos.push(decodeURIComponent(v)); } catch { /* codificación inválida */ }
    }
  }
  for (const m of limpio.matchAll(/<meta\s+[^>]*>/gi)) {
    if (/(?:name|property)\s*=\s*"(?:description|og:title|og:description|twitter:title|twitter:description)"/i.test(m[0])) {
      const c = m[0].match(/content\s*=\s*"([^"]*)"/i);
      if (c) textos.push(c[1]);
    }
  }
  for (const m of limpio.matchAll(/>([^<>]+)</g)) textos.push(m[1]);
  return textos.map(normalizar).filter(Boolean);
}

const pareceIngles = (t) => palabrasDe(t).filter((p) => FUNCIONALES_EN.has(p.toLowerCase())).length >= 2;
const esNombrePropio = (t) => {
  const p = t.match(/[\p{L}\d][\p{L}\d'’.&-]*/gu) ?? [];
  return p.length > 0 && p.filter((w) => /^[\p{Lu}\d]/u.test(w)).length / p.length >= 0.8;
};
const esTecnico = (t) => /^(https?:\/\/|www\.|[\w.+-]+@[\w-]+\.)/i.test(t) || !/\p{L}/u.test(t);
const palabrasLargas = (t) => (t.match(/\p{L}{2,}/gu) ?? []).length;

const permitidoPor = (pagina, texto) =>
  PERMITIDOS.some((e) => (e.pagina === '*' || e.pagina === pagina) && texto.toLowerCase().includes(e.texto.toLowerCase()));

/**
 * Revisa un par de páginas. `html_en` es la página en inglés; `html_es`, su par en español (puede faltar).
 * Devuelve una lista de fallas legibles.
 */
export function revisarPar(pagina, htmlEn, htmlEs) {
  const fallas = [];
  const textosEn = [...new Set(extraerTextos(htmlEn))];
  for (const t of textosEn) {
    if (esTecnico(t) || permitidoPor(pagina, t)) continue;
    const razones = razonesDeEspanol(t);
    if (razones.length) fallas.push(`${pagina} · español-en-ingles: «${t.slice(0, 120)}» (${razones.join('; ')})`);
  }
  if (htmlEs) {
    const textosEs = new Set(extraerTextos(htmlEs, { omitirEspanol: false }));
    for (const t of textosEn) {
      if (esTecnico(t) || permitidoPor(pagina, t)) continue;
      // Un texto que ya parece inglés (nombres de cursos, marcas) no es «español sin traducir» aunque aparezca igual en ambas páginas.
      if (t.length >= 15 && palabrasLargas(t) >= 3 && !esNombrePropio(t) && !pareceIngles(t) && textosEs.has(t)) {
        fallas.push(`${pagina} · texto-identico-al-espanol: «${t.slice(0, 120)}» está igual en la página en español (¿sin traducir?)`);
      }
    }
  }
  return [...new Set(fallas)];
}

function archivosHtml(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) archivosHtml(p, acc);
    else if (e.name === 'index.html') acc.push(p);
  }
  return acc;
}

/** Revisa todas las páginas /en/ de una carpeta de build contra su par en español. */
export function revisarSitio(raiz) {
  const fallas = [];
  for (const f of archivosHtml(path.join(raiz, 'en'))) {
    const relEn = path.relative(raiz, f).split(path.sep).join('/');
    const relEs = relEn.replace(/^en\//, '');
    const rutaEs = path.join(raiz, relEs);
    fallas.push(...revisarPar(relEn, fs.readFileSync(f, 'utf8'), fs.existsSync(rutaEs) ? fs.readFileSync(rutaEs, 'utf8') : null));
  }
  return fallas;
}

/** Errores reales conocidos (2026-10-22). El detector DEBE marcarlos; el inglés correcto NO. */
export const CASOS_CONOCIDOS = {
  deben_marcarse: [
    'Entregable: Score de Madurez IA, clasificación ERA, informe ejecutivo con oportunidades identificadas.',
    'Resultado: Empresa con ventaja competitiva estructural basada en IA, sostenida en el tiempo.',
    'Sobre la inversión total en diagnóstico e implementación',
  ],
  no_deben_marcarse: [
    'Deliverable: AI Maturity Score, ERA classification, executive report with the opportunities identified.',
    'Result: A company with a structural, AI-based competitive advantage, sustained over time.',
    'Projected 12-month ROI',
  ],
  // Documentos completos, con <html lang>, como los genera Astro (un fragmento sin <html> ocultó un fallo real el 2026-10-22).
  par_identico: {
    es: '<!doctype html><html lang="es"><body><p>ROI proyectado a 12 meses</p></body></html>',
    en: '<!doctype html><html lang="en"><body><p>ROI proyectado a 12 meses</p></body></html>',
  },
  intencional_no_marcar: '<!doctype html><html lang="en"><body><p>Founded by <span lang="es">Fundación Telefónica España</span> in 2024 for the program.</p></body></html>',
};

export function autoprueba() {
  for (const t of CASOS_CONOCIDOS.deben_marcarse) {
    if (!razonesDeEspanol(t).length) throw new Error(`[guardia-idioma] autoprueba: el detector NO marcó un error conocido: «${t}»`);
  }
  for (const t of CASOS_CONOCIDOS.no_deben_marcarse) {
    if (razonesDeEspanol(t).length) throw new Error(`[guardia-idioma] autoprueba: el detector marcó inglés correcto: «${t}»`);
  }
  if (revisarPar('en/prueba/index.html', CASOS_CONOCIDOS.intencional_no_marcar, null).length) {
    throw new Error('[guardia-idioma] autoprueba: marcó español intencional con lang="es"');
  }
  const par = CASOS_CONOCIDOS.par_identico;
  if (!revisarPar('en/prueba/index.html', par.en, par.es).some((f) => f.includes('texto-identico-al-espanol'))) {
    throw new Error('[guardia-idioma] autoprueba: no detectó texto idéntico entre la página en español y la en inglés');
  }
}

export default function guardiaIdioma() {
  return {
    name: 'guardia-idioma',
    hooks: {
      'astro:build:done': ({ dir }) => {
        autoprueba();
        const raiz = fileURLToPath(dir);
        const fallas = revisarSitio(raiz);
        if (fallas.length) {
          throw new Error(
            `\n[guardia-idioma] ${fallas.length} problema(s) de idioma en las páginas en inglés:\n - ${fallas.join('\n - ')}\n` +
              `Traducir el texto (diccionario en src/i18n/). Si el español es intencional: lang="es" en el elemento o una entrada con motivo en src/data/idioma-permitidos.mjs.\n`,
          );
        }
        console.log('[guardia-idioma] OK — sin español en las páginas en inglés ni textos idénticos al español sin traducir');
      },
    },
  };
}
