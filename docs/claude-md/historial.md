# Historial de CLAUDE.md de 3gi-web

Backlog antiguo, bugs e incidentes ya resueltos, movidos desde `CLAUDE.md` el 2026-11-19 sin cambios. Raíz: `../../CLAUDE.md`.

## Pendientes (backlog priorizado)

**P1 — Lead magnet en quiz** (`/diagnostico`): al terminar las 5 preguntas, pedir email antes de mostrar resultado numérico. Enviar PDF personalizado vía webhook n8n. Alimenta base de leads automáticamente.

**P2 — Separar casos reales vs. proyectados** (`/casos`): arriba "Casos Reales Implementados" (Certificaciones, Distribuidora). Abajo sección rotulada "Casos de Uso de la Industria (Modelos Proyectados)" (Agrícola, Logística). Hoy están mezclados al mismo nivel visual → genera duda de credibilidad.

**~~P3 — i18n nativa Astro~~ ✅ COMPLETADO (commit 831eb8c, Mayo 2026), corregido 23/09/2026:** Rutas `/en/` activas. 7 páginas EN en `src/pages/en/`. Layout.astro detecta idioma por URL. hreflang en todas las páginas. Flowchart visual en `/metodologia` (commit 50452b0). Ver sección **"i18n — arquitectura y bug histórico"** más abajo: el "completado" de mayo dejó el texto en español server-side en varias páginas, corregido recién en septiembre.

**Bug real que existió desde mayo hasta el 23/09/2026:** varias páginas EN (`metodologia`, `casos`,
`precios`, `nosotros`, `faq`) traían el texto **en español hardcodeado** dentro de elementos
`data-i18n`, con una tabla de traducción en un `<script>` que recién aplicaba el inglés
client-side, después de `DOMContentLoaded`. Visualmente en el navegador se veía bien (el JS corría
antes de que el usuario mirara la pantalla), pero el HTML crudo que indexa Google traía español
bajo un `<title>` en inglés — causa probable de que esas URLs aparecieran "rastreada, actualmente
sin indexar" en Search Console. Además, el mismo patrón afectaba al nav/footer/cookie banner
compartidos (`Layout.astro`) y a dos bloques `Schema.org` JSON-LD (`ProfessionalService` +
`FAQPage`) inyectados en el `<head>` de **todas** las páginas del sitio, también hardcodeados en
español sin condicional de idioma.

**Cómo se corrigió:** el texto en inglés ya existía completo en las tablas JS (nunca se aplicaba
server-side) — se extrajo con Node (`vm`-safe, evitando `eval` directo de JS con referencias a
`window`) y se insertó directamente en el HTML de Astro. Los scripts de traducción `data-i18n`
quedaron vestigiales una vez el HTML se sirve ya en el idioma correcto y se eliminaron. El nav,
footer, cookie banner y los dos JSON-LD ahora usan `{lang === 'en' ? '...' : '...'}` (o
`set:html={JSON.stringify(lang === 'en' ? schemaXEn : schemaXEs)}` para los JSON-LD) directamente
en `Layout.astro`, condicionado por el prop `lang` que cada página ya pasa al `<Layout>`.

- **Páginas del Test ERA sin «diagnóstico» (Fase 1, 2026-10-23).** `/test-era` y `/test-era-ia` (ES y EN) llamaban «diagnóstico/diagnostic» al Test ERA (título EN «Free ERA Diagnostic», botón «Start diagnostic →», «Tu diagnóstico ERA»…), contra la regla de arriba: la guardia de contenido solo rechazaba frases exactas y lo dejó pasar. Ahora usa «Test ERA», «resultado ERA» e «Informe ERA» (su entregable), y `guardia-contenido` rechaza `diagnóstico/diagnosis/diagnostic` en texto visible, título y metadatos de esas 4 páginas (los JSON-LD globales de `Layout.astro` se revisan en una fase aparte). Los botones de compartir apuntan a `/test-era` (los enlaces viejos `/diagnostico?era_op=…` siguen funcionando: `_redirects` conserva los parámetros, verificado en producción). Quedan, a propósito, los identificadores técnicos (`diagnostico_id`, `diagnostico-api.3gi.cl`). Plan completo de limpieza del resto del sitio (102 textos, 4 fases): R2 `3gi-outputs/proyectos/3gi-web/2026-10-22/propuesta-nomenclatura-diagnostico.md`.
- **Fase 2: «diagnóstico» fuera del contenido (2026-10-23).** Portada, FAQ, Metodología, Nosotros y Recursos (ES y EN) nombran ahora el servicio correcto (Test ERA, Radar, Propuesta del Plan de Vuelo) en lugar de «el diagnóstico», incluido el JSON-LD del propio FAQ (que debe coincidir con su texto visible). El FAQ decía que el Test ERA proyecta el ROI: es del **Plan de Vuelo**. **El plazo inicial ya no está escrito a mano:** `src/data/oferta.mjs` → `inicio.desdeSemanas` (marcador `[[semanasInicio]]`, «desde 3 semanas», igual que el Radar 360). Se mantienen a propósito los usos genéricos del método («Implementar IA sin diagnóstico es adivinar», «Empieza con diagnóstico»). **Pendiente, a decidir:** el FAQ ahora dice que el trabajo remoto es posible «en caso de ser necesario», Metodología (`met-faq5-a`) dice «puede ser 100% remoto» (decidido por Gonzalo), y Nosotros (`nos-origin-p4`) dice «Podemos operar 100% en remoto» (decidido por Gonzalo): las tres páginas dicen ahora lo mismo; la política de privacidad va en un PR aparte tras la revisión legal (sus 4 menciones están en la lista de excepciones como TEMPORAL).
- **Fase 3: datos estructurados y `llms.txt` sin «diagnóstico» (2026-10-23).** JSON-LD global de `Layout.astro` (en las 27 páginas): descripción del servicio («Radar (evaluación inicial)…»), tópicos (`knowsAbout`: «Madurez en IA» / «AI Maturity» en lugar de «Diagnóstico IA» / «AI Diagnosis») y 3 respuestas del FAQPage, cuyo texto coincide con el visible de la portada («¿Cuánto cuesta trabajar con 3GI y qué incluye?»); `llms.txt` («hacemos el Radar, el análisis y la hoja de ruta»); y la descripción por defecto de `Layout.astro` (hoy ninguna página la usa). **Es el único cambio de la limpieza que puede mover el posicionamiento:** la pregunta del FAQ ya no contiene «diagnóstico de IA». **Seguimiento obligatorio en Search Console** (línea base antes de fusionar; revisar a los 7, 14 y 28 días): consultas con «diagnóstico», páginas `/`, `/faq`, `/en/faq`, `/test-era`, e informe de «Fragmentos enriquecidos / Preguntas frecuentes». Si cae el tráfico de esas consultas, la salida es reponer el término genérico en el cuerpo (no el nombre del servicio). Plan: R2 `3gi-outputs/proyectos/3gi-web/2026-10-22/seguimiento-search-console.md`.

**P4 — Quiz móvil** (`/diagnostico`): en pantallas ≤768px, las tarjetas de opciones de la grilla deben cambiar a lista vertical con padding amplio. Hoy el texto se comprime en bloques rígidos.

**P5 — Calculadora ROI** (`/precios`): widget con dos sliders (horas semanales perdidas + sueldo promedio) que calcule pérdida anual y la contraste con costo del Scan IA USD 2.500.

**P6 — Tipografías locales**: reemplazar Google Fonts (carga síncrona = bloqueo de renderizado) por `@fontsource` alojado localmente. Mejora FCP y LCP.

**P7 — Embudo de diagnóstico** (`/diagnostico` + `/diagnostico-ia`):

- **Copy OTP incorrecto**: la tarjeta de OTP que aparece tras completar el test inicial dice "Respondé 5 preguntas y recibí tu diagnóstico..." — el usuario YA respondió las 5 preguntas, por lo que el copy es confuso y genera desconfianza. Corregir a algo como: "Ingresa tu correo para que la IA genere tu reporte personalizado de madurez."

- **Doble fricción — flujo completo**: (1) cuestionario base 5 preguntas, (2) email, (3) código OTP, (4) redirige a `/diagnostico-ia` con 8 preguntas adicionales de texto libre. Genera fatiga de conversión. Mitigaciones propuestas: persistencia `localStorage` del cuestionario base, puente explicativo antes de las 8 preguntas adicionales justificando por qué la IA necesita ese contexto.



- **Resuelto (2026-06-16/17)**: botón "Reenviar código" en `diagnostico.astro` antes solo reseteaba la UI sin reenviar nada — corregido para llamar de nuevo a `/request-otp` (commit `38c432f`).

- **Resuelto (2026-06-16/17) — notificación admin**: Gonzalo esperaba recibir un correo cada vez que alguien completa el diagnóstico-ia. Se implementó vía webhook `admin-notif` desde el worker `diagnostico-api` (detalle técnico en `3gi-platform/CLAUDE.md`).

- **Diagnóstico de funnel (2026-06-16)**: de 57 visitas/semana a `/diagnostico/`, solo 14 solicitaron OTP en toda la historia desde abril, 5 lo validaron, y solo 2 completaron el informe. Se rastreó hasta el workflow n8n de envío de OTP, que mostraba cero ejecuciones registradas antes del 12 de junio aunque estaba "activo" desde el 25 de mayo — implica que prospectos reales de mayo probablemente nunca recibieron su correo OTP. SPF/DKIM/DMARC de `3gi.cl` se verificaron correctos (Zoho Mail Pro) — no es la causa raíz.
