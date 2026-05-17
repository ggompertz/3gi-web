# Agente Personal 3GI — Diseño del sistema propio

**Versión:** v1.0 draft  
**Fecha:** 2026-05-17  
**Reemplaza:** OpenClaw (1.2 GB, inestable, no soporta voz)

---

## Por qué construir uno propio

OpenClaw tiene bugs estructurales irresolubles (proceso padre en D-state, WebSocket timeout, 2 procesos que colisionan). Además no soporta transcripción de voz entrante. Construir el sistema propio sobre infraestructura que ya existe (Hetzner + n8n + Claude API + Supabase) da control total, estabilidad y las capacidades que faltan.

---

## Capacidades objetivo

| Capacidad | Estado OpenClaw | Estado nuevo |
|---|---|---|
| Chat texto por Telegram | Inestable | ✅ Nativo |
| Voz entrante → transcripción | ❌ No existe | ✅ Whisper API |
| Respuesta en voz (TTS) | Plugin no probado | ✅ ElevenLabs o OpenAI |
| Acciones 3GI (pipeline, clientes) | Manual via n8n | ✅ Tools directas |
| Memoria entre sesiones | SQLite frágil | ✅ Supabase |
| Consultar Supabase directamente | ❌ No configurado | ✅ Tool nativa |
| Browser / scraping | ✅ Activo | ✅ Puppeteer/Playwright |
| Costo estimado | ~$5-15/mes (optimizado) | ~$3-8/mes |

---

## Lo que OpenClaw tiene para rescatar (conceptos, no código)

Revisando sus plugins, los más valiosos son:

| Plugin OpenClaw | Qué hace | Equivalente propio |
|---|---|---|
| `telegram` | Long polling + envío | `grammy.js` — más robusto |
| `memory-core` | Embeddings semánticos SQLite | Supabase `pgvector` (ya existe en proyecto) |
| `browser` | CDP + Playwright | Playwright directo |
| `deepgram` | Transcripción realtime | Whisper API (más barato, suficiente) |
| `elevenlabs` | TTS alta calidad | ElevenLabs API o OpenAI TTS |
| `openai` | Proveedor alternativo | Directo via Anthropic SDK |
| `tavily` / `exa` | Web search | Tavily API (simple) |
| `document-extract` | PDF/doc → texto | pdf-parse npm |
| `web-readability` | HTML → artículo limpio | @mozilla/readability |

**Conclusión:** los plugins de OpenClaw son wrappers sobre servicios estándar. No hay nada que no se pueda replicar directamente.

---

## Arquitectura

```
Telegram (@bot_3gi)
        ↓
  Grammy.js bot (Node.js · Puerto 3020 · PM2 3gi-assistant)
        ↓
  Router de mensajes
  ├── texto          → Claude Haiku (respuesta directa)
  ├── audio .ogg     → Whisper API → texto → Claude Haiku
  ├── video/foto     → Claude Sonnet (vision)
  └── /comando       → Tool executor
        ↓
  Claude API (Haiku por defecto · Sonnet si complejidad alta)
  + Tools:
    ├── query_supabase()     → clientes, pipeline 3GI
    ├── trigger_n8n()        → disparar workflows
    ├── call_agent()         → Pre-Scan, Scoring, Report
    ├── web_search()         → Tavily
    └── browser_screenshot() → Playwright
        ↓
  Respuesta (texto + opcional audio TTS)
        ↓
  Memoria: Supabase tabla `assistant_sessions`
```

---

## Stack técnico

| Componente | Tecnología | Por qué |
|---|---|---|
| Bot Telegram | `grammy.js` v1.x | Más estable que node-telegram-bot-api, TypeScript-first |
| Transcripción voz | OpenAI Whisper API | $0.006/min, sin setup local, calidad excelente |
| LLM principal | `claude-haiku-4-5` | Rápido y barato para conversación |
| LLM complejo | `claude-sonnet-4-6` | Análisis, código, documentos largos |
| TTS (voz salida) | OpenAI TTS o ElevenLabs | OpenAI: $15/1M chars · ElevenLabs: más natural |
| Memoria | Supabase (ya existe) | `assistant_sessions` + `assistant_memory` |
| Search web | Tavily API | $5/1000 búsquedas, simple de integrar |
| Runtime | Node.js ESModules | Consistente con stack 3GI |
| Proceso | PM2 (`3gi-assistant`) | Igual que todos los agentes 3GI |
| Puerto | 3020 | Libre en Hetzner |

---

## Estructura de archivos

```
/root/3gi-assistant/
├── index.js              # Entrada principal · inicia bot + gateway
├── bot/
│   ├── telegram.js       # Grammy bot · handlers texto/audio/video
│   └── router.js         # Decide Haiku vs Sonnet, transcribe si audio
├── agent/
│   ├── claude.js         # Anthropic SDK · tool use · streaming
│   ├── tools.js          # Definición de todas las tools
│   └── system-prompt.md  # Identidad del agente
├── tools/
│   ├── supabase.js       # query_supabase()
│   ├── n8n.js            # trigger_n8n()
│   ├── agents.js         # call_agent() → agentes 3GI
│   ├── search.js         # web_search() via Tavily
│   └── browser.js        # browser_screenshot() via Playwright
├── memory/
│   └── supabase.js       # Guardar/recuperar historial de sesión
├── voice/
│   ├── transcribe.js     # Audio → Whisper → texto
│   └── tts.js            # Texto → audio MP3
└── .env                  # Keys: ANTHROPIC, TELEGRAM, OPENAI, SUPABASE
```

---

## Tablas Supabase necesarias

```sql
-- Historial de conversaciones
CREATE TABLE assistant_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,           -- Telegram user ID
  role text NOT NULL,              -- 'user' | 'assistant'
  content text NOT NULL,
  tokens_used int,
  created_at timestamptz DEFAULT now()
);

-- Memoria semántica (largo plazo)
CREATE TABLE assistant_memory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  summary text NOT NULL,
  embedding vector(1536),          -- pgvector (ya instalado en AMCL)
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON assistant_memory USING ivfflat (embedding vector_cosine_ops);
```

---

## Variables de entorno

```bash
# Telegram
TELEGRAM_BOT_TOKEN=          # Del BotFather · @bot_3gi_assistant
TELEGRAM_ALLOWED_USERS=727800376   # Solo Gonzalo

# Anthropic (usar key de OpenClaw: ...aAAA, o crear una nueva)
ANTHROPIC_API_KEY=

# OpenAI (Whisper + TTS)
OPENAI_API_KEY=

# Supabase (proyecto 3GI: rfvhiuyqtfpqzjwpumav)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# n8n
N8N_URL=https://n8n.3g-ia-agents.com
N8N_API_KEY=

# Tavily (opcional)
TAVILY_API_KEY=

# ElevenLabs (opcional, alternativa a OpenAI TTS)
ELEVENLABS_API_KEY=
```

---

## Flujo de voz (detalle)

```
Usuario envía audio .ogg (Telegram)
        ↓
Grammy descarga el archivo
        ↓
POST https://api.openai.com/v1/audio/transcriptions
  model: whisper-1
  file: audio.ogg
  language: es
        ↓
Texto transcrito → Claude (con contexto de sesión)
        ↓
Respuesta Claude (texto)
        ↓
[Opcional] POST https://api.openai.com/v1/audio/speech
  model: tts-1
  voice: nova
  input: respuesta
        ↓
sendVoice() a Telegram (.mp3 → Telegram lo convierte)
```

**Costo voz:** ~$0.006/min transcripción + ~$0.015/1k chars TTS = negligible para uso personal

---

## Comandos disponibles (diseño inicial)

| Comando | Acción |
|---|---|
| `/estado` | Estado de todos los agentes 3GI + uptime |
| `/clientes` | Lista clientes activos y su ERA |
| `/pipeline [cliente]` | Estado del pipeline de un cliente |
| `/n8n [workflow]` | Ejecutar workflow de n8n |
| `/buscar [query]` | Web search con Tavily |
| `/memoria` | Ver resumen de memoria de sesión |
| `/limpiar` | Limpiar historial de sesión |

---

## Plan de desarrollo

| Fase | Tareas | Tiempo estimado |
|---|---|---|
| **1. Base** | Grammy bot + texto + Claude básico + memoria Supabase | 4h |
| **2. Voz** | Whisper transcripción + TTS respuesta | 2h |
| **3. Tools 3GI** | query_supabase + trigger_n8n + call_agent | 3h |
| **4. Search + Browser** | Tavily + Playwright screenshot | 2h |
| **5. PM2 + monitoring** | Deploy, logs, restart automático | 1h |

**Total: ~12h de desarrollo** (2-3 sesiones)

---

## Criterios de éxito

- Responde mensajes de texto en < 3 segundos
- Transcribe audio de voz en < 5 segundos
- No se cae solo (PM2 con autorestart)
- Usa key correcta (no contamina 3GI)
- Memoria persiste entre reinicios
- Puede consultar el estado del pipeline 3GI desde Telegram

---

*Documento generado: 2026-05-17*
