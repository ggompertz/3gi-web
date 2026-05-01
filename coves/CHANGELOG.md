# COVES S11 — Changelog de cambios

Registro de todos los cambios al sistema de vigilancia.
Formato: fecha · qué cambió · por qué · resultado esperado

---

## 2026-04-30

### coves_detect.js — CAPRICCIO ch3
**Cambio:**  20s → 90s ·  normal → especial  
**Por qué:** Ch3 mira intersección de 2 calles. Generó 10 falsas alertas el 29/04 y 3 el 30/04.
Umbral de 20s demasiado bajo — autos detenidos en luz roja duran 30-60s y pasan el filtro.
Cooldown de 30 min no alcanzó a frenar (tráfico continuo).  
**Resultado esperado:** Solo detectar personas estacionadas >90s en la intersección.  
**Estado:** aplicado


---

## 2026-05-01

### REINGENIERÍA — Clasificación IA de incivilidades

**Cambio:** Agregada capa de clasificación IA (Claude Haiku 4.5 vision) entre los filtros de imagen y el envío a Telegram. Nuevo archivo: . Modificados: , .

**Por qué:** El sistema detectaba presencia (movimiento), no incivilidades. Generaba 116 detecciones por noche sin forma de distinguir amenazas reales de vehículos en tránsito o sombras. El reporte era un inventario de ruido, no un análisis accionable.

**Qué hace ahora:**
- Cada evento que pasa los filtros de imagen es clasificado por IA: 
- Router: nivel_riesgo=alto/medio → Telegram con descripción IA (🔴/🟡). Bajo/falso → solo BD, sin Telegram.
- Fallback seguro: si IA falla (null), el evento se envía a Telegram como siempre (no se pierden alertas).
- Reporte nocturno Parte 2 rediseñado: secciones 🔴 INCIDENTES / 🟡 SOSPECHOSO / ⚪ RUIDO / ❓ SIN CLASIFICAR.

**Supabase — columnas nuevas en coves_alertas_realtime:**
, , , , , , 

**Modelos usados:**
- Clasificación por evento: claude-haiku-4-5-20251001 (~/usr/bin/bash.0002/evento, ~/usr/bin/bash.72/mes)
- Resumen diario: claude-haiku-4-5-20251001 (sin cambio)

**Bugs corregidos en este deploy:**
-  requiere  en v0.37 — corregido
- Cooldown se seteaba antes de confirmar envío Telegram — corregido (alerta no se perdía pero canal podía quedar bloqueado)
- Parsing de .env con  en valores (JWT) truncaba el token — corregido
-  no estaba protegido contra array vacío — corregido
-  faltaba en select de Supabase en reporte_noche.py — corregido

**Resultado esperado:** Alertas Telegram solo para presencia sospechosa real. Reporte muestra incidentes confirmados separados del ruido.

**Backups:** /root/coves_detect.js.bak.20260501, /root/reporte_noche.py.bak.20260501

---

## 2026-05-01

### REINGENIERIA — Clasificacion IA de incivilidades

**Cambio:** Agregada capa de clasificacion IA (Claude Haiku 4.5 vision) entre los filtros de imagen y el envio a Telegram. Nuevo archivo: coves_classifier.js. Modificados: coves_detect.js, reporte_noche.py.

**Por que:** El sistema detectaba presencia (movimiento), no incivilidades. Generaba ~116 detecciones por noche sin forma de distinguir amenazas de vehiculos en transito o sombras.

**Que hace ahora:**
- Cada evento que pasa los filtros de imagen es clasificado por IA: es_persona, tipo_objeto, conducta, nivel_riesgo, descripcion_ia
- Router: nivel_riesgo=alto/medio -> Telegram con descripcion IA (rojo/amarillo). Bajo/falso -> solo BD.
- Fallback: si IA falla (null), el evento se envia a Telegram como siempre (no se pierden alertas).
- Reporte Parte 2 rediseñado: INCIDENTES / SOSPECHOSO / RUIDO / SIN CLASIFICAR.

**Supabase — columnas nuevas en coves_alertas_realtime:**
es_persona, tipo_objeto, conducta, nivel_riesgo, descripcion_ia, frame_path, feedback

**Modelos:** claude-haiku-4-5-20251001 (~$0.72/mes estimado)

**Bugs corregidos:**
- SDK 0.37 requiere .default en require — corregido
- Cooldown se seteaba antes de confirmar Telegram — corregido
- Parsing .env truncaba JWT por el = — corregido
- Array vacio en frames no estaba protegido — corregido
- fecha faltaba en select Supabase del reporte — corregido

**Backups:** /root/coves_detect.js.bak.20260501, /root/reporte_noche.py.bak.20260501
