---
name: funnel-check
description: Smoke test del funnel /diagnostico (test ERA → solicitud OTP → informe IA) usando el MCP Playwright. Verifica que el endpoint de OTP responde antes de completar cambios o hacer deploy. No completa el flujo de OTP real (no hay bandeja de correo automatizada).
disable-model-invocation: true
---

# funnel-check

El funnel de `/diagnostico` tuvo un incidente real documentado: el workflow n8n de envío de OTP estaba
"activo" pero registró **cero ejecuciones durante semanas** — prospectos de mayo probablemente nunca
recibieron su correo. Este skill corre un smoke test manual antes de cada deploy relevante.

## Uso

`/funnel-check` (contra `http://localhost:4321` en dev, o pasar una URL: `/funnel-check https://3gi.cl`)

## Pasos (usa el MCP Playwright)

1. Navegar a `<base_url>/diagnostico`.
2. Completar las 5 preguntas del test ERA con respuestas de prueba (cualquier opción válida).
3. En la tarjeta de OTP, ingresar un email de prueba (ej. `funnel-check-test@3gi.cl`) y hacer submit.
4. Capturar la request de red a `/request-otp` (worker `diagnostico-api.3g-ia-agents.com`) y verificar:
   - Código de respuesta 200
   - Que la respuesta no tarde más de ~10s (timeout silencioso = mala señal)
5. **No** intentar completar el OTP real (requiere acceso a un correo real) — el smoke test termina aquí.
6. Si el paso 4 falla o da error/timeout, reportarlo como bloqueante: el funnel completo está roto para
   todo prospecto nuevo, no solo para el test.
7. Verificar visualmente (screenshot) que el copy de la tarjeta OTP no diga "Respondé 5 preguntas..."
   (el bug de copy corregido documentado en CLAUDE.md de 3gi-platform) — si reaparece, es regresión.

## Reporte de salida

Tabla con: paso, resultado (OK/FALLO), tiempo de respuesta si aplica. Si algo falla, indicar explícitamente
que se traduce en 0 leads convertidos hasta que se corrija — no minimizar el hallazgo.
