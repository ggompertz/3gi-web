# CLAUDE.md: Layout, analítica, embudo y consentimiento (`src/layouts/`)

PostHog, LinkedIn Insight, el banner de cookies que carga `Layout.astro` y el registro del embudo en dos niveles de `public/funnel-track.js`. Raíz: `../../CLAUDE.md`.

## Analítica — PostHog (estado real, 2026-08-10)

`/diagnostico` se renombró a **`/test-era`** (`/diagnostico-ia` → `/test-era-ia`) —
actualizar cualquier referencia vieja a esos slugs que se encuentre en este archivo
o en el código. El worker de OTP también migró de dominio:
`diagnostico-api.3g-ia-agents.com` (viejo, dominio caído — ver
`reference_infra`) → **`diagnostico-api.3gi.cl`** (Custom Domain de Cloudflare
Workers, activo).

**Bug real cerrado (2026-08-09/10)**: PostHog estaba wireado desde el 20-jul pero
`person_profiles: 'identified_only'` en `Layout.astro` descartaba TODO el tráfico
— sitio público, nadie llama `posthog.identify()` nunca. 0 eventos reales entre
20-jul y 09-ago pese a tráfico real confirmado en logs de Cloudflare. Fix:
`person_profiles: 'always'` (commit `5c8c715`). Verificado con un pageview real
propio en `/test-era/` el 09-ago tras el fix — **funciona**.

**Configuración actual de `posthog.init()`** (en el script inline de `Layout.astro`,
gateado por el mismo consentimiento de cookies que GTM):
- `api_host: 'https://z.3gi.cl'` — **Managed reverse proxy propio** (PostHog
  gestiona el proxy vía su propia integración con la cuenta de Cloudflare, no
  requirió tocar DNS manualmente). Evita pérdida de datos por ad-blockers que
  bloquean `*.posthog.com` directamente — problema *distinto* del bug de
  `person_profiles` de arriba, ambos se cerraron la misma sesión.
- `ui_host: 'https://us.posthog.com'` — necesario junto con el proxy, para que los
  links del dashboard de PostHog sigan apuntando a PostHog y no al proxy.
- `person_profiles: 'always'`
- `capture_exceptions: true` — Error Tracking activado (2026-08-10), venía apagado
  por defecto.

**Conversion goal configurado** en Web Analytics de PostHog: evento custom
`informe_completado` (dispara en `test-era-ia.astro` solo cuando `/analizar`
responde `data.ok === true` y se renderiza el resultado real — no en errores ni
timeouts). Requirió sembrar el evento manualmente vía API antes de que apareciera
en el selector de PostHog (el dropdown solo sugiere eventos ya vistos).

**Datos de prueba mezclados en PostHog** (proyecto 520966): varios eventos de
diagnóstico (`server_side_curl_test`, `raw_fetch_test_from_page`,
`manual_verification_test*`, `informe_completado` sembrado con
`distinct_id: seed-event-conversion-goal`, sin `$session_id`) — fáciles de
filtrar/ignorar por `distinct_id`, no se limpiaron por falta de scope de
escritura en la Personal API Key usada (`3GI-ERA`, scopes: `query:read` +
`project:read` únicamente).

**Funnel completo instrumentado** (`window.__funnelTrack`, definido en
`Layout.astro`, llamado desde `test-era.astro`/`test-era-ia.astro`, ES+EN):
`test_view` → `test_start` → `test_question` (×N) → `gate_view` →
`otp_requested` → `test_complete` → `report_view` → `informe_completado`.

Handoff completo de esta sesión (incluye todo el proceso de diagnóstico, no solo
el estado final): `my-config/handoffs/2026-08-10_3gi-web-posthog-fix-completo.md`.

## LinkedIn Insight Tag y funnel-track.js (2026-10-16)

- **LinkedIn Insight Tag** (partner `9969249`): `window.__loadLinkedIn()` en `Layout.astro`, **solo tras aceptar cookies**
  (mismo gate que GTM y PostHog, llamado en los mismos dos puntos). El `<noscript>` del snippet oficial se omite a propósito
  (dispararía sin consentimiento). **No pegar el snippet fijo en el HTML**: cargaría para todos y contradice `privacidad`.
- **Conversión LinkedIn `31872113`** = Test ERA completado: `window.__linkedinConversion()` se llama junto a
  `informe_completado` en `test-era-ia.astro` (ES y EN). No cuelga de `__funnelTrack` (ver abajo).
- **`public/funnel-track.js` redefine `window.__funnelTrack`** en test-era, test-era-ia y recursos (ES y EN), pisando la
  versión de `Layout.astro`. Envía a Supabase `funnel_events` (en dos niveles según el consentimiento, ver «Funnel y consentimiento») y, desde 2026-10-16, también
  reenvía a PostHog (`toPostHog()`; cola `window.__phQueue` mientras PostHog termina de cargar, la vacía `Layout.astro`).
  Antes del 16-oct los eventos del funnel NO llegaban a PostHog en esas páginas.
- **Probar PostHog con Playwright no sirve**: posthog-js 1.438.x descarta `capture()` en navegadores automatizados (devuelve
  `undefined`, ningún request a `/e/`), aun cambiando User-Agent y `navigator.webdriver`. Para verificar la lógica propia,
  espiar `posthog.capture`; para verificar la entrega real, un recorrido manual y revisar Activity en PostHog.
- **LinkedIn no podía "verificar" el tag** (resuelto por Gonzalo el 2026-10-16; no se registró el método): el verificador no acepta el banner, era esperado. Comprobar aceptando cookies y con
  la extensión Insight Tag Helper; "Activo" llega con tráfico real que aceptó cookies (hasta 24 h).
- **`posthog-js` fijado a 1.438.12** (2026-10-17, `Layout.astro`). Para subirla: cambiar la URL de jsDelivr, correr `scripts/manual-tests/funnel-consentimiento.mjs` y revisar el changelog; revisarla cada trimestre.
- **Pendientes**: plazo de retención de `funnel_events` y de PostHog sin definir;
  segunda conversión `test_complete` opcional en Campaign Manager. Handoffs:
  `my-config/handoffs/2026-10-16_3gi-web-linkedin-insight-tag.md` y `2026-10-16_3gi-web-funnel-consentimiento-mascaras.md`.

## Funnel y consentimiento (2026-10-16)

Spec: R2 `3gi-outputs/proyectos/3gi-web/2026-10-16/prd-funnel-consentimiento.md`. Prueba: `scripts/manual-tests/funnel-consentimiento.mjs` (contra preview local, Supabase interceptado).

- **`funnel-track.js` en dos niveles.** Sin consentimiento aceptado (sin decisión o rechazo): el ID de sesión vive solo en una variable en memoria, no se lee ni escribe nada en `sessionStorage`/`localStorage` y `utm` lleva solo los `utm_source/medium/campaign/content/term` de la dirección actual (desde 2026-10-19, decisión de Gonzalo para atribuir la campaña de LinkedIn; ver «UTM sin consentimiento»). Con consentimiento: ID en `sessionStorage` (`_3gi_fsid`) y parámetros `src` + `utm_*` (`_3gi_futm`); si había un ID en memoria al aceptar, se adopta.
- **`lid` ya no se guarda** (es el ID de un lead en el enlace del PDF; unía navegación con una persona). Si un `_3gi_futm` heredado lo trae, se elimina. Si algún día se usa `lid`, que viaje solo en el envío del formulario (el `leads` guarda `consentimiento`).
- **Bots descartados**: `navigator.webdriver` o User-Agent bot/crawl/headless/lighthouse/preview. **Efecto en pruebas**: cualquier prueba con Playwright debe ocultar `webdriver` y usar un User-Agent normal, si no `__funnelTrack` no envía nada.
- **Tasa de consentimiento**: los handlers del banner (`Layout.astro`) llaman `__funnelTrack('consent_accepted' | 'consent_rejected')`. Solo cuenta en páginas con `funnel-track.js`. Leer con `select evento, count(distinct session_id) from funnel_events where evento like 'consent_%' group by 1` y compararlo con las sesiones de `test_view`.
- **PostHog**: `enable_recording_console_log: false` y `session_recording.maskAllInputs: true` en `posthog.init`. Máscaras en el HTML: `ph-no-capture` en el correo del paso del código (ES `#gate-otp-email`, EN `#otp-email-display`) y `ph-mask` en `#result-step` (informe). **Un dato personal nuevo mostrado como texto** (no en un campo) hay que marcarlo con una de esas clases. El registro de consola también se apaga en PostHog (Settings, Session replay), paso manual.
- **Límite aceptado**: sin consentimiento el funnel no une `test-era` con `test-era-ia` (cada página tiene su ID en memoria); el tramo final lo cubre `diagnostico_completions`.
- **Fuera de alcance, no tocar sin pedirlo**: el comportamiento del banner (se esconde al hacer scroll para no tapar el CTA, Memoria de Soluciones #12) y las filas históricas de `funnel_events`.
- **Banner de cookies compacto en móvil y botón "Empezar" arriba (2026-10-17).** En pantallas de hasta 640 px el banner usa un texto corto con enlace a `/privacidad` y los botones en una fila (88 px, antes 124); el texto largo sigue en escritorio. Además, en `/test-era` (ES) hay una copia del botón "Empezar Test ERA" justo bajo el subtítulo, solo en pantallas de hasta 600 px (`.intro-cta-top`): el botón original queda siempre a ~700 px del borde superior, bajo el pliegue o rozado por el banner (tráfico móvil de la campaña de LinkedIn; en 390x844 el banner tapaba la mitad inferior). La página EN ya tenía el botón arriba. Prueba `scripts/manual-tests/banner-movil.mjs` (176 combinaciones de pantalla x ES/EN): centros del botón tapados 28 (banner de 124 px) → 17 (banner compacto) → 0 (con el botón superior); falla si el banner pasa de 100 px o si hay algún centro tapado. El resto del comportamiento del banner (esconderse al hacer scroll, Memoria de Soluciones #12) no cambió.
- **Evento `cta_empezar_click`** (meta `pos`: `arriba`, `abajo` en ES o `unico` en EN) se registra al apretar "Empezar" en `startQuiz()`. **`test_start` no es ese clic**: se dispara al responder la PRIMERA pregunta (`selectOpt`, `current === 0`). Para separar "no ve el botón" de "no responde la primera pregunta": comparar `test_view` → `cta_empezar_click` → `test_start`.
- **Trampa: tabla de traducción vestigial en `Layout.astro`** (`'cookie-banner-text'`, `cookie-accept`, `cookie-reject`, etc., ~líneas 889 y 1022) reescribe en el navegador cualquier elemento con `data-i18n`. Sobrescribió el texto del banner con la versión vieja ("solo Google Analytics") entre el 16-10 y el 17-10, aunque el HTML del servidor decía lo correcto: el texto con PostHog y LinkedIn nunca se vio. Se quitó `data-i18n` del texto del banner y se actualizó la tabla. **Verificar siempre el texto VISIBLE en un navegador (`innerText` tras cargar), no el HTML crudo.** La prueba `banner-movil.mjs` ahora lo comprueba en móvil y escritorio, ES y EN.
- **`test_start` no es el clic en "Empezar"**: se dispara al responder la PRIMERA pregunta (`selectOpt`, `current === 0`). No hay evento para el clic en "Empezar Test ERA".
- **Las pruebas escriben en el Supabase real.** Un preview local (`localhost:4399`) o una prueba contra `3gi.cl` que no intercepte `funnel_events` inserta filas reales con la anon key. El 2026-10-16 unas pruebas mías dejaron 34 filas (23 sesiones, incluidos 4 `informe_completado` falsos) y distorsionaron el análisis; se borraron el 2026-10-17 con respaldo en R2 (`proyectos/3gi-web/2026-10-17/respaldo-funnel_events-filas-de-prueba.json`). Regla: interceptar `funnel_events` desde la primera prueba (ver `scripts/manual-tests/funnel-consentimiento.mjs`) y no usar `distinct_id`/sesiones reales.
- **Línea base real de `funnel_events`** (hasta el 2026-10-15): 1 a 3 eventos por día; desde julio solo 3 sesiones con `test_start` y ninguna con `informe_completado`. El 2026-10-17 hubo un pico de 193 sesiones solo con `test_view`, sin avanzar ni traer campaña (origen sin explicar: campaña de LinkedIn o bots que el filtro no reconoce). Hasta el 2026-10-19 el diseño de dos niveles no registraba la campaña de origen sin consentimiento (771 sesiones sin un solo `utm`, campaña de LinkedIn sin atribuir); desde esa fecha se registran los `utm_*` (ver abajo).
- **UTM sin consentimiento (2026-10-19, opción B).** Sin consentimiento, `readUtm()` en `public/funnel-track.js` envía en cada evento solo `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y `utm_term` de `location.search`, sin guardarlos (0 escrituras en storage). Un valor solo se acepta si cumple `^[A-Za-z0-9._~-]{1,64}$` (un correo, espacios o símbolos en un enlace compartido se omiten). `src` y `lid` NO se registran en este nivel. Como el ID sigue en memoria, la atribución vale para los eventos de la página de entrada (`test_view`, `cta_empezar_click`, `test_start` en `/test-era/`), no entre páginas. Cambiaron la política de privacidad (ES y EN, secciones 1 y 8) y el texto largo del banner (escritorio; el corto de móvil no cambia). Pruebas: `RF-UTM-01` a `RF-UTM-04` en `funnel-consentimiento.mjs`. Spec: R2 `proyectos/3gi-web/2026-10-19/prd-trd-utm-sin-consentimiento.md`. **Pendiente antes de lanzar la campaña:** confirmar con un clic real desde un anuncio que LinkedIn conserva los `utm_*` en la URL final. Texto legal sin revisión de un abogado.
