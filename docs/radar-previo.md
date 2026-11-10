# Formulario «Preparación del Radar» (`/radar/previo/`)

Página **privada** de 3gi.cl donde un cliente completa, con un enlace único, la información previa a la reunión del Radar.
Especificación completa: `3gi-platform/docs/cambios/2026-11-05-radar-previo/` (intent, spec y plan). Backend: Worker `3gi-radar-previo-api`
(`3gi-platform/workers/radar-previo-api`), publicado en `https://radar-previo-api.3gi.cl` (se activa en el bloque C8).

## Piezas en este repo
| Archivo | Para qué |
|---|---|
| `src/pages/radar/previo.astro` | Ruta ES (`/radar/previo/`); envoltorio de la plantilla |
| `src/pages/en/radar/previo.astro` | Ruta EN (`/en/radar/previo/`); la misma plantilla con `lang="en"` |
| `src/components/pages/RadarPrevioPage.astro` | Pantallas (carga, enlace inválido, introducción, secciones, revisión, enviado), estilos con prefijo `rp-` |
| `src/components/pages/RadarPregunta.astro`, `RadarCampo.astro` | Una pregunta y un control según su tipo |
| `src/scripts/radar-previo.js` | Lógica del navegador: token, guardado automático, condiciones, envío |
| `src/layouts/LayoutPrivado.astro` | Layout sin analítica, sin banner de cookies, con `noindex` |
| `src/i18n/radar-previo.mjs` | Todos los textos (`es` y `en`), los enlaces por idioma y la verificación de cobertura |
| `src/data/radar-previo/*.json` | **Copia** de la estructura de preguntas (fuente: 3gi-platform) |
| `public/_headers` | `noindex`, `no-referrer` y `no-store` para `/radar/*` y `/en/radar/*` |
| `sentry.client.config.ts` | No inicializa Sentry en `/radar/` ni `/en/radar/` |
| `scripts/manual-tests/radar-previo-ui.mjs` | Prueba de interfaz con un Worker simulado (107 verificaciones, ES y EN) |

## Sincronizar la estructura de preguntas con 3gi-platform
La estructura (ids, tipos, opciones, condiciones) tiene **una fuente**: `3gi-platform/workers/radar-previo-api/estructura/`. Aquí vive una copia, y el
build **falla** si no coincide con el registro de hashes (`RADAR_PREVIO_ESTRUCTURA_DESALINEADA`). Para actualizarla:

```bash
P=/ruta/a/3gi-platform/workers/radar-previo-api/estructura
cp $P/core.v1.json $P/financiero.v1.json $P/estructura.sha256.json src/data/radar-previo/
npm run test:radar     # hashes y cobertura del diccionario
npm run build
```
Si cambió una pregunta u opción, el build también falla (`RADAR_PREVIO_TEXTOS_INCOMPLETOS`) hasta que `src/i18n/radar-previo.mjs` la cubra.
`destino` y `sugiere` (mapeo interno al Radar) viajan en la copia pero **nunca** al HTML público: la página solo emite una lista blanca de campos.

## Variables
- `PUBLIC_RADAR_PREVIO_API` (opcional): URL base del Worker. Por defecto `https://radar-previo-api.3gi.cl`. No es un secreto.

## Privacidad: decisiones y por qué
- El token del enlace va en el **fragmento** (`#t=…`): no viaja al servidor ni en `Referer`. Se quita de la URL al cargar y queda en `sessionStorage`
  (solo esa pestaña) para poder recargar; es almacenamiento estrictamente funcional, no analítica.
- **Sin GTM, PostHog, LinkedIn Insight ni `funnel-track.js`** y sin banner de cookies (no hay nada que consentir).
- **Sentry no se inicializa** en estas rutas: sus trazas de carga incluyen la URL completa y el token estaba en ella. La prueba lo comprueba con un control
  positivo (en una página pública Sentry sí se inicializa).
- «Guardado» solo se muestra cuando el Worker respondió 200; ante un error nunca se muestra texto del servidor.

## «Otro» con texto obligatorio (estructura 1.2.0, 2026-11-10)
`n10`, `n13` y `n15` ofrecen la opción `otro`; `n05` pide «¿Quién?» con «Otra persona». El texto libre vive en **preguntas acompañantes** (`n05q`, `n10o`, `n13o`, `n15o`):
`texto_corto` de 3 a 300 caracteres (`min_chars`, `max_chars`), obligatorias solo cuando su padre las pide (`visible_si` con `op` `eq` o `incluye`, condiciones POSITIVAS: sin dato o «No sé» en el padre = ocultas).
- Un acompañante es una pregunta más en el HTML (`RadarPregunta.astro` la reconoce por la condición positiva): sin «No sé» propio, con la advertencia de no escribir datos personales, contador y foco al aparecer.
- **Lo que se ve es lo que se guarda:** al desmarcar «Otro» o marcar «No sé» en el padre, el campo se oculta y el servidor recibe `''`; el texto queda solo en la sesión local y reaparece si se vuelve a marcar.
- El mínimo de 3 caracteres se exige al **enviar** (revisión: «Escribe cuál (mínimo 3 caracteres)»), no al guardar. `visible()` en `src/scripts/radar-previo.js` repite la regla de `esVisible` del Worker.
- `min_chars` y `max_chars` están en la lista blanca de `RadarPrevioPage.astro`: sin ellos el navegador no aplica el mínimo ni el tope.
- **Orden de despliegue: Worker primero, web después.** Si la web sale antes, el Worker responde 422 `ID_DESCONOCIDO` al guardar un acompañante.
- Especificación y plan: `3gi-platform/docs/cambios/2026-11-10-radar-otro/`.

## Probar
```bash
npm run test:radar && npm run test:guardia
npm run build && node_modules/.bin/astro preview --port 4399
node scripts/manual-tests/radar-previo-ui.mjs        # otro terminal
```
La prueba intercepta el Worker y toda solicitud externa: no escribe nada real. T19 («Otro») usa el validador REAL del Worker si encuentra `3gi-platform` (`RADAR_VALIDAR_JS`, por defecto `/home/ggomp/3gi-platform/workers/radar-previo-api/src/validar.js`); sin él lo omite y lo dice.

## Pendiente
- **Cabeceras en Cloudflare:** `! X-Robots-Tag` (quitar la cabecera general antes de poner `noindex`) no se puede comprobar en local. Tras el primer despliegue
  de vista previa: `curl -sI https://<preview>/radar/previo/ | grep -i x-robots-tag` debe mostrar solo `noindex, nofollow, noarchive`. El `<meta robots>` de la
  página ya garantiza `noindex` aunque la cabecera falle.
- **Inglés (hecho en C6).** Glosario de marca: Radar → Radar, Test ERA → ERA Test; «ERA» siempre en mayúsculas. Tres capas lo protegen: (1) la guardia de
  idioma del build (rechaza español en `/en/` y frases idénticas al español); (2) `npm run test:radar`, que además exige que **ningún** texto en inglés
  sea idéntico a su par en español salvo una lista corta de nombres propios, porque la guardia del build **no ve una palabra suelta sin tildes**
  («Guardado», «Siguiente»); (3) la prueba de interfaz, que revisa el texto visible y el oculto. Al agregar una pregunta u opción hay que traducirla
  en ambos idiomas o el build falla. Al cambiar un texto, revisar `innerText` en el navegador, como pide la regla del sitio.
- Los nombres de instituciones o normas chilenas dentro del inglés llevan `lang="es"` si conservan tildes o «ñ».
- **Texto de privacidad** de `/privacidad/`: ampliarlo para el uso de estas respuestas (sin revisión de un abogado).
- **Observación sin verificar en producción:** en este build el cliente de Sentry queda sin DSN (`process.env.SENTRY_DSN` no llega al navegador). Si en producción
  tampoco llega, Sentry no estaría enviando errores del navegador; conviene comprobarlo aparte.
