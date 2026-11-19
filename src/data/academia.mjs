// Interruptor de la Academia 3GI (decisión de Gonzalo, 2026-11-19): la página /academia, el ítem de menú, la frase del FAQ y la
// línea de llms.txt existen solo cuando la Academia está visible. Hoy NO se muestra al público.
//
// Para abrir la Academia (ver docs/cambios/2026-11-19-reposicionamiento-servicios-academia/plan.md, «Apertura»):
// cambiar ACADEMIA_PUBLICADA a true y agregar /academia a public/sitemap.xml. Para REVISARLA antes, sin abrirla: la variable de
// entorno PUBLIC_ACADEMIA=1 solo en el entorno de «Vista previa» de Cloudflare Pages (nunca en Producción). Con esa variable la
// página lleva noindex.
export const ACADEMIA_PUBLICADA = false;

/** ¿Se muestra la Academia en este build? Corre en Node (configuración de Astro, plantillas y endpoints del build). */
export const academiaVisible = () => ACADEMIA_PUBLICADA || process.env.PUBLIC_ACADEMIA === '1';

/** ¿Es solo una vista de revisión (variable de entorno) y no la apertura real? Entonces la página no debe indexarse. */
export const academiaSoloRevision = () => !ACADEMIA_PUBLICADA && process.env.PUBLIC_ACADEMIA === '1';

/** Frase que se agrega al final de la respuesta del FAQ «¿Quién hace el trabajo?» solo cuando la Academia es visible (solo ES). */
export const FRASE_FAQ_ACADEMIA = ' Y si quieres que tú o tu equipo aprendan a usar IA, existe la Academia 3GI, un programa aparte.';
