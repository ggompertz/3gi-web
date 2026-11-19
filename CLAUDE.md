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

## Decisiones de posicionamiento validadas (no modificar)

- **Densidad de texto** = activo estratégico. Filtra prospectos y precalifica tickets USD 2.500–6.000. No simplificar.
- **Jerga técnica** (n8n, Supabase, OAuth2) = señal de credibilidad para tomadores de decisión informados. Mantener visible, no esconder en desplegables.
- **GTM duplicado** = hipótesis descartada. Astro es estático, no hay transiciones SPA.

## Reglas por módulo (CLAUDE.md por carpeta, se cargan solo al trabajar allí)

| Carpeta | De qué trata |
|---|---|
| `src/i18n/CLAUDE.md` | Textos ES/EN: una plantilla por página, nada de `data-i18n`, glosario de marca |
| `src/integrations/CLAUDE.md` | Guardias del build: idioma, contenido y «diagnóstico», con sus excepciones |
| `src/data/CLAUDE.md` | `oferta.mjs` como fuente única, nomenclatura pública, precios y segmento |
| `src/components/pages/CLAUDE.md` | Reglas de las plantillas de página y diseño de la portada |
| `src/layouts/CLAUDE.md` | `Layout.astro`: PostHog, LinkedIn Insight, banner de cookies y `funnel-track.js` (embudo en dos niveles, UTM sin consentimiento) |
| `docs/claude-md/test-era.md` | Test ERA: escala, errores de `/analizar` y servicio de OTP (en `docs/` porque un `.md` en `src/pages/` o `public/` se publicaría) |
| `docs/claude-md/historial.md` | Backlog antiguo e incidentes ya resueltos |

Reglas que valen en todo el repo: nomenclatura pública (Test ERA, Radar, Plan de Vuelo, Piloto Automático; nunca F1 a F5 ni «Etapa»), ERA en mayúsculas, español neutro con «tú», y el Test ERA nunca se llama «diagnóstico».

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Reversión (comprobada en seco el 2026-11-03)

Comprobada en seco el 2026-11-03: se verificó que el camino existe, sin ejecutar ningún rollback. Volver atrás en producción lo autoriza Gonzalo. Reglas y límites comunes en `my-config/standards/reversion.md`.

- **Sitio (Cloudflare Pages):** el despliegue es automático al hacer push a `master`, así que la vía documentada es `git revert -m 1 <sha-de-la-fusión>` y push (redespliega en unos 2 minutos). Existe también *Rollback* en el panel de Cloudflare Pages, *Deployments*. **No comprobado**: solo se verificó el camino por Git.
- **Copia del servidor:** `/root/3gi-web` se actualiza con `git pull origin master`. Si se usó, volver con `git checkout <sha-anterior>` en esa carpeta.
- **Después:** comprobar la página y los eventos del embudo (`funnel-track.js`) con un clic real.
