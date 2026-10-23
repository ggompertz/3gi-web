// llms.txt generado desde src/data/oferta.ts (no editar a mano; antes vivía en public/).
import { OFERTA, usd, usdRango } from '../data/oferta.mjs';

export function GET() {
  const L = 'es' as const;
  const r = OFERTA.radar;
  const pdv = OFERTA.planDeVuelo;
  const body = `# 3G Intelligence (3GI)

> 3GI es una consultora de IA aplicada al negocio real, enfocada en PyMEs de Chile y LATAM. Ayudamos a las empresas a identificar qué procesos automatizar con mayor ROI usando el Framework 3 ERAs (ERA 1: Caos Operativo, ERA 2: Datos Organizados, ERA 3: Empresa con IA), una metodología propia. No vendemos herramientas de IA: hacemos el Radar, el análisis y la hoja de ruta de implementación con consultores dedicados, no software genérico.

3GI trabaja con PyMEs de ${OFERTA.segmento.empleados[0]} a ${OFERTA.segmento.empleados[1]} empleados en Chile, México, Colombia, Argentina y Perú, en rubros como servicios profesionales, manufactura, logística y transporte, construcción/certificaciones, y comercio/distribución. El fundador y director es Gonzalo Gompertz G. (MBA, 20+ años de experiencia con PyMEs).

## Producto y metodología

- [Metodología](https://3gi.cl/metodologia): Framework 3 ERAs completo, posiciones dentro de cada ERA y las etapas del servicio: Test ERA, Radar, Plan de Vuelo y Piloto Automático.
- [Test ERA](https://3gi.cl/test-era): Test gratuito, desde ${OFERTA.testEra.desdeMinutos} minutos, que clasifica a la empresa en una ERA y entrega un puntaje de madurez en IA. Es la puerta de entrada a los demás servicios.
- [Precios](https://3gi.cl/precios): Test ERA gratuito. Radar Express desde ${usd(r.express.tramos[0].usd[0], L)} (según tamaño de la empresa) y Radar 360 en ${usd(r.r360.usd, L)}. Plan de Vuelo en dos tramos: la Propuesta desde ${usd(pdv.propuesta.desdeUSD, L)} (con la cotización cerrada de la Ejecución, vigente ${pdv.propuesta.ventanaCotizacionEjecucionDias} días) y la Ejecución con honorario de ${pdv.ejecucion.pctROI[0]}–${pdv.ejecucion.pctROI[1]} % del ROI validado, pagado ${pdv.ejecucion.pago}. Data Foundation ${usdRango([OFERTA.dataFoundation.niveles[0].usd[0], OFERTA.dataFoundation.niveles[2].usd[1]], L)} según nivel. Piloto Automático (retainer mensual) ${usdRango([OFERTA.piloto[0].usd[0], OFERTA.piloto[2].usd[1]], L)} al mes. Lo pagado por el Radar se descuenta del Plan de Vuelo si se contrata dentro de ${r.descuentoEnPlanDeVueloDias} días.

## Casos y resultados

- [Casos](https://3gi.cl/casos): Casos documentados, incluyendo inspecciones y certificaciones (USD 250.000 en servicios entregados sin cobrar recuperados; 263 % de retorno sobre la inversión a 12 meses), logística de perecederos y exportación agrícola.

## Sobre 3GI

- [Nosotros](https://3gi.cl/nosotros): Historia de la consultora, equipo y filosofía de trabajo (ROI primero, foco LATAM, sin dependencia tecnológica).
- [Libro: Inteligencia Organizacional en la Era IA](https://3gi.cl/inteligencia-organizacional): Libro de Gonzalo Gompertz sobre madurez organizacional y adopción de IA.
- [FAQ](https://3gi.cl/faq): Preguntas frecuentes sobre costos, plazos, rubros atendidos y modelo de trabajo.
- [Contenido](https://3gi.cl/contenido): Artículos y recursos publicados por 3GI.

## English

- [Home](https://3gi.cl/en/) · [Methodology](https://3gi.cl/en/metodologia) · [ERA Test](https://3gi.cl/en/test-era) · [Pricing](https://3gi.cl/en/precios) · [Cases](https://3gi.cl/en/casos) · [About](https://3gi.cl/en/nosotros) · [FAQ](https://3gi.cl/en/faq)

## Contacto

- WhatsApp: https://wa.me/56988974898
- Agendar reunión: https://cal.com/3g-intelligence/30min
- LinkedIn: https://www.linkedin.com/company/3g-intelligence
- Instagram: https://www.instagram.com/3gintelligence

## Optional

- [Privacidad](https://3gi.cl/privacidad): Política de privacidad y cumplimiento (Ley 19.628 de Chile).
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
