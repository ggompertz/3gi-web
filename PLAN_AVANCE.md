# Plan de Avance — Brand Refresh + Web Redesign + Test ERA
**Proyecto:** 3gi-web  
**Branch:** `feature/brand-refresh-test-era`  
**Inicio:** 2026-06-10  
**Metodología:** 3gi-sdd  

> **Instrucción para Claude:** Al iniciar una sesión nueva, leer este archivo PRIMERO.  
> Actualizar el estado de cada chunk al completarlo. No ejecutar chunks sin leer el estado actual.

---

## Estado general

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | Archivos de marca | ✅ Completado |
| Fase 2 | Rediseño web 3gi-web | ✅ Completado |
| Fase 3 | Test ERA redesign | ✅ Completado |
| Deploy | Merge a main + Cloudflare | ⬜ Pendiente |
| Report | Handoff a my-config | ⬜ Pendiente |

**Leyenda:** ⬜ Pendiente · 🔄 En progreso · ✅ Completado · ❌ Bloqueado

---

## Contexto de decisiones de diseño

> Leer antes de tocar cualquier archivo visual.

- **Color de acción:** `#F59E0B` (ámbar) — CTAs, métricas ROI, resultados destacados
- **Color de marca/logo:** `#00E891` (verde) — solo isotipo, ERA3, elementos de destino/logro
- **Fondo principal:** `#06060D` — sin cambio
- **Tipografía hero:** escala editorial `clamp(56px, 7vw, 96px)` — Syne 800
- **Regla ámbar vs verde:** ámbar = acción/ahora, verde = destino/ERA3
- **Motion:** instalar `motion` como npm dep antes del Chunk 3.4

---

## FASE 1 — Archivos de marca
*Archivos en Windows — NO requieren branch git*  
*Path: `C:\Users\ggomp\OneDrive - UC\Documentos_GGG\3GI\Branding\`*

| # | Chunk | Archivo | Cambio | Estado | Commit / Nota |
|---|---|---|---|---|---|
| 1.1 | Brand System HTML | `3G_Intelligence_Brand_System_new.html` | A: Amber → color de acción | ✅ | 2026-06-10 |
| 1.1 | Brand System HTML | `3G_Intelligence_Brand_System_new.html` | B: Formalizar modo claro (#F9F6F1) | ✅ | 2026-06-10 |
| 1.1 | Brand System HTML | `3G_Intelligence_Brand_System_new.html` | C: ERA Color System (cap. 09) | ✅ | 2026-06-10 |
| 1.1 | Brand System HTML | `3G_Intelligence_Brand_System_new.html` | D: Escala tipográfica editorial (cap. 06) | ✅ | 2026-06-10 |
| 1.2 | Manual Word | `Manual_Marca_3G_Intelligence_new.docx` | Generar `/tmp/brand-manual-cambios.md` | ✅ | 2026-06-10 |

---

## FASE 2 — Rediseño web 3gi-web
*Branch: `feature/brand-refresh-test-era`*

| # | Chunk | Archivo(s) | Descripción | Estado | Commit |
|---|---|---|---|---|---|
| 2.1 | Variables CSS | `src/layouts/Layout.astro` | Agregar `--amber-action`, `--amber-dark`, escala tipográfica | ⬜ | `chore: promover amber como color de acción en sistema de diseño` |
| 2.1 | Botones | `src/layouts/Layout.astro` | `.btn-primary` → ámbar | ⬜ | (mismo commit 2.1) |
| 2.2 | Hero | `src/pages/index.astro` | Headline XL, badge ámbar, CTAs ámbar, proof-nums ámbar | ⬜ | `feat: rediseñar hero con escala tipográfica editorial y CTAs ámbar` |
| 2.3 | Secciones | `src/pages/index.astro` | #dolor, #eras, #metodologia, #caso, #sectores, #ia-hoy, #cta-final | ⬜ | `feat: actualizar secciones de contenido con nueva paleta y escala` |
| 2.4 | Páginas internas ES | `precios/metodologia/casos/nosotros/faq.astro` | --text-l, CTAs ámbar | ⬜ | `feat: aplicar brand refresh en páginas internas` |
| 2.4 | Páginas internas EN | `en/*.astro` | Mismos cambios versión inglés | ⬜ | (mismo commit 2.4) |
| 2.5 | Responsive | todos | Probar 375px / 768px / 1280px, ajustar clamp() si se cortan títulos | ⬜ | `fix: ajustes responsive brand refresh` |

---

## FASE 3 — Test ERA: diseño + funcionalidades
*Branch: `feature/brand-refresh-test-era` (mismo)*

| # | Chunk | Archivo(s) | Descripción | Estado | Commit |
|---|---|---|---|---|---|
| 3.1 | Limpieza CSS | `src/pages/diagnostico.astro` | Eliminar variables duplicadas, usar vars del Layout | ⬜ | `chore: alinear variables CSS de diagnostico con sistema global` |
| 3.2 | Intro ERA journey | `src/pages/diagnostico.astro` | Cards ERA1(rojo)/ERA2(ámbar)/ERA3(verde) + botón ámbar | ⬜ | `feat: rediseñar intro del Test ERA con ERA journey visual` |
| 3.3 | Progreso por sección | `src/pages/diagnostico.astro` | "Operacional · Pregunta X de 5" / "Comercial · Pregunta X de 5" | ⬜ | `feat: mostrar dimensión activa en barra de progreso del quiz` |
| 3.4 | Motion install | `package.json` | `npm install motion` | ⬜ | — |
| 3.4 | Motion animaciones | `src/pages/diagnostico.astro` | Transición preguntas, reveal resultado, loading mensajes rotativos | ⬜ | `feat: animaciones Motion en transiciones del quiz` |
| 3.5 | Resultado rediseño | `src/pages/diagnostico.astro` | ERA Journey, barras de score, colores ERA coherentes con sistema | ⬜ | `feat: rediseñar pantalla de resultado con journey y score visual` |
| 3.6 | Share resultado | `src/pages/diagnostico.astro` | URL shareable + botón LinkedIn | ⬜ | `feat: agregar share de resultado por URL y LinkedIn` |

---

## Deploy

| # | Paso | Comando | Estado | Nota |
|---|---|---|---|---|
| D1 | Build local | `npm run build` | ⬜ | Debe completar sin errores |
| D2 | Push branch | `git push origin feature/brand-refresh-test-era` | ⬜ | — |
| D3 | Deploy a producción | `wrangler` desde Hetzner | ⬜ | Deploy vía wrangler, no Cloudflare Pages directo |
| D4 | Merge a main | `git checkout main && git merge feature/brand-refresh-test-era` | ⬜ | Solo tras D3 verificado |
| D5 | Push main | `git push origin main` | ⬜ | — |

---

## Report artifact

| # | Paso | Comando | Estado |
|---|---|---|---|
| R1 | Crear handoff | `Write /tmp/my-config/handoffs/2026-06-10_brand-refresh-test-era.md` | ⬜ |
| R2 | Commit my-config | `cd /tmp/my-config && git add handoffs/ && git commit -m "report: brand-refresh-test-era"` | ⬜ |
| R3 | Push my-config | `git push origin main` | ⬜ |

---

## Checklist final pre-merge

```
[ ] npm run build sin errores
[ ] TypeScript sin errores
[ ] Sin console.log de debug
[ ] Sin variables CSS duplicadas
[ ] Contraste ámbar/night pasa WCAG AA (ratio ~5.2:1 ✓)
[ ] Botones primarios: TODOS ámbar (no quedan verdes sueltos)
[ ] Verde solo en: logo, ERA3, estados de confirmación
[ ] Test ERA completo funciona: intro → 10 preguntas → resultado → share
[ ] Motion funciona Y quiz funciona sin Motion (graceful degradation)
[ ] ERA Journey muestra posición correcta para las 9 combinaciones posibles
[ ] Share URL abre resultado directamente en nueva pestaña
[ ] Mobile 375px: títulos no se cortan, botones full-width
[ ] Páginas EN actualizadas (no solo ES)
[ ] Brand System HTML guardado en Windows
[ ] Manual Word actualizado
```

---

## Notas de sesión

> Usar esta sección para registrar decisiones tomadas durante la implementación
> que no estaban en el plan original.

| Fecha | Nota |
|---|---|
| 2026-06-10 | Plan aprobado por el usuario. Listo para ejecutar. |
| 2026-06-10 | Deploy es vía `wrangler` desde Hetzner — no Cloudflare Pages directo. |
| 2026-06-10 | Fases 1 y 2 completadas. Iniciando Fase 3 (Test ERA). |
| | |

---

## Sesiones de trabajo

| Sesión | Fecha | Chunks completados | Próximo paso |
|---|---|---|---|
| 1 | — | — | Empezar por Fase 1, Chunk 1.1 |
| 2 | — | — | — |
| 3 | — | — | — |
| 4 | — | — | — |
