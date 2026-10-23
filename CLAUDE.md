# CLAUDE.md — 3gi-web

Sitio público de 3G Intelligence (`3gi.cl`). Deploy automático vía integración Git de Cloudflare Pages (corregido 22-jun-2026): basta con push a `master` — GitHub es la fuente de verdad, Cloudflare buildea y despliega solo.

```bash
git add <archivos> && git commit -m "mensaje" && git push origin master
# Cloudflare Pages detecta el push y despliega automáticamente (~2 min)
```

**Fallback manual** (solo si la integración Git falla) — build y deploy con wrangler desde Hetzner:
```bash
ssh hetzner-3gi && cd /root/3gi-web && git pull origin master
npm run build
CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN .env | cut -d= -f2) \
  npx wrangler@latest pages deploy dist --project-name 3gi-web --commit-dirty=true
```

> ⚠️ **Verificado 22/09/2026: este fallback no puede ejecutarse hoy.** `/root/3gi-web` no existe en el
> servidor Hetzner actual (`178.104.93.211`, reconstruido tras el incidente de seguridad del 16-19/09) —
> habría que clonar el repo ahí de nuevo antes de poder usar este camino. El flujo primario (push directo
> → Cloudflare Pages) sigue funcionando normalmente y no depende de esto — la regla global
> "Hetzner-primero" (memoria `feedback_github_workflow`) tampoco aplica a este repo: push directo desde
> la máquina de desarrollo a GitHub es correcto.

> **Workaround 500 en upload:** si wrangler falla con `POST /pages/assets/upload -> 500` (CF error 1101), correr primero `python3 /root/3gi-web/docs/pre-upload.py` para pre-subir archivos uno a uno, luego wrangler normalmente. Causa: CF Worker crashea con PNGs grandes en batch JSON.

**SSH alias correcto:** `hetzner-3gi` (no `hetzner`) → `ssh -i ~/.ssh/hetzner_n8n root@178.104.93.211` (IP corregida 22/09/2026 — la anterior, `178.156.157.141`, es el servidor viejo comprometido y dado de baja)

## Diseño homepage (index.astro) — decisiones tomadas

- **ERA framework grid**: en móvil ≤640px se oculta la tabla y se muestran `.era-mobile-cards` — 3 tarjetas apiladas (una por ERA) con filas dim/valor. La tabla desktop sigue intacta. NO volver a intentar scroll horizontal, no funciona.
- **Métricas "Resultado real"**: `metric-after` baja a 17px en ≤600px + `overflow-wrap: break-word` (palabras largas como "Automático"/"Recuperado")
- **"Empresas que movemos"**: `pq-grid` pasa a 1 columna en ≤480px para evitar truncado en "Manufactura"/"Construcción y Certif..."
- **"Por qué 3GI" founder card**: cargo ("Fundador y Director") aparece primero en verde uppercase, luego nombre — nunca al revés

## Pendientes (backlog priorizado)

**P1 — Lead magnet en quiz** (`/diagnostico`): al terminar las 5 preguntas, pedir email antes de mostrar resultado numérico. Enviar PDF personalizado vía webhook n8n. Alimenta base de leads automáticamente.

**P2 — Separar casos reales vs. proyectados** (`/casos`): arriba "Casos Reales Implementados" (Certificaciones, Distribuidora). Abajo sección rotulada "Casos de Uso de la Industria (Modelos Proyectados)" (Agrícola, Logística). Hoy están mezclados al mismo nivel visual → genera duda de credibilidad.

**~~P3 — i18n nativa Astro~~ ✅ COMPLETADO (commit 831eb8c, Mayo 2026), corregido 23/09/2026:** Rutas `/en/` activas. 7 páginas EN en `src/pages/en/`. Layout.astro detecta idioma por URL. hreflang en todas las páginas. Flowchart visual en `/metodologia` (commit 50452b0). Ver sección **"i18n — arquitectura y bug histórico"** más abajo: el "completado" de mayo dejó el texto en español server-side en varias páginas, corregido recién en septiembre.

## i18n — arquitectura y bug histórico (corregido 23/09/2026)

**Cómo funciona hoy:** cada ruta `/en/<page>` es un archivo Astro **separado** de su equivalente
`/es/<page>` (no hay una sola página que cambie de idioma dinámicamente). El toggle ES/EN del nav
(`Layout.astro`) navega con `window.location.href`, no cambia estado client-side. Por lo tanto,
**el texto de cada página debe estar hardcodeado en el idioma correcto directamente en el HTML
que genera Astro** — no debe depender de JavaScript para mostrarse correctamente.

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

**Regla para páginas EN nuevas o modificadas**: nunca usar `data-i18n` + script de traducción para
el contenido propio de una página — escribir el texto en inglés directamente en el archivo
`.astro` de `/en/`. Si se usa un script de reemplazo automatizado (ver commit `d5fced4` en
`my-config/handoffs/2026-09-23_3gi-web-i18n-server-side-en-pages.md` para el patrón completo), no
asumir que cada clave aparece una sola vez en el archivo — verificar con un escaneo de
consistencia entre ocurrencias duplicadas antes de dar el fix por terminado.

**Español dentro del inglés: cuarto caso (22/10/2026, PR #12 y #13).** Gonzalo halló en producción, en `/en/metodologia`,
«Entregable: Score de Madurez IA…» y «Resultado: Empresa con ventaja competitiva…» dentro del diccionario EN; al revisar
todo aparecieron dos más en `/en/casos` («ROI proyectado a 12 meses» y «Sobre la inversión total en diagnóstico e
implementación»), escritos directo en la plantilla y por eso en español en AMBOS idiomas. Corregidos con claves de
diccionario. Además la portada atribuía el «Informe ERA» (entregable del Test ERA gratuito) al Radar; ahora dice
«Informe ejecutivo» / «Executive report», como la página de Metodología. **Guardia de idioma (`src/integrations/guardia-idioma.mjs`, desde 2026-10-23).** Integración de Astro junto a la de contenido: hace FALLAR el build si una página `/en/` (1) tiene marcadores de español (`ñ ¿ ¡`, tildes, palabras funcionales como de/del/los/las/una/para/con/que/por/sobre…) en texto visible, `alt`/`title`/`placeholder`/`aria-label`, metadatos o JSON-LD, o (2) comparte con su página en español un texto de 3 o más palabras y 15 o más caracteres, idéntico y que no parezca inglés ni un nombre propio (esto atrapa lo escrito directo en la plantilla, que sale igual en ambos idiomas). **Español intencional:** marcar el elemento con `lang="es"` (o `translate="no"`, o la clase `en-row-orig`); solo si no se puede, una entrada con MOTIVO en `src/data/idioma-permitidos.mjs`. Antes de revisar el sitio ejecuta una autoprueba con los errores reales del 22/10: si el detector no los marca, el build falla. Pruebas: `npm run test:guardia` (11 casos, incluida la regresión de que `<html lang="es">` no debe vaciar la comparación). Control negativo hecho: con los 4 textos del 22/10 reintroducidos, el build falla y los nombra. Al activarla encontró y se corrigieron 2 errores más: `7 días` escrito en la plantilla de `/en/casos` y dos `aria-label` en español en `/en/` («Áreas de negocio», «Escribir por WhatsApp»); se marcaron con `lang="es"` los nombres de instituciones y el origen del nombre «3G» en `/en/nosotros`. También lee el texto precargado de los enlaces `wa.me/?text=` y el asunto/cuerpo de `mailto:` (eran 3 mensajes en español en `/en/` y `/en/faq`, y el de la portada decía «diagnóstico de IA»; ahora son claves de diccionario `hero-wa-msg`, `cta-wa-msg`, `faqp-cta-wa-msg` en ES y EN y dicen «Radar»), y `guardia-contenido` rechaza «diagnóstico/diagnosis/diagnostic» en esos enlaces. **Límites:** no detecta un término de marca equivocado que suene a inglés válido: eso solo lo atrapa leer la página en vivo con el glosario. Tras cada cambio de contenido EN igual hay que leer las páginas en el navegador (`innerText`). Los títulos en español de `contenido` (`en-row-orig`) y los nombres de
instituciones en `nosotros` son intencionales. Lección completa: `my-config/handoffs/2026-10-22_ingles-portal-y-sitio-y-ensenanza.md`
y `process-rules.yaml` → `textos_bilingues_es_en`.

**Glosario de marca ES → EN** (confirmado con Gonzalo 23/09/2026, no reinventar):

| Español | Inglés |
|---|---|
| Radar (Express / 360) | Radar (Express / 360) — sin traducir |
| Test ERA | ERA Test |
| Plan de Vuelo | Flight Plan |
| Piloto Automático | Autopilot |
| Diagnóstico (genérico) | Diagnosis (NO confundir con "Test ERA" — son términos distintos en inglés aunque en español a veces se usan indistintamente) |

## Nomenclatura y precios en /precios (corregido 14/10/2026, PR #9 y #10)

- **El Test ERA es gratuito y NUNCA se llama "diagnóstico".** "Diagnóstico" es el nombre interno del servicio F1 de pago; la capa pública es **Radar Express / Radar 360 → Plan de Vuelo → Piloto Automático**. La nota de valor de `/precios` decía "el costo del Test ERA se descuenta de Plan de Vuelo" (falso: el Test ERA no cuesta); se refería al Radar. Corregido en `precios.astro` y `en/precios.astro`.
- **Política de descuento:** lo que el cliente paga por su Radar (Express o 360) se descuenta del precio del Plan de Vuelo si lo contrata dentro de los **90 días** siguientes a la entrega del informe.
- **El Radar NO incluye scoring, ROI ni PRD:** eso vive en Plan de Vuelo (desde USD 6.700; implementación aparte, 10 a 20% del ROI validado si supera USD 30.000). No prometer ROI cuantificado antes del Plan de Vuelo.
- **Precios vigentes (consultados 14/10/2026):** Radar Express USD 1.200-1.800 micro · 1.800-2.500 pequeña · 2.500-3.500 mediana · grande a cotizar; Radar 360 USD 6.000 plano; Data Foundation N1 800-2.500, N2 2.500-6.000, N3 6.000-15.000; Piloto Automático USD 1.500-2.500 / 2.500-4.500 / 4.500-8.000 al mes.
- **`<title>` SEO** separado del H1: ES "Precios de consultoría de IA para PyMEs · 3G Intelligence", EN "AI Consulting Pricing for SMBs · 3G Intelligence". El H1 sigue siendo "El Radar cuesta menos que un error de implementación".
- **Segmento: 2 a 50 empleados** (definitivo, Gonzalo 14 y 16/10/2026). Aplicado el 16/10 en `index`, `faq`, `metodologia` (ES y EN), tablas de traducción y JSON-LD de `Layout.astro`, y `public/llms.txt`. Las cifras de los casos (AMCL 5–10 empleados, distribuidora 10–15) son datos de clientes, no el segmento: no tocarlas. Pendiente: bloques en español dentro de `en/index.astro` (`faq3-a`, etc.) y revisar el segmento en `nosotros` (no declara rango).

**P4 — Quiz móvil** (`/diagnostico`): en pantallas ≤768px, las tarjetas de opciones de la grilla deben cambiar a lista vertical con padding amplio. Hoy el texto se comprime en bloques rígidos.

**P5 — Calculadora ROI** (`/precios`): widget con dos sliders (horas semanales perdidas + sueldo promedio) que calcule pérdida anual y la contraste con costo del Scan IA USD 2.500.

**P6 — Tipografías locales**: reemplazar Google Fonts (carga síncrona = bloqueo de renderizado) por `@fontsource` alojado localmente. Mejora FCP y LCP.

**P7 — Embudo de diagnóstico** (`/diagnostico` + `/diagnostico-ia`):

- **Copy OTP incorrecto**: la tarjeta de OTP que aparece tras completar el test inicial dice "Respondé 5 preguntas y recibí tu diagnóstico..." — el usuario YA respondió las 5 preguntas, por lo que el copy es confuso y genera desconfianza. Corregir a algo como: "Ingresa tu correo para que la IA genere tu reporte personalizado de madurez."

- **Doble fricción — flujo completo**: (1) cuestionario base 5 preguntas, (2) email, (3) código OTP, (4) redirige a `/diagnostico-ia` con 8 preguntas adicionales de texto libre. Genera fatiga de conversión. Mitigaciones propuestas: persistencia `localStorage` del cuestionario base, puente explicativo antes de las 8 preguntas adicionales justificando por qué la IA necesita ese contexto.

- **Dependencia crítica sin fallback**: el servicio OTP corre en `diagnostico-api.3g-ia-agents.com` (repo/worker en `3gi-platform`). Si ese servicio cae, el embudo completo se corta — ningún lead puede avanzar. No hay fallback documentado ni alerta de monitoreo activa.

- **Resuelto (2026-06-16/17)**: botón "Reenviar código" en `diagnostico.astro` antes solo reseteaba la UI sin reenviar nada — corregido para llamar de nuevo a `/request-otp` (commit `38c432f`).

- **Resuelto (2026-06-16/17) — notificación admin**: Gonzalo esperaba recibir un correo cada vez que alguien completa el diagnóstico-ia. Se implementó vía webhook `admin-notif` desde el worker `diagnostico-api` (detalle técnico en `3gi-platform/CLAUDE.md`).

- **Diagnóstico de funnel (2026-06-16)**: de 57 visitas/semana a `/diagnostico/`, solo 14 solicitaron OTP en toda la historia desde abril, 5 lo validaron, y solo 2 completaron el informe. Se rastreó hasta el workflow n8n de envío de OTP, que mostraba cero ejecuciones registradas antes del 12 de junio aunque estaba "activo" desde el 25 de mayo — implica que prospectos reales de mayo probablemente nunca recibieron su correo OTP. SPF/DKIM/DMARC de `3gi.cl` se verificaron correctos (Zoho Mail Pro) — no es la causa raíz.

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

## Decisiones de posicionamiento validadas (no modificar)

- **Densidad de texto** = activo estratégico. Filtra prospectos y precalifica tickets USD 2.500–6.000. No simplificar.
- **Jerga técnica** (n8n, Supabase, OAuth2) = señal de credibilidad para tomadores de decisión informados. Mantener visible, no esconder en desplegables.
- **GTM duplicado** = hipótesis descartada. Astro es estático, no hay transiciones SPA.

## Oferta: fuente única, plantillas por idioma y guardia de contenido (2026-10-17)

**Dónde cambiar qué:**
- **Precios, plazos y condiciones** (Test ERA, Radar, Plan de Vuelo en 2 tramos, Data Foundation, Piloto Automático, ventana de 45 días, 10–20 % por hitos): SOLO en `src/data/oferta.mjs`. De ahí salen `/precios`, `/metodologia` (ES y EN) y `/llms.txt` (`src/pages/llms.txt.ts`, ya no existe `public/llms.txt`).
- **Textos** de `/precios` y `/metodologia`: `src/i18n/precios.mjs` y `src/i18n/metodologia.mjs` (`{ es, en }` por clave). Los precios y plazos van como `[[marcadores]]` (`radarDesde`, `pdvDesde`, `ventana`, `pct`, `testMin`, …; ver `tokens()` en `oferta.mjs`); un marcador desconocido rompe el build.
- **Estructura**: `src/components/pages/PreciosPage.astro` y `MetodologiaPage.astro` (una plantilla por página, prop `lang`); `src/pages/precios.astro`, `src/pages/en/precios.astro` y sus equivalentes de metodología son envoltorios de 10 líneas. **Ya no hay script de traducción en estas dos páginas**: lo que se ve es el HTML.
- Una página nueva con versión EN sigue el mismo patrón (plantilla + diccionario); no usar `data-i18n` ni tablas `T_*`.

**Guardia de contenido** (`src/integrations/guardia-contenido.mjs`, integración de Astro en `astro.config.mjs`; corre con cualquier comando de build, Cloudflare incluido): hace FALLAR el build si el HTML generado trae F1–F5, «Etapa», E1–E3, voseo/regionalismos (`acá`, `tenés`, …), segmento obsoleto (5–200, 10–200), duraciones obsoletas del Test ERA (15 min, 24–48 h, ~3 min), afirmaciones sin fuente (USD 30.000–100.000, «mínimo $50k»), nombres de producto con «Diagnóstico/Diagnosis» aplicados al Test ERA, «implementación incluida» en el Plan de Vuelo, o un monto USD que no esté en `oferta.mjs` (`montosPermitidos()`). Un monto nuevo se agrega ahí **con su origen**.
- **Excepción permanente y acotada (decisión de Gonzalo, 2026-10-17):** `/contenido` e `/inteligencia-organizacional` (ES y EN) pueden mencionar «las seis fases F0 a F5», porque así las llama el libro. El guardia solo permite esa mención (contexto «fases F0…»); cualquier otro código interno (F1–F5, E1–E3, «Etapa») sigue rechazado también en esas páginas. Está en `PERMITIDOS` de `src/integrations/guardia-contenido.mjs`.
- **Cifra de pérdidas definida por el dueño (sin fuente externa):** «pierde entre USD 30.000 y 100.000 anuales» en procesos automatizables, en el hero de la home y en el FAQ (ES y EN); declarada en `oferta.mjs` con su origen. Es una estimación de Gonzalo (2026-10-17), no un dato verificable: no presentarla como estadística de terceros.

**Estado (2026-10-17):** la home, `/faq`, `/precios`, `/metodologia`, `/casos` y `/nosotros` (ES y EN) usan plantilla única + diccionario (`src/components/pages/HomePage|FaqPage|PreciosPage|MetodologiaPage.astro`, `src/i18n/home|faq|precios|metodologia|casos|nosotros.mjs`), sin script de traducción. `Layout.astro` conserva en su tabla `T` solo las 11 claves de su propio menú y cookies, y sus JSON-LD usan marcadores `[[…]]` (`fill()`); `llms.txt` se genera. Cambiar un precio/plazo en `src/data/oferta.mjs` se propaga a todo el sitio (verificado: 0 archivos con el valor viejo). **Reglas de las plantillas:** (1) el CSS de cada plantilla va como `<style is:global>` con TODOS los selectores prefijados por la clase de la página (`.pg-home`, `.pg-faq`, `.pg-precios`, `.pg-met`, `.pg-casos`, `.pg-nos`), EXCEPTO `:root` (Astro no le aplica alcance; las variables CSS propias de la página, p. ej. `--blue` de casos, deben seguir globales) y el contenido envuelto en `<div class="pg-…" data-lang style="display:contents">`: el CSS con alcance de Astro NO aplica a lo insertado con `set:html` (se pierden negritas y resaltados) y `is:global` sin prefijo se filtra al menú y al pie; (2) las diferencias de diseño entre idiomas que traían las páginas originales se conservan con `lang === 'es'/'en'`, `<OptDiv on=…>` (contenedor opcional) y reglas `[data-lang="en"]`; (3) la cifra de pérdidas del hero y del FAQ («USD 30.000 y 100.000») es un literal SIN FUENTE externa, no usan marcadores (no confundir con el umbral de ROI de la Ejecución). **Migrar otra página** (ya no queda ninguna página con tabla de traducción propia; las demás no usan `data-i18n`): generar plantilla y diccionario con script, y comparar contra la línea base con DOM, texto, JSON-LD, title, estilos calculados elemento por elemento y píxeles (ES y EN, 1366 y 390 px); documentar cada diferencia. **Títulos EN:** el Test ERA nunca se llama «diagnosis» (el guardia lo rechaza, incluido «Free AI Diagnosis»); el título EN de la home es «Free ERA Test for SMBs · ERA 1 to ERA 3 · 3GI». **Verificado 2026-10-17:** ES idéntico en texto/DOM/JSON-LD/title (27 páginas); EN idéntico salvo correcciones: enlaces internos de la home con `/en/` (antes llevaban a páginas en español), H1 de metodología, badge «Most popular» y rayas en los precios. En ES el contenido insertado ahora muestra el énfasis (negritas/verde) que el diseño ya tenía en EN.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
