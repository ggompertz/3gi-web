// Guardia de nomenclatura: hace FALLAR el build si aparece «diagnóstico / diagnosis / diagnostic» en lo que ve o lee el cliente
// (texto visible, atributos, metadatos, JSON-LD, mensajes de wa.me y mailto) fuera de la lista de usos aceptados
// (src/data/diagnostico-permitido.mjs, cada uno con su MOTIVO).
//
// Origen: la regla del 2026-10-14 («Diagnóstico» es el nombre interno del servicio; el Test ERA nunca se llama así) se incumplió en
// 102 textos del sitio, correos, informes y el bot, porque la guardia de contenido solo rechazaba frases exactas
// («Free ERA Diagnostic» pasaba). Plan completo: R2 3gi-outputs/proyectos/3gi-web/2026-10-22/propuesta-nomenclatura-diagnostico.md
//
// Las páginas del Test ERA NO admiten excepciones. Una excepción que ya no coincide con ningún texto se avisa (para depurar la lista).
// Antes de revisar el sitio corre una autoprueba con casos reales: si el detector no los marca, el build falla.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extraerTextos } from './guardia-idioma.mjs';
import { PERMITIDOS_DIAGNOSTICO } from '../data/diagnostico-permitido.mjs';

export const DIAGNOSTICO = /diagn[oó]stic[oa]?s?|diagnosis/i;
export const PAGINAS_TEST_ERA = ['test-era/index.html', 'en/test-era/index.html', 'test-era-ia/index.html', 'en/test-era-ia/index.html'];

const normalizar = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/** Todas las entradas de la lista que cubren este texto en esta página (puede haber varias: un fragmento corto dentro de otro). */
export function excepcionesPara(pagina, texto, permitidos = PERMITIDOS_DIAGNOSTICO) {
  if (PAGINAS_TEST_ERA.includes(pagina)) return [];
  const t = normalizar(texto);
  return permitidos.filter((e) => (e.pagina === '*' || e.pagina === pagina) && t.includes(normalizar(e.texto)));
}
export const excepcionPara = (pagina, texto, permitidos = PERMITIDOS_DIAGNOSTICO) => excepcionesPara(pagina, texto, permitidos)[0] ?? null;

/** Revisa los textos de una página; devuelve [{ pagina, palabra, texto }]. `usadas` (Set) recibe las excepciones que se aplicaron. */
export function revisarPagina(pagina, html, { permitidos = PERMITIDOS_DIAGNOSTICO, usadas = new Set() } = {}) {
  const fallas = [];
  for (const t of new Set(extraerTextos(html, { omitirEspanol: false }))) {
    if (!DIAGNOSTICO.test(t)) continue;
    const cubiertas = excepcionesPara(pagina, t, permitidos);
    if (cubiertas.length) { cubiertas.forEach((e) => usadas.add(e)); continue; }
    fallas.push({ pagina, palabra: t.match(DIAGNOSTICO)[0], texto: t });
  }
  return fallas;
}

function htmls(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmls(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

/** Revisa todo el build. Devuelve las fallas y las excepciones que ya no coinciden con nada. */
export function revisarSitio(raiz, permitidos = PERMITIDOS_DIAGNOSTICO) {
  const usadas = new Set();
  const fallas = [];
  for (const f of htmls(raiz)) {
    const rel = path.relative(raiz, f).split(path.sep).join('/');
    fallas.push(...revisarPagina(rel, fs.readFileSync(f, 'utf8'), { permitidos, usadas }));
  }
  return { fallas, sinUso: permitidos.filter((e) => !usadas.has(e)) };
}

/** Casos reales que el detector DEBE marcar y casos que NO. */
export const CASOS = {
  deben_marcarse: [
    ['en/test-era/index.html', 'Free ERA Diagnostic · 3G Intelligence'],
    ['en/test-era/index.html', 'Start diagnostic →'],
    ['test-era/index.html', 'Tu diagnóstico ERA'],
    ['index.html', '¿Cuánto cuesta el diagnóstico y qué incluye?'],
    ['en/faq/index.html', "That's precisely what the diagnosis measures."],
    ['era-prueba.html', 'Diagnóstico gratuito · desde 5 minutos'],
  ],
  no_deben_marcarse: [
    ['en/test-era/index.html', 'Free ERA Test · 3G Intelligence'],
    ['index.html', '¿Cuánto cuesta trabajar con 3GI y qué incluye?'],
    ['metodologia/index.html', 'Evaluación pagada: dónde está tu empresa hoy'],
  ],
};

export function autoprueba() {
  const p = (pagina, t) => revisarPagina(pagina, `<!doctype html><html><body><p>${t}</p></body></html>`, { permitidos: [] });
  for (const [pagina, t] of CASOS.deben_marcarse) {
    if (!p(pagina, t).length) throw new Error(`[guardia-diagnostico] autoprueba: el detector NO marcó un caso real: «${t}»`);
  }
  for (const [pagina, t] of CASOS.no_deben_marcarse) {
    if (p(pagina, t).length) throw new Error(`[guardia-diagnostico] autoprueba: el detector marcó texto correcto: «${t}»`);
  }
  const wa = revisarPagina('en/index.html', '<a href="https://wa.me/1?text=Hola%2C%20quiero%20el%20diagn%C3%B3stico">Write</a>', { permitidos: [] });
  if (!wa.length) throw new Error('[guardia-diagnostico] autoprueba: no revisó el mensaje precargado de wa.me');
  const ld = revisarPagina('index.html', '<script type="application/ld+json">{"name":"¿Cuánto cuesta el diagnóstico de IA?"}</script>', { permitidos: [] });
  if (!ld.length) throw new Error('[guardia-diagnostico] autoprueba: no revisó el JSON-LD');
  const perm = [{ pagina: 'test-era/index.html', texto: 'Tu diagnóstico ERA', motivo: 'prueba' }];
  if (!revisarPagina('test-era/index.html', '<p>Tu diagnóstico ERA</p>', { permitidos: perm }).length) {
    throw new Error('[guardia-diagnostico] autoprueba: una página del Test ERA aceptó una excepción');
  }
}

export default function guardiaDiagnostico() {
  return {
    name: 'guardia-diagnostico',
    hooks: {
      'astro:build:done': ({ dir }) => {
        autoprueba();
        const { fallas, sinUso } = revisarSitio(fileURLToPath(dir));
        if (fallas.length) {
          // La misma frase (p. ej. el JSON-LD global) aparece en todas las páginas: una línea por texto, con las páginas afectadas.
          const porTexto = new Map();
          for (const f of fallas) porTexto.set(f.texto, [...(porTexto.get(f.texto) ?? []), f.pagina]);
          const lineas = [...porTexto].map(([texto, paginas]) => {
            const donde = paginas.length > 3 ? `${paginas.slice(0, 3).join(', ')} y ${paginas.length - 3} más` : paginas.join(', ');
            return `«${texto.slice(0, 120)}»  (${donde})`;
          });
          throw new Error(`\n[guardia-diagnostico] ${porTexto.size} texto(s) con «diagnóstico» fuera de la lista de aceptados:\n - ${lineas.join('\n - ')}\n` +
            `Usar Test ERA, Radar o Plan de Vuelo. Si es un uso genérico del método, agregarlo con motivo a src/data/diagnostico-permitido.mjs.\n`);
        }
        for (const e of sinUso) console.warn(`[guardia-diagnostico] aviso: la excepción de ${e.pagina} («${e.texto.slice(0, 50)}») ya no coincide con ningún texto: depúrala de src/data/diagnostico-permitido.mjs`);
        console.log('[guardia-diagnostico] OK — «diagnóstico» solo aparece en los usos aceptados');
      },
    },
  };
}
