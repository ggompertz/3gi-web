# OpenClaw — Análisis de capacidades y estado actual

**Versión:** v2026.4.26  
**Modelo activo:** `anthropic/claude-sonnet-4-6`  
**Canal:** Telegram `@openclaw_3g_bot` (usuario aprobado: `@ggompertz`)  
**Servidor:** Hetzner `178.156.157.141`, proceso PM2 `openclaw-gateway`  
**Uptime:** Continuo desde May 14, 2026

---

## Qué es OpenClaw

Agente IA persistente, siempre encendido. A diferencia de una sesión de Claude Code, OpenClaw **vive en el servidor** y puede actuar de forma autónoma o responder mensajes de Telegram. Tiene acceso a herramientas reales: puede ejecutar workflows, consultar APIs, operar repos de GitHub y controlar un browser.

---

## Capacidades disponibles

### ✅ Activas y funcionando

| Capacidad | Detalle |
|---|---|
| **Chat por Telegram** | Recibe y responde mensajes en `@openclaw_3g_bot`. Solo el usuario `727800376` (@ggompertz) está aprobado. |
| **n8n** | Puede listar, disparar y monitorear workflows en `https://n8n.3g-ia-agents.com/`. API Key configurada. |
| **GitHub** | Token PAT activo. Puede ver PRs, commits, estado de repos `ggompertz/*`, crear issues, hacer merge. |
| **Browser (automatización)** | Plugin `browser` activo. Puede abrir páginas, hacer scraping, rellenar formularios, tomar screenshots. |
| **OpenRouter** | Fallback a múltiples modelos (Kimi K2, GPT-5, etc.) si Anthropic falla o para tareas que no requieren Sonnet. |
| **Memoria de sesión** | Historial de conversaciones guardado en SQLite. Persiste entre reinicios. |
| **Voz (talk-voice)** | Plugin cargado. No probado en producción. |
| **Phone-control** | Plugin cargado. No probado en producción. |

### ❌ Desactivados actualmente

| Capacidad | Por qué está desactivado | Valor potencial |
|---|---|---|
| **Memory-core** | Deshabilitado en `openclaw.json` | Alto — permite memoria semántica larga sin cargar toda la sesión. Reduce tokens drásticamente. |
| **Compactación de sesión** | No configurada | Alto — sin esto el historial crece indefinidamente y cada turno carga más contexto. |
| **Supabase directo** | No configurado como tool | Medio — permitiría consultar pipeline 3GI, clientes, alertas sin pasar por n8n. |
| **Acceso a agentes 3GI** | No configurado | Alto — podría disparar Pre-Scan, Scoring, Report directamente desde Telegram. |

---

## Qué puede hacer por 3GI hoy

### Desde Telegram (sin configuración adicional):
- "¿Qué workflows de n8n están activos?" → lista workflows
- "Ejecuta el workflow X de n8n" → dispara ejecución
- "Dame el estado del repo 3gi-platform" → consulta GitHub
- "¿Hubo errores recientes en los repos?" → revisa commits/issues
- "Abre esta URL y dime qué hay" → usa el browser

### Con configuración adicional (próximos pasos):
- "¿En qué etapa está el cliente Y?" → consulta Supabase directamente
- "Genera un pre-scan para empresa Z" → llama al agente Pre-Scan de 3GI
- "Muéstrame los clientes estancados" → consulta `/api/alertas` del Orchestrador
- "Revisa si todos los agentes están online" → llama `/health` de cada agente

---

## Arquitectura técnica

```
Telegram → @openclaw_3g_bot
               ↓
        OpenClaw Gateway (Puerto 18789, Hetzner)
               ↓
     anthropic/claude-sonnet-4-6
               ↓
    ┌──────────┬──────────┬──────────┐
    n8n        GitHub     Browser    ...
```

**Archivos clave:**
| Archivo | Contenido |
|---|---|
| `/home/openclaw/.openclaw/openclaw.json` | Config principal: modelo, plugins, heartbeat, compactación |
| `/home/openclaw/.openclaw/agents/main/agent/system-prompt.md` | Identidad y contexto del agente (~1.3 KB) |
| `/home/openclaw/.openclaw/agents/main/agent/env.json` | Variables de entorno: N8N_API_KEY, GITHUB_TOKEN, OPENROUTER_API_KEY |
| `/home/openclaw/.openclaw/memory/main.sqlite` | Memoria semántica (104 KB, actualmente sin usar) |
| `/home/openclaw/.openclaw/agents/main/sessions/` | Historial de conversaciones (52 MB acumulado) |

---

## Problema actual: gasto excesivo de tokens

**Causa:** El heartbeat (ping de salud cada 30 min) carga ~55,000 tokens de contexto en cada ejecución, aunque no haya ningún mensaje que procesar.

**Impacto estimado:**
- 48 heartbeats/día × 55k tokens cache write = 2.6M tokens/día
- Solo en heartbeats vacíos: **~$9.75 USD/día → ~$300 USD/mes**

**Origen del problema:**
1. `HEARTBEAT.md` en el workspace es un archivo grande que OpenClaw lee en cada ping
2. La sesión activa (`faf2e392...jsonl`) lleva 373 KB de historial sin compactar — carga completa en cada turno
3. Memory-core desactivado → no hay resumen semántico, carga todo el raw
4. Cache write sin reutilización efectiva del turno anterior

---

## Plan de optimización aprobado

| # | Cambio | Ahorro estimado | Estado |
|---|---|---|---|
| 1 | **Heartbeat: 1x/día** (de 48x/día a 1x/día) | ~98% del gasto en heartbeats | Pendiente |
| 2 | **Activar compactación** de sesión | Evita crecimiento infinito del contexto | Pendiente |
| 3 | **Activar memory-core** (memoria semántica) | Contexto por turno: 55k → ~3k tokens | Pendiente |
| 4 | **Haiku para tareas simples** vía OpenRouter | ~94% ahorro en consultas de status/pipeline | Pendiente |

Aplicar estas 4 optimizaciones reduce el costo estimado de ~$300/mes a **menos de $5/mes** para uso conversacional normal.

---

## Modelos disponibles via OpenRouter (sin costo adicional de setup)

OpenClaw ya tiene OpenRouter configurado. Modelos disponibles para enrutamiento por complejidad:

| Modelo | Uso recomendado |
|---|---|
| `claude-haiku-4-5` | Consultas simples, status, pipeline |
| `claude-sonnet-4-6` | Razonamiento, código, análisis |
| `kimi-k2` (262k ctx) | Documentos largos, contexto amplio |
| `deepseek-r1` | Razonamiento matemático/lógico |

---

*Documento generado: 2026-05-16*
