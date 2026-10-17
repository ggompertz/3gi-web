// Fuente única de la oferta de 3GI. Cambiar un precio, plazo o condición AQUÍ y solo aquí:
// precios, metodología, llms.txt y el guardia del build leen este archivo.
// Nomenclatura pública (nunca F1–F5 / «Etapa»). Detalle: skill ia-consultoria-pricing y CLAUDE.md global.

/** @typedef {'es'|'en'} Lang */

export const OFERTA = {
  testEra: { gratis: true, desdeMinutos: 5, informe: 'al terminar' },
  radar: {
    express: {
      sesionMinutos: [45, 120],
      tramos: [
        { id: 'micro', empleados: '1–9', ventasUF: 'hasta 2.400 UF', usd: [1200, 1800] },
        { id: 'pequena', empleados: '10–49', ventasUF: '2.400–25.000 UF', usd: [1800, 2500] },
        { id: 'mediana', empleados: '50–199', ventasUF: '25.000–100.000 UF', usd: [2500, 3500] },
        { id: 'grande', empleados: '200+', ventasUF: 'sobre 100.000 UF', usd: null },
      ],
    },
    r360: { usd: 6000, desdeSemanas: 3, areasEntrevistadas: [4, 6], quickWins: { cantidad: [2, 3], maxSemanas: 4 } },
    descuentoEnPlanDeVueloDias: 90,
  },
  dataFoundation: {
    niveles: [
      { id: 'N1', usd: [800, 2500] },
      { id: 'N2', usd: [2500, 6000] },
      { id: 'N3', usd: [6000, 15000] },
    ],
    certificado: { codigo: 'DRC-DF', validezMeses: 12 },
  },
  planDeVuelo: {
    propuesta: { desdeUSD: 6700, ventanaCotizacionEjecucionDias: 45 },
    ejecucion: { pctROI: [10, 20], umbralROIUSD: 30000, pago: 'por hitos' },
  },
  piloto: [
    { id: 'basico', horas: [5, 10], usd: [1500, 2500] },
    { id: 'estandar', horas: [10, 20], usd: [2500, 4500] },
    { id: 'avanzado', horas: [20, 40], usd: [4500, 8000] },
  ],
  segmento: { empleados: [2, 50] },
  // Cifras de casos y ejemplos que sí pueden aparecer en el sitio (cada una con su origen).
  otrosMontosUSD: [
    { usd: 250000, origen: 'Caso inspecciones y certificaciones (servicios entregados sin cobrar)' },
    { usd: 40000, origen: 'Ejemplo ilustrativo de ROI en la nota de valor del Radar (/precios)' },
    { usd: 30000, origen: 'Umbral de ROI de la Ejecución; y «pierde entre USD 30.000 y 150.000» del hero (SIN FUENTE: pendiente)' },
    { usd: 150000, origen: 'Hero de la home «pierde entre USD 30.000 y 150.000» (SIN FUENTE: pendiente)' },
    { usd: 80000, origen: 'FAQ «una PyME de 20–50 personas pierde entre USD 30.000 y USD 80.000 anuales» (SIN FUENTE: pendiente; además no coincide con el hero)' },
    { usd: 200, origen: 'FAQ: «herramientas de IA accesibles desde USD 50–200 al mes» (precio de herramientas de terceros, no de 3GI)' },
    { usd: 3000, origen: 'Contenido: caso real de LinkedIn «El profesional de USD 3.000» (15-may-2026)' },
    { usd: 864, origen: 'Contenido: mismo caso de LinkedIn (USD 864/mes en tareas administrativas)' },
  ],
};

/** 1200 → «1.200» (es) o «1,200» (en). No usa Intl: es-CL no agrupa los números de 4 dígitos.
 * @param {number} n @param {Lang} lang */
export function num(n, lang) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'es' ? '.' : ',');
}
/** @param {number} n @param {Lang} lang */
export const usd = (n, lang) => `USD ${num(n, lang)}`;
/** @param {readonly [number, number]} r @param {Lang} lang */
export const usdRango = (r, lang) => `USD ${num(r[0], lang)}–${num(r[1], lang)}`;

/** Todos los montos USD que el sitio puede mostrar; el guardia rechaza cualquier otro. */
export function montosPermitidos() {
  const s = new Set();
  const add = (x) => { if (typeof x === 'number') s.add(x); else if (Array.isArray(x)) x.forEach(add); };
  OFERTA.radar.express.tramos.forEach((t) => add(t.usd));
  add(OFERTA.radar.r360.usd);
  OFERTA.dataFoundation.niveles.forEach((n) => add(n.usd));
  add(OFERTA.planDeVuelo.propuesta.desdeUSD);
  add(OFERTA.planDeVuelo.ejecucion.umbralROIUSD);
  OFERTA.piloto.forEach((p) => add(p.usd));
  OFERTA.otrosMontosUSD.forEach((m) => add(m.usd));
  return s;
}

/** Rango del Radar Express: del mínimo del tramo más chico al máximo del tramo «Mediana». */
export const radarExpressRango = () => [OFERTA.radar.express.tramos[0].usd[0], OFERTA.radar.express.tramos[2].usd[1]];

/** Marcadores [[nombre]] que se usan dentro de los textos (src/i18n/*.mjs). Un marcador desconocido hace fallar el build. */
function tokens(lang) {
  const pdv = OFERTA.planDeVuelo;
  return {
    radarDesde: usd(OFERTA.radar.express.tramos[0].usd[0], lang),
    radarRango: usdRango(radarExpressRango(), lang),
    radar360: usd(OFERTA.radar.r360.usd, lang),
    pdvDesde: usd(pdv.propuesta.desdeUSD, lang),
    umbralROI: usd(pdv.ejecucion.umbralROIUSD, lang),
    dfRango: usdRango([OFERTA.dataFoundation.niveles[0].usd[0], OFERTA.dataFoundation.niveles[2].usd[1]], lang),
    pilotoRango: usdRango([OFERTA.piloto[0].usd[0], OFERTA.piloto[2].usd[1]], lang),
    ventana: String(pdv.propuesta.ventanaCotizacionEjecucionDias),
    pct: `${pdv.ejecucion.pctROI[0]}–${pdv.ejecucion.pctROI[1]}`,
    semanasR360: String(OFERTA.radar.r360.desdeSemanas),
    testMin: String(OFERTA.testEra.desdeMinutos),
    descuentoDias: String(OFERTA.radar.descuentoEnPlanDeVueloDias),
    // priceRange del JSON-LD (formato fijo sin separador de miles)
    precioMinimoPlano: String(OFERTA.radar.express.tramos[0].usd[0]),
    precioMaximoPlano: String(OFERTA.piloto[2].usd[1]),
    pilotoMin: usd(OFERTA.piloto[0].usd[0], lang),
    pilotoMax: usd(OFERTA.piloto[2].usd[1], lang),
  };
}
/** @param {string} s @param {Lang} lang */
export function fill(s, lang) {
  const T = tokens(lang);
  return s.replace(/\[\[(\w+)\]\]/g, (m, k) => {
    if (!(k in T)) throw new Error(`Marcador desconocido ${m} en un texto de i18n (ver tokens() en src/data/oferta.mjs)`);
    return T[k];
  });
}

/** Aplica fill() a todos los textos de un objeto (p. ej. JSON-LD). @param {any} o @param {Lang} lang */
export function fillDeep(o, lang) {
  if (typeof o === 'string') return fill(o, lang);
  if (Array.isArray(o)) return o.map((x) => fillDeep(x, lang));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, fillDeep(v, lang)]));
  return o;
}
