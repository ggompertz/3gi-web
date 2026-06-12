#!/usr/bin/env node
/**
 * cf-analytics.mjs — Reporte de analytics 3gi.cl vía Cloudflare GraphQL API
 * Uso: node scripts/cf-analytics.mjs [--days=7] [--date=YYYY-MM-DD]
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// Cargar token desde .env del platform
function loadEnv() {
  const paths = [
    resolve(__dir, '../../3gi-platform/.env'),
    resolve(__dir, '../.env'),
    resolve(process.env.HOME, '3gi-platform/.env'),
  ];
  for (const p of paths) {
    try {
      const raw = readFileSync(p, 'utf8');
      const vars = {};
      for (const line of raw.split('\n')) {
        const m = line.match(/^([A-Z_]+)=(.+)$/);
        if (m) vars[m[1]] = m[2].trim();
      }
      if (vars.CLOUDFLARE_API_TOKEN_ANALYTICS) return vars;
    } catch {}
  }
  throw new Error('No se encontró CLOUDFLARE_API_TOKEN_ANALYTICS en .env');
}

const env = loadEnv();
const TOKEN = env.CLOUDFLARE_API_TOKEN_ANALYTICS;
const ZONE  = '0cce4495c79299510d9402e413e614a4'; // 3gi.cl

// Parsear args
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k,v] = a.slice(2).split('='); return [k, v ?? true]; })
);
const DAYS = parseInt(args.days ?? '7');
const today = args.date ? new Date(args.date) : new Date();
const dateStr = d => d.toISOString().slice(0, 10);
const endDate = dateStr(today);
const startDate = dateStr(new Date(today - (DAYS - 1) * 86400000));

async function gql(query) {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const d = await res.json();
  if (d.errors) throw new Error(d.errors[0].message);
  return d.data.viewer.zones[0];
}

// Consulta 1: totales por día
async function getTotals() {
  const z = await gql(`{
    viewer { zones(filter:{zoneTag:"${ZONE}"}) {
      httpRequests1dGroups(limit:31, filter:{date_geq:"${startDate}", date_leq:"${endDate}"}, orderBy:[date_ASC]) {
        dimensions { date }
        sum { requests pageViews bytes }
        uniq { uniques }
      }
    }}
  }`);
  return z.httpRequests1dGroups;
}

// Consulta 2: top páginas (solo 1 día a la vez por limitación de API)
async function getTopPages(date) {
  const z = await gql(`{
    viewer { zones(filter:{zoneTag:"${ZONE}"}) {
      topK: httpRequestsAdaptiveGroups(limit:100, filter:{date_geq:"${date}", date_leq:"${date}"}, orderBy:[count_DESC]) {
        count dimensions { clientRequestPath }
      }
    }}
  }`);
  const skip = ['/_astro/', 'cdn-cgi', '.woff', '.js', '.css', '.png', '.svg',
                '.ico', '.webp', '.txt', '.xml', 'acme-challenge', 'xmlrpc',
                '.env', '.git', 'wp-', 'setup.php', '_internal'];
  return z.topK
    .filter(g => !skip.some(s => g.dimensions.clientRequestPath.includes(s)))
    .map(g => ({ path: g.dimensions.clientRequestPath, count: g.count }));
}

// Consulta 3: países (hoy)
async function getCountries(date) {
  const z = await gql(`{
    viewer { zones(filter:{zoneTag:"${ZONE}"}) {
      byCountry: httpRequestsAdaptiveGroups(limit:30, filter:{date_geq:"${date}", date_leq:"${date}"}, orderBy:[count_DESC]) {
        count dimensions { clientCountryName }
      }
    }}
  }`);
  const countries = {};
  for (const g of z.byCountry) {
    const c = g.dimensions.clientCountryName;
    countries[c] = (countries[c] ?? 0) + g.count;
  }
  return Object.entries(countries).sort((a,b) => b[1]-a[1]).slice(0,10);
}

function bar(n, max, width=20) {
  const filled = Math.round((n / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function fmt(n) { return n.toLocaleString('es-CL'); }

// ─── MAIN ──────────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(60)}`);
console.log(`  📊 3gi.cl — Analytics Cloudflare`);
console.log(`  Período: ${startDate} → ${endDate} (${DAYS} días)`);
console.log(`${'═'.repeat(60)}\n`);

const [totals, topPages, countries] = await Promise.all([
  getTotals(),
  getTopPages(endDate),
  getCountries(endDate),
]);

// Resumen general
const totalReq  = totals.reduce((s,g) => s + g.sum.requests, 0);
const totalPV   = totals.reduce((s,g) => s + g.sum.pageViews, 0);
const totalUniq = totals.reduce((s,g) => s + g.uniq.uniques, 0);
const totalMB   = totals.reduce((s,g) => s + g.sum.bytes, 0) / 1024 / 1024;

console.log('RESUMEN GENERAL');
console.log(`  Requests:       ${fmt(totalReq)}`);
console.log(`  Page views:     ${fmt(totalPV)}`);
console.log(`  Visitantes:     ${fmt(totalUniq)}`);
console.log(`  Bandwidth:      ${totalMB.toFixed(1)} MB`);

// Tendencia diaria
console.log('\nTENDENCIA DIARIA');
const maxPV = Math.max(...totals.map(g => g.sum.pageViews));
for (const g of totals) {
  const pv = g.sum.pageViews;
  console.log(`  ${g.dimensions.date}  ${bar(pv, maxPV, 25)}  ${fmt(pv).padStart(6)} pv  ${fmt(g.uniq.uniques).padStart(5)} uniq`);
}

// Embudo diagnóstico
console.log('\nEMBUDO /DIAGNOSTICO (último día)');
const funnel = [
  ['/diagnostico', '/diagnostico/'],
  ['/diagnostico-ia', '/diagnostico-ia/'],
];
for (const [a, b] of funnel) {
  const n = topPages.filter(p => p.path === a || p.path === b).reduce((s,p) => s+p.count, 0);
  console.log(`  ${(a+':').padEnd(20)} ${fmt(n).padStart(5)}`);
}

// Top páginas hoy
console.log(`\nTOP PÁGINAS (${endDate})`);
const maxCount = topPages[0]?.count ?? 1;
const PAGE_LABELS = { '/': 'Home', '/nosotros': 'Nosotros', '/diagnostico': 'Diagnóstico',
  '/metodologia': 'Metodología', '/casos': 'Casos', '/precios': 'Precios',
  '/diagnostico-ia': 'Diagnóstico IA', '/faq': 'FAQ', '/contenido': 'Contenido' };
const seenPaths = new Set();
let shown = 0;
for (const { path, count } of topPages) {
  const norm = path.replace(/\/$/, '') || '/';
  if (seenPaths.has(norm) || shown >= 12) continue;
  seenPaths.add(norm);
  const label = PAGE_LABELS[norm] ?? norm;
  console.log(`  ${bar(count, maxCount, 20)}  ${fmt(count).padStart(5)}  ${label}`);
  shown++;
}

// Países
console.log(`\nTOP PAÍSES (${endDate})`);
const flags = { US:'🇺🇸', CL:'🇨🇱', NL:'🇳🇱', BR:'🇧🇷', RU:'🇷🇺', DE:'🇩🇪',
                FI:'🇫🇮', SG:'🇸🇬', SE:'🇸🇪', UA:'🇺🇦', AR:'🇦🇷', MX:'🇲🇽', ES:'🇪🇸' };
const maxC = countries[0]?.[1] ?? 1;
for (const [country, count] of countries) {
  const flag = flags[country] ?? '🌍';
  console.log(`  ${bar(count, maxC, 20)}  ${fmt(count).padStart(5)}  ${flag} ${country}`);
}

console.log(`\n${'═'.repeat(60)}\n`);
