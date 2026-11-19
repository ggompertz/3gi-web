// Interruptor de la Academia 3GI (decisión de Gonzalo, 2026-11-19). Tiene tres estados:
//  - EN CONSTRUCCIÓN (hoy, ACADEMIA_PUBLICADA = false): /academia existe en producción pero solo muestra «Página en construcción»,
//    con noindex y sin ningún enlace: no está en el menú, el sitemap, llms.txt ni el FAQ. Llega quien tenga la dirección completa.
//  - REVISIÓN (variable de entorno PUBLIC_ACADEMIA=1, solo en «Vista previa» de Cloudflare Pages, nunca en Producción): muestra la
//    página completa, el ítem de menú, la frase del FAQ y la línea de llms.txt, con noindex.
//  - PUBLICADA (ACADEMIA_PUBLICADA = true): lo mismo, indexable.
// Para abrir la Academia (ver docs/cambios/2026-11-19-reposicionamiento-servicios-academia/plan.md, «Apertura»): cambiar
// ACADEMIA_PUBLICADA a true y agregar /academia a public/sitemap.xml.
export const ACADEMIA_PUBLICADA = false;

/** ¿Se muestra la Academia completa (página, menú, FAQ y llms.txt) en este build? Corre en Node durante el build. */
export const academiaVisible = () => ACADEMIA_PUBLICADA || process.env.PUBLIC_ACADEMIA === '1';

/** ¿La página debe llevar noindex? Siempre, salvo cuando la Academia está publicada de verdad. */
export const academiaNoindex = () => !ACADEMIA_PUBLICADA;

/** Frase que se agrega al final de la respuesta del FAQ «¿Quién hace el trabajo?» solo cuando la Academia es visible (solo ES). */
export const FRASE_FAQ_ACADEMIA = ' Y si quieres que tú o tu equipo aprendan a usar IA, existe la Academia 3GI, un programa aparte.';
