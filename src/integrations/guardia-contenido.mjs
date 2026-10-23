// Guardia de contenido: revisa el HTML generado y hace FALLAR el build si encuentra
// nomenclatura interna, regionalismos, datos obsoletos, afirmaciones sin fuente o montos
// que no estén en src/data/oferta.mjs. Va como integración de Astro (no en package.json)
// para que corra con cualquier comando de build (Cloudflare incluido).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { montosPermitidos } from '../data/oferta.mjs';

const REGLAS = [
  { id: 'nomenclatura-interna', re: /\bF[1-5]\b|\bEtapas?\b|\bE[1-3]\b/g, msg: 'nomenclatura interna (F1–F5, «Etapa», E1–E3) visible al cliente' },
  { id: 'regionalismo', re: /(?<![\p{L}])(acá|vos|tenés|querés|hacés|mirá|podés|decime|contame|Operás)(?![\p{L}])/giu, msg: 'voseo o regionalismo (usar español neutro, «tú»)' },
  { id: 'segmento-obsoleto', re: /5\s?[–-]\s?200|10\s?[–-]\s?200|entre 5 y 100|between 5 and 100|5 to 200/gi, msg: 'segmento obsoleto (el vigente es 2 a 50 empleados)' },
  { id: 'test-era-obsoleto', re: /15 minutos|15-minute|~\s?3 minutos|24\s?[–-]\s?48\s?(?:horas|h\b|hours)/gi, msg: 'duración/plazo obsoleto del Test ERA (es «desde 5 minutos», informe al terminar)' },
  { id: 'sin-fuente', re: /30[.,]000\s?[–-]\s?100[.,]000|M[ií]nimo \$50k|Min \$50k|USD 50[.,]000\+/gi, msg: 'afirmación sin fuente (se retiró; no reintroducir sin respaldo)' },
  { id: 'test-era-como-diagnostico', re: /Gratis \(Diagn[oó]stico\)|Sin costo \(Diagn[oó]stico\)|Reporte de Diagn[oó]stico|Diagnosis Report|Free \(Diagnosis\)|No cost \(Diagnosis\)|Free AI Diagnosis|Diagn[oó]stico de IA para PyMEs|AI Diagnosis for SMEs/g, msg: 'el Test ERA no se llama «diagnóstico/diagnosis» (el informe es el «Informe ERA»)' },
  { id: 'implementacion-incluida', re: /implementación incluida|Implementation included|hands-on implementation until|implementación acompañada hasta/gi, msg: 'el Plan de Vuelo tiene dos tramos: la Ejecución se cobra aparte, por hitos' },
];

function archivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) archivos(p, acc);
    else if (/\.(html|txt)$/.test(e.name)) acc.push(p);
  }
  return acc;
}
function textoVisible(raw, esHtml) {
  if (!esHtml) return raw;
  return raw
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');
}
// Excepciones PERMANENTES y acotadas (decisión de Gonzalo, 2026-10-17): el libro «Inteligencia Organizacional en la Era IA»
// describe su capítulo 9 como «las seis fases F0 a F5». Solo se permite esa mención, en las páginas que describen el libro;
// cualquier otro código interno (F1–F5, E1–E3, «Etapa») sigue rechazado también en esas páginas.
const PERMITIDOS = [
  {
    regla: 'nomenclatura-interna',
    archivos: ['contenido/index.html', 'inteligencia-organizacional/index.html', 'en/inteligencia-organizacional/index.html'],
    contexto: /(?:fases?|phases?)\s+F0/i,
  },
];
const permitido = (regla, rel, texto, i) =>
  PERMITIDOS.some((e) => e.regla === regla && e.archivos.includes(rel) && e.contexto.test(texto.slice(Math.max(0, i - 40), i + 20)));
// Lo que la persona le «dice» a la empresa al tocar un enlace de WhatsApp (wa.me/?text=) también es texto visible al cliente
// aunque viva en la dirección del enlace: textoVisible() no lo ve. «Diagnóstico» es el nombre interno del servicio (el público es Radar).
const NOMBRE_INTERNO_EN_ENLACE = /diagn[oó]stic|diagnosis|diagnostic/i;
function textosDeEnlacesWhatsApp(html) {
  const out = [];
  for (const m of html.matchAll(/href="([^"]*wa\.me\/[^"]*[?&]text=[^"]*)"/gi)) {
    try { out.push(decodeURIComponent(m[1].split(/[?&]text=/)[1].replace(/&amp;.*/, ''))); } catch { /* codificación inválida: la ignora */ }
  }
  return out;
}
// El Test ERA es gratuito y NUNCA se llama «diagnóstico» (regla del 2026-10-14; la guardia solo rechazaba frases exactas y dejó pasar
// «Free ERA Diagnostic»). En sus páginas la palabra está prohibida en texto visible, título y metadatos. El resto del sitio se trata aparte.
const PAGINAS_TEST_ERA = ['test-era/index.html', 'en/test-era/index.html', 'test-era-ia/index.html', 'en/test-era-ia/index.html'];
const DIAGNOSTICO = /diagn[oó]stic[oa]?s?|diagnosis/gi;
function textosCabeceraYMeta(html) {
  const out = [];
  for (const m of html.matchAll(/<title>([^<]*)<\/title>/gi)) out.push(m[1]);
  for (const m of html.matchAll(/<meta\s+[^>]*content\s*=\s*"([^"]*)"[^>]*>/gi)) out.push(m[1]);
  return out;
}
const aNumero = (s) => (/^\d{1,3}([.,]\d{3})+$/.test(s) ? Number(s.replace(/[.,]/g, '')) : /^\d+$/.test(s) ? Number(s) : NaN);

export default function guardiaContenido() {
  return {
    name: 'guardia-contenido',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const raiz = fileURLToPath(dir);
        const permitidos = montosPermitidos();
        const fallas = [];
        for (const f of archivos(raiz)) {
          const rel = path.relative(raiz, f);
          const texto = textoVisible(fs.readFileSync(f, 'utf8'), f.endsWith('.html'));
          for (const r of REGLAS) {
            for (const m of texto.matchAll(r.re)) {
              const i = m.index ?? 0;
              if (permitido(r.id, rel, texto, i)) continue;
              fallas.push(`${rel} · ${r.id}: «${m[0]}» …${texto.slice(Math.max(0, i - 30), i + 40)}…  → ${r.msg}`);
            }
          }
          if (PAGINAS_TEST_ERA.includes(rel.split(path.sep).join('/'))) {
            const bruto = fs.readFileSync(f, 'utf8');
            // Los datos estructurados (JSON-LD) los inyecta Layout.astro en TODAS las páginas y se revisan en su propia fase.
            const propio = textoVisible(bruto.replace(/<script[^>]*application\/ld\+json[\s\S]*?<\/script>/gi, ' '), true);
            for (const t of [...propio.split(/(?<=[.!?:])\s+|\s{2,}/), ...textosCabeceraYMeta(bruto)]) {
              for (const m of t.matchAll(DIAGNOSTICO)) fallas.push(`${rel} · test-era-llamado-diagnostico: «${m[0]}» en «${t.trim().slice(0, 80)}» → el Test ERA nunca se llama diagnóstico (usar «Test ERA», «resultado ERA» o «Informe ERA»)`);
            }
          }
          if (f.endsWith('.html')) {
            for (const t of textosDeEnlacesWhatsApp(fs.readFileSync(f, 'utf8'))) {
              if (NOMBRE_INTERNO_EN_ENLACE.test(t)) fallas.push(`${rel} · diagnostico-en-enlace-whatsapp: «${t}» → «Diagnóstico» es nombre interno; el servicio público es Radar (o Test ERA)`);
            }
          }
          for (const m of texto.matchAll(/USD\s?(\d[\d.,]*)([kK])?(?:\s?[–-]\s?(\d[\d.,]*)([kK])?)?/g)) {
            for (const [g, k] of [[m[1], m[2]], [m[3], m[4]]].filter(([x]) => x)) {
              const n = aNumero(g.replace(/[.,]$/, '')) * (k ? 1000 : 1);
              if (Number.isNaN(n) || n < 100) continue;
              if (!permitidos.has(n)) fallas.push(`${rel} · monto-no-declarado: «USD ${g}» no está en src/data/oferta.mjs → agrégalo ahí (con su origen) o corrígelo`);
            }
          }
        }
        if (fallas.length) {
          const unicas = [...new Set(fallas)];
          throw new Error(`\n[guardia-contenido] ${unicas.length} problema(s) en el HTML generado:\n - ${unicas.join('\n - ')}\n`);
        }
        console.log('[guardia-contenido] OK — nomenclatura, regionalismos, datos obsoletos y montos verificados');
      },
    },
  };
}
