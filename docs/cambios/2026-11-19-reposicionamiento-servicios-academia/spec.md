# Especificación: reposicionamiento de servicios y Academia 3GI

Versión 1 · 2026-11-19 · borrador. Viene de [intent.md](intent.md); sigue [plan.md](plan.md). Si difiere de la copia de R2, manda este archivo.

## Requisitos funcionales (prioridad propuesta; confirma Gonzalo)

| ID | Requisito | Prioridad | Criterio de aceptación (medible) |
|---|---|---|---|
| RF-01 | La home (ES y EN) usa la frase aprobada en el bloque «Por qué 3G Intelligence»: x-051 «Entendemos tu negocio antes de hablar de IA.» y x-052 «Después diagnosticamos, construimos y te acompañamos en la operación.». x-053 se ajusta para no repetir «entendemos». | MVP | `dist/index.html` contiene ambas frases; no queda «Somos consultores que entienden tu negocio» en `dist/` |
| RF-02 | `hero-tag` pasa de «Consultoría de IA para PyMEs · Chile y LATAM» a «Servicios de IA para empresas · Chile y LATAM» (EN: «AI Services for Businesses · Chile & LATAM», propuesta por confirmar). | MVP | La cadena vieja no aparece en `dist/index.html` ni en `dist/en/index.html` |
| RF-03 | FAQ «¿Quién hace el trabajo…?» reescrito en la home y en `/faq` (ES y EN), sin la frase «No es un curso ni software». Mientras la Academia no esté publicada, **no menciona la Academia**. No afirma que el Plan de Vuelo «incluya la implementación» (la Ejecución es un tramo aparte). | MVP | La cadena vieja no está en `dist/`; el texto no contiene «implementación incluida» (la guardia lo exige) |
| RF-04 | Los JSON-LD de `Layout.astro` coinciden con el texto visible: respuesta del FAQ en ES y EN, y `description` y `OfferCatalog` del servicio. | MVP | Parseo del JSON-LD de `dist/index.html` y `dist/en/index.html`: la respuesta del FAQ es igual al texto visible sin etiquetas |
| RF-05 | `Layout.astro` (título y descripción por defecto) y `llms.txt` dejan de decir «consultora de IA» y describen servicios de diagnóstico, construcción y operación. «Consultoría» se conserva en `/precios` y `/faq` (títulos) y en el valor por defecto de `Layout`. | MVP | `dist/llms.txt` no contiene «es una consultora» ni «consultores dedicados» |
| RF-06 | La guardia de «diagnóstico» acepta las formas del verbo (diagnosticamos, diagnosticar) y sigue rechazando el sustantivo como nombre de servicio. | MVP | Autoprueba: «Después diagnosticamos, construimos» pasa; «Tu diagnóstico ERA» sigue fallando en las páginas del Test ERA |
| RF-07 | Interruptor `ACADEMIA_PUBLICADA` en `src/data/academia.mjs`: `false` por defecto; una variable `PUBLIC_ACADEMIA=1` solo en el entorno de vista previa lo enciende. Con `false`, la producción no contiene la página, el ítem de menú, la frase del FAQ, la línea de `llms.txt` ni la entrada del sitemap. | MVP | Con `false`: `grep -ri academia dist/` solo encuentra los pocos usos aceptados (ninguno visible). Con `1`: aparecen los cinco |
| RF-08 | Página `/academia` solo en español: qué es, para quién, programa «Saca Valor a la IA · Módulo 1» (4 sesiones de 3 horas, grupos de hasta 5 personas, 16 horas en total, diploma verificable), lo que no promete y la aclaración de que es una línea separada de los servicios. **Sin botones ni formulario.** Sin precios, fechas ni datos de contacto nuevos. No entra en `ES_SLUGS_WITH_EN_VERSION`. | MVP | Con el interruptor encendido: la página pasa las tres guardias; no hay `<button>`, `<form>` ni enlaces de inscripción; solo `hreflang="es"` y `x-default` |
| RF-09 | Ítem «Academia» en el menú de escritorio, el menú móvil y el pie, solo en español y solo con el interruptor encendido. **Sin clave `nav-academia` en la tabla `T`** (dejaba un rastro en todas las páginas con el interruptor apagado). El selector ES/EN se oculta en las páginas de `SOLO_ES`. Con el ítem el menú lleva la clase `nav-6` (ver plan, chunk 3). | MVP | Encendido: 3 enlaces; en `/academia` no hay enlace a `/en/academia`. Sin scroll horizontal a 901, 1100 y 1239 px |
| RF-10 | `public/sitemap.xml`: `lastmod` actualizado en las páginas modificadas. La entrada de `/academia` se agrega solo en el PR de apertura. | MVP | `lastmod` de home, `/faq` y las demás modificadas = fecha del cambio |
| RF-11 | `/nosotros` (ES y EN): solo título y descripción meta, para que no digan «somos consultores». La historia personal no cambia. **Confirmado por Gonzalo (2026-11-19).** | Después | `dist/nosotros/index.html` sin «Consultores que mueven»; `<title>` actualizado |
| RF-12 | `README.md` y los `CLAUDE.md` de 3gi-web actualizados (posicionamiento y interruptor en la raíz; regla de la guardia en `src/integrations/CLAUDE.md`). Depende de que el PR `chore/dividir-claude-md` esté fusionado: el `CLAUDE.md` ya está dividido por módulo. | MVP | Los tres puntos están descritos en los archivos correctos |

## Requisitos no funcionales
- RNF-01: las tres guardias (contenido, idioma, diagnóstico) pasan con el interruptor apagado y con él encendido.
- RNF-02: sin dependencias nuevas, sin cambios en `_headers`, `_redirects` ni `robots.txt`.
- RNF-03: ningún texto visible fuera del diccionario (`src/i18n`), sin `data-i18n` para contenido de página.
- RNF-04: ningún secreto ni variable `PUBLIC_*` con datos sensibles.

## Premisas y evidencia

| Premisa | Tipo | Evidencia (2026-11-19) | Estado |
|---|---|---|---|
| La guardia de «diagnóstico» marca «diagnosticamos» | técnica | `node -e` sobre `DIAGNOSTICO = /diagn[oó]stic[oa]?s?\|diagnosis/i`: «Después diagnosticamos» → true; «we diagnose» → false | verificada |
| El selector ES/EN siempre enlaza a `/en/<ruta>` | técnica | `Layout.astro` líneas 763-767: el botón EN navega a `enPath` sin comprobar `hasEnVersion` | verificada |
| `hreflang` solo se emite para slugs de `ES_SLUGS_WITH_EN_VERSION` | técnica | `Layout.astro` líneas 32-37 y 150 | verificada |
| El sitemap es un archivo estático con `lastmod` antiguos | técnica | `public/sitemap.xml`: la mayoría de las páginas, 2026-04-24 | verificada |
| La home no contiene «consultoría» en título ni descripción meta | semántica | `src/i18n/home.mjs` línea 5 | verificada |
| `academia.3gi.cl` raíz: HTTP 200 con una página mínima que dice «3G Intelligence · Capacitaciones» (mismo título), **sin etiqueta `robots` (indexable)**; `/robots.txt` y `/sitemap.xml` dan 404 | técnica | `curl` del 2026-11-19. **Corrección:** antes se registró que la raíz respondía con cuerpo 404 y `noindex`; era la respuesta de `/robots.txt`, que leí por error como si fuera la raíz | verificada |
| El JSON-LD del FAQ debe coincidir con el texto visible | semántica | `CLAUDE.md` de 3gi-web, Fase 3 | documentada; se verifica en la prueba |
| `injectRoute` de una integración puede condicionar una ruta en el build estático | técnica | Probado el 2026-11-19 en una copia del repo (Astro 7.3.2): con `PUBLIC_ACADEMIA` ausente, 30 páginas y ningún rastro de «academia» en `dist/`; con `PUBLIC_ACADEMIA=1`, 31 páginas, `dist/academia/index.html` y solo `hreflang` es y x-default; las tres guardias en verde en ambos casos. Hallazgo confirmado: el selector EN de la página enlaza a `/en/academia/` (RF-09 lo corrige) | verificada |
| Las vistas previas de Cloudflare Pages admiten variables propias y quedan sin protección de acceso | técnica | Sin consultar | **no verificada**: chunk 0, requiere a Gonzalo |
| Los nombres «Academia 3GI» y «Saca Valor a la IA» están libres (INAPI clases 35 y 41; el dominio no requiere NIC Chile: es subdominio de 3gi.cl) | semántica | Sin consultar | **no verificada**: condición de apertura |

## Texto de `/academia` (ES, **aprobado por Gonzalo el 2026-11-19**)
- **Título:** Academia 3GI
- **Bajada:** Aprende a usar IA en tu trabajo, con criterio y verificando lo que produce.
- **Programa:** Saca Valor a la IA · Módulo 1. Uso de IA en tareas reales de trabajo, con verificación de resultados y cuidado de los datos.
- **Formato:** 4 sesiones de 3 horas, una por semana, para grupos de hasta 5 personas. 16 horas en total entre clases, videos y retos. Trabajas con la herramienta que ya usas y sin datos reales de clientes.
- **Para quién:** profesionales y dueños de negocio de cualquier rubro, sin conocimientos técnicos o con conocimientos básicos de IA.
- **Al terminar:** un diploma con folio, que cualquiera puede verificar en línea.
- **Lo que no promete:** no promete mejorar los resultados de tu empresa. Se mide lo que aprendes y cómo cambia tu forma de trabajar.
- **Aclaración:** la Academia 3GI es una línea de 3G Intelligence, separada de los servicios para empresas.
- Sin menciones de «diagnóstico» ni de etapas (las guardias lo rechazan).

## Frase del FAQ (borrador)
- **ES, ahora:** «Nosotros: diagnosticamos, diseñamos y construimos la solución, y la dejamos funcionando en tu infraestructura. Si quieres, te acompañamos en la operación con Piloto Automático; si prefieres operarla por tu cuenta, tu equipo queda preparado para hacerlo.»
- **ES, al publicar la Academia:** se agrega «Y si quieres que tú o tu equipo aprendan a usar IA, existe la Academia 3GI, un programa aparte.»
- **EN (aprobado el 2026-11-19):** «We do the work: we diagnose, design and build the solution and leave it running on your infrastructure. If you want, we accompany you in operations with Autopilot; if you prefer to run it yourself, your team will be ready to do so.» Glosario fijo: Piloto Automático → Autopilot, Plan de Vuelo → Flight Plan.
- «Diagnosticamos» en el FAQ depende de RF-06.

## Riesgos
- Una guardia que se relaja demasiado deja pasar «diagnóstico» como nombre de servicio: por eso RF-06 exige prueba negativa.
- El menú de 6 enlaces podría desbordar en 901 a 1239 px (hoy caben justo 5).
- Las pruebas con navegador escriben en el Supabase real del embudo; se intercepta `funnel_events` desde la primera prueba.
- El texto legal de `/terminos` y `/privacidad` sigue diciendo «consultora» y «consultoría». Queda en la lista para el abogado.

## Textos en inglés (aprobados por Gonzalo el 2026-11-19)
- Bloque «Por qué 3G Intelligence» (x-051 y x-052): «We understand your business before we talk about AI. Then we diagnose, build and accompany you through operations.»
- `hero-tag`: «AI Services for Businesses · Chile & LATAM».
- x-053 (ES): «La diferencia está en el Test ERA. Antes de proponer cualquier herramienta, medimos cómo opera tu empresa y si la IA realmente tiene retorno ahí.» (EN): «The difference is the ERA Test. Before proposing any tool, we measure how your company operates and whether AI really has a return there.»
- FAQ en español aprobado tal como está en «Frase del FAQ».
