#!/usr/bin/env python3
"""
reporte_noche.py — COVES S11
Genera reporte diario en 2 partes y lo envía a Telegram.
Fuente de verdad: Supabase coves_alertas_realtime (alertas reales enviadas)
FTP: solo para verificar estado online/offline de DVRs y canales
"""
import os, glob, json
from datetime import datetime, timedelta
import urllib.request, urllib.parse
import anthropic

def load_env():
    env_file = "/root/.env.coves"
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    key, val = line.split("=", 1)
                    os.environ[key] = val

load_env()

BOT_TOKEN          = os.environ.get("BOT_TOKEN", "8661269510:AAE4E-jJXnS-0uvmGFlCozKwiHh-1aezr_I")
CHAT_ID            = os.environ.get("CHAT_ID", "-1003772633622")
SUPABASE_URL       = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY       = os.environ.get("SUPABASE_SERVICE_ROLE", "")
ANTHROPIC_API_KEY  = os.environ.get("ANTHROPIC_API_KEY", "")
BASEDIR            = "/home/ftpcoves/imagenes"

# DVRs y canales esperados
CONFIG = {
    "DVR-PABLO":            {"label": "DVR-PABLO",      "channels": {2:"corto", 3:"normal", 4:"largo", 5:"especial", 8:"normal"}},
    "10ymedioN":            {"label": "10 1/2 Norte",   "channels": {1:"corto", 2:"especial", 3:"largo"}},
    "COVES-CHICKEN":        {"label": "COVES-CHICKEN",  "channels": {1:"corto", 2:"largo", 3:"corto", 4:"normal"}},
    "11N_ROSA":             {"label": "EDITH",          "channels": {1:"corto", 2:"largo", 3:"normal", 4:"corto"}},
    "4 ORIENTE RODRIGUEZ":  {"label": "TALLER",         "channels": {1:"normal", 2:"largo", 3:"normal"}},
    "WAIMEA 11 NORTE":      {"label": "WAIMEA",         "channels": {1:"especial", 2:"corto", 3:"largo"}},
    "COVES-11 NORTE 832":   {"label": "11N_Rosa",       "channels": {1:"especial", 2:"largo", 3:"normal"}},
    "Cafe cielo":           {"label": "CIELO",          "channels": {1:"largo", 2:"largo"}},
    "13 norte Capriccio":   {"label": "CAPRICCIO",      "channels": {1:"largo", 2:"especial", 3:"especial"}},
    "condominio11":         {"label": "COND.11",        "channels": {1:"corto", 2:"largo", 3:"especial"}},
    "Don Mario":            {"label": "Don Mario",      "channels": {1:"largo", 2:"especial"}},
    "TOBAR":                {"label": "TOBAR",          "channels": {1:"especial", 2:"corto", 3:"normal", 4:"largo"}},
}

def send_telegram(msg):
    if len(msg) > 4096:
        msg = msg[:4000] + "\n\n⚠️ [mensaje cortado por límite Telegram]"
    data = urllib.parse.urlencode({"chat_id": CHAT_ID, "text": msg}).encode()
    req = urllib.request.Request(
        "https://api.telegram.org/bot%s/sendMessage" % BOT_TOKEN, data=data
    )
    try:
        urllib.request.urlopen(req)
    except Exception as e:
        print("ERROR Telegram: %s" % e)

def fetch_supabase(endpoint, params=""):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []
    url = "%s/rest/v1/%s%s" % (SUPABASE_URL, endpoint, ("?" + params) if params else "")
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer %s" % SUPABASE_KEY,
        "apikey": SUPABASE_KEY
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print("ERROR Supabase: %s" % e)
        return []

def insertar_resumen(fecha_str, total_alertas, total_casi, dvrs_activos, resumen_ia, datos_canales):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer %s" % SUPABASE_KEY,
        "apikey": SUPABASE_KEY
    }
    # Detalle por canal
    for d in datos_canales:
        req = urllib.request.Request(
            "%s/rest/v1/coves_noches" % SUPABASE_URL,
            data=json.dumps(d).encode(),
            headers=headers, method="POST"
        )
        try: urllib.request.urlopen(req, timeout=10)
        except: pass
    # Resumen noche
    req = urllib.request.Request(
        "%s/rest/v1/coves_resumen_noche" % SUPABASE_URL,
        data=json.dumps({
            "fecha": fecha_str,
            "dvrs_activos": dvrs_activos,
            "dvrs_total": len(CONFIG),
            "total_alertas": total_alertas,
            "total_casi": total_casi,
            "resumen_ia": resumen_ia
        }).encode(),
        headers=headers, method="POST"
    )
    try: urllib.request.urlopen(req, timeout=10)
    except: pass

# ── Fechas de la noche (ayer 20:00 → hoy 07:00) ───────────────────────────────
hoy = datetime.now().strftime("%Y-%m-%d")
ayer = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

# ── Obtener alertas reales de Supabase (con nuevos campos IA) ──────────────────
# Incluir nuevos campos: nivel_riesgo, conducta, descripcion_ia, es_persona
alertas_raw = fetch_supabase(
    "coves_alertas_realtime",
    "fecha=in.(%s,%s)&select=fecha,hora_chile,dvr_nombre,dvr_label,canal,grupo,duracion_seg,tipo,nivel_riesgo,conducta,descripcion_ia,es_persona&order=hora_chile.asc" % (ayer, hoy)
)

# Filtrar solo horario nocturno: ayer >= 20:00 y hoy <= 07:00
alertas = []
for a in alertas_raw:
    hora = a.get("hora_chile", "00:00")
    fecha = a.get("fecha", hoy)
    if fecha == ayer and hora >= "20:00":
        alertas.append(a)
    elif fecha == hoy and hora <= "07:00":
        alertas.append(a)

# Agrupar por dvr_label + canal
from collections import defaultdict
por_canal = defaultdict(list)
for a in alertas:
    key = (a["dvr_label"], a["canal"])
    por_canal[key].append(a)

# "alerta" = lo que llegó a Telegram: nivel_riesgo alto/medio+persona, o fallback (null)
def fue_enviado_telegram(a):
    nr = a.get("nivel_riesgo")
    ep = a.get("es_persona")
    return nr is None or (ep and nr in ("alto", "medio"))

total_alertas = len([a for a in alertas if fue_enviado_telegram(a)])
total_detecciones = len([a for a in alertas if not fue_enviado_telegram(a)])
total_enviadas = len(alertas)

# ── Estado de DVRs via FTP ────────────────────────────────────────────────────
dvrs_online = 0
dvrs_total = len(CONFIG)
estado_dvrs = {}

for dvr, cfg in CONFIG.items():
    label = cfg["label"]
    ch_status = {}
    for ch in cfg["channels"]:
        t_files = glob.glob("%s/**/%s*_ch%d_*_T.jpg" % (BASEDIR, dvr, ch), recursive=True)
        e_files = glob.glob("%s/**/%s*_ch%d_*_E.jpg" % (BASEDIR, dvr, ch), recursive=True)
        if t_files or e_files:
            ch_status[ch] = "online"
        else:
            ch_status[ch] = "offline"
    online_count = sum(1 for s in ch_status.values() if s == "online")
    if online_count > 0:
        dvrs_online += 1
    estado_dvrs[dvr] = {"label": label, "channels": ch_status, "online": online_count > 0}

# ── PARTE 1: Estado del sistema ───────────────────────────────────────────────
lines1 = [
    "📊 Reporte noche %s (1/2)" % datetime.now().strftime("%d/%m/%Y"),
    "📡 DVRs: %d/%d online | 🚨 %d alertas | 🔔 %d detecciones" % (
        dvrs_online, dvrs_total, total_alertas, total_detecciones),
    ""
]

for dvr, info in estado_dvrs.items():
    label = info["label"]
    ch_status = info["channels"]
    online_chs = [ch for ch, s in ch_status.items() if s == "online"]
    offline_chs = [ch for ch, s in ch_status.items() if s == "offline"]

    if not online_chs:
        lines1.append("📵 %s: sin imágenes FTP" % label)
        continue

    ch_parts = []
    for ch in sorted(ch_status.keys()):
        alertas_ch = por_canal.get((label, ch), [])
        n = len(alertas_ch)
        tipos = set(a["tipo"] for a in alertas_ch)
        if ch_status[ch] == "offline":
            ch_parts.append("ch%d📵" % ch)
        elif n > 0 and any(fue_enviado_telegram(a) for a in alertas_ch):
            tg_events = [a for a in alertas_ch if fue_enviado_telegram(a)]
            hora_pico = min(a["hora_chile"] for a in tg_events)
            ch_parts.append("ch%d🚨×%d(%s)" % (ch, n, hora_pico))
        elif n > 0:
            hora_pico = min(a["hora_chile"] for a in alertas_ch)
            ch_parts.append("ch%d🔔×%d(%s)" % (ch, n, hora_pico))
        else:
            ch_parts.append("ch%d✅" % ch)

    lines1.append("%s: %s" % (label, "  ".join(ch_parts)))

lines1.append("")
lines1.append("📖 🚨alerta | 🔔detección | ✅sin actividad | 📵sin imágenes FTP")

# ── PARTE 2: Agrupación por nivel_riesgo (MODIFICADA) ──────────────────────────
# Agrupar por nivel_riesgo
incidentes   = [a for a in alertas if a.get('nivel_riesgo') == 'alto']
sospechosos  = [a for a in alertas if a.get('nivel_riesgo') == 'medio']
ruido        = [a for a in alertas if a.get('nivel_riesgo') in ('bajo', 'falso')]
sin_clasif   = [a for a in alertas if not a.get('nivel_riesgo')]

# Agrupar ruido por dvr+canal para compactar
ruido_por_canal = defaultdict(list)
for a in ruido:
    key = (a["dvr_label"], a["canal"])
    ruido_por_canal[key].append(a)

# Agrupar sin_clasificar por dvr+canal
sin_clasif_por_canal = defaultdict(list)
for a in sin_clasif:
    key = (a["dvr_label"], a["canal"])
    sin_clasif_por_canal[key].append(a)

lines2 = [
    "📊 Reporte noche %s (2/2)" % datetime.now().strftime("%d/%m/%Y"),
    "🔴 %d incidentes | 🟡 %d sospechosos | ⚪ %d ruido/tránsito | ❓ %d sin clasificar" % (
        len(incidentes), len(sospechosos), len(ruido), len(sin_clasif)),
    ""
]

# 🔴 INCIDENTES (alto riesgo)
if incidentes:
    lines2.append("🔴 INCIDENTES (alto riesgo):")
    for a in incidentes:
        desc = a.get('descripcion_ia') or a.get('conducta') or 'Incidente'
        lines2.append("  %s ch%d · %s · %s" % (a["dvr_label"], a["canal"], a["hora_chile"], desc))
else:
    lines2.append("🔴 INCIDENTES (alto riesgo):")
    lines2.append("  Sin incidentes confirmados")

lines2.append("")

# 🟡 PRESENCIA SOSPECHOSA (nivel_riesgo = 'medio')
if sospechosos:
    lines2.append("🟡 PRESENCIA SOSPECHOSA:")
    for a in sospechosos:
        desc = a.get('descripcion_ia') or a.get('conducta') or 'Presencia'
        lines2.append("  %s ch%d · %s · %s" % (a["dvr_label"], a["canal"], a["hora_chile"], desc))
else:
    lines2.append("🟡 PRESENCIA SOSPECHOSA:")
    lines2.append("  Sin presencia sospechosa")

lines2.append("")

# ⚪ RUIDO / TRÁNSITO (no enviado a Telegram)
lines2.append("⚪ RUIDO / TRÁNSITO (no enviado a Telegram): %d eventos" % len(ruido))
if ruido_por_canal:
    for (label, ch), items in sorted(ruido_por_canal.items()):
        hora_pico = min(a["hora_chile"] for a in items)
        lines2.append("  %s ch%d · %d eventos (pico %s)" % (label, ch, len(items), hora_pico))

lines2.append("")

# ❓ Sin clasificar
lines2.append("❓ Sin clasificar: %d eventos" % len(sin_clasif))
if sin_clasif_por_canal:
    for (label, ch), items in sorted(sin_clasif_por_canal.items()):
        hora_pico = min(a["hora_chile"] for a in items)
        lines2.append("  %s ch%d · %d eventos (pico %s)" % (label, ch, len(items), hora_pico))

lines2.append("")

# 🤖 Resumen IA (con contexto de nuevas clasificaciones)
resumen_ia = ""
try:
    detalle_incidentes = ["%s ch%d %s" % (a['dvr_label'], a['canal'], a.get('descripcion_ia', ''))
                          for a in incidentes]

    datos_resumen = {
        "fecha": datetime.now().strftime("%d/%m/%Y"),
        "dvrs_online": dvrs_online,
        "dvrs_total": dvrs_total,
        "incidentes_alto_riesgo": len(incidentes),
        "presencia_sospechosa": len(sospechosos),
        "ruido_filtrado": len(ruido),
        "sin_clasificar": len(sin_clasif),
        "detalle_incidentes": detalle_incidentes,
        "dvrs_offline": [info["label"] for dvr, info in estado_dvrs.items() if not info["online"]]
    }
    prompt = """Eres el asistente de un sistema de vigilancia nocturna con cámaras de seguridad.
Analiza este reporte con clasificaciones IA y genera un resumen en español, directo y claro, de 2-3 oraciones.
Menciona: si hubo incidentes de ALTO RIESGO confirmados (presencia sospechosa), DVRs offline, y evaluación general.
Usa lenguaje concreto basado en los datos de clasificación IA.
Sin markdown, negritas, asteriscos ni emojis. Solo texto plano.

Datos:
""" + json.dumps(datos_resumen, ensure_ascii=False, indent=2)

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=250,
        messages=[{"role": "user", "content": prompt}]
    )
    resumen_ia = response.content[0].text.strip()
    lines2.append("🤖 Resumen: " + resumen_ia)
except Exception as e:
    lines2.append("🤖 Resumen no disponible (%s)" % str(e)[:50])

# ── Guardar y enviar ──────────────────────────────────────────────────────────
os.makedirs("/root/reportes", exist_ok=True)
with open("/root/reportes/reporte_%s.txt" % hoy, "w") as f:
    f.write("\n".join(lines1) + "\n\n" + "\n".join(lines2))

# Datos por canal para Supabase (sin cambios en esta función)
datos_canales = []
for dvr, cfg in CONFIG.items():
    label = estado_dvrs[dvr]["label"]
    for ch, grupo in cfg["channels"].items():
        alertas_ch = por_canal.get((label, ch), [])
        ch_estado = estado_dvrs[dvr]["channels"].get(ch, "offline")
        if ch_estado == "offline":
            estado = "offline"
        elif not alertas_ch:
            estado = "quieto"
        elif any(a["tipo"] == "alerta" for a in alertas_ch):
            estado = "alerta"
        else:
            estado = "deteccion"
        max_dur = max((a["duracion_seg"] for a in alertas_ch), default=0)
        hora_pico = min((a["hora_chile"] for a in alertas_ch), default=None)
        datos_canales.append({
            "fecha": hoy,
            "dvr_nombre": dvr,
            "dvr_label": label,
            "canal": ch,
            "grupo": grupo,
            "estado": estado,
            "num_eventos": len(alertas_ch),
            "max_duracion_seg": max_dur,
            "hora_pico": hora_pico,
        })

insertar_resumen(hoy, total_alertas, total_detecciones, dvrs_online, resumen_ia, datos_canales)

send_telegram("\n".join(lines1))
send_telegram("\n".join(lines2))
print("Reporte enviado: %d alertas, %d detecciones | %d incidentes, %d sospechosos" % (
    total_alertas, total_detecciones, len(incidentes), len(sospechosos)))
