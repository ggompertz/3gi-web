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
  npx wrangler@latest pages deploy dist --project-name 3g-ia-agents --commit-dirty=true
```

> **Workaround 500 en upload:** si wrangler falla con `POST /pages/assets/upload -> 500` (CF error 1101), correr primero `python3 /root/3gi-web/docs/pre-upload.py` para pre-subir archivos uno a uno, luego wrangler normalmente. Causa: CF Worker crashea con PNGs grandes en batch JSON.

**SSH alias correcto:** `hetzner-3gi` (no `hetzner`) → `ssh -i ~/.ssh/hetzner_n8n root@178.156.157.141`

## Diseño homepage (index.astro) — decisiones tomadas

- **ERA framework grid**: en móvil ≤640px se oculta la tabla y se muestran `.era-mobile-cards` — 3 tarjetas apiladas (una por ERA) con filas dim/valor. La tabla desktop sigue intacta. NO volver a intentar scroll horizontal, no funciona.
- **Métricas "Resultado real"**: `metric-after` baja a 17px en ≤600px + `overflow-wrap: break-word` (palabras largas como "Automático"/"Recuperado")
- **"Empresas que movemos"**: `pq-grid` pasa a 1 columna en ≤480px para evitar truncado en "Manufactura"/"Construcción y Certif..."
- **"Por qué 3GI" founder card**: cargo ("Fundador y Director") aparece primero en verde uppercase, luego nombre — nunca al revés

## Pendientes (backlog priorizado)

**P1 — Lead magnet en quiz** (`/diagnostico`): al terminar las 5 preguntas, pedir email antes de mostrar resultado numérico. Enviar PDF personalizado vía webhook n8n. Alimenta base de leads automáticamente.

**P2 — Separar casos reales vs. proyectados** (`/casos`): arriba "Casos Reales Implementados" (Certificaciones, Distribuidora). Abajo sección rotulada "Casos de Uso de la Industria (Modelos Proyectados)" (Agrícola, Logística). Hoy están mezclados al mismo nivel visual → genera duda de credibilidad.

**~~P3 — i18n nativa Astro~~ ✅ COMPLETADO (commit 831eb8c, Mayo 2026):** Rutas `/en/` activas. 7 páginas EN en `src/pages/en/`. Layout.astro detecta idioma por URL. hreflang en todas las páginas. Flowchart visual en `/metodologia` (commit 50452b0).

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

## Decisiones de posicionamiento validadas (no modificar)

- **Densidad de texto** = activo estratégico. Filtra prospectos y precalifica tickets USD 2.500–6.000. No simplificar.
- **Jerga técnica** (n8n, Supabase, OAuth2) = señal de credibilidad para tomadores de decisión informados. Mantener visible, no esconder en desplegables.
- **GTM duplicado** = hipótesis descartada. Astro es estático, no hay transiciones SPA.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
