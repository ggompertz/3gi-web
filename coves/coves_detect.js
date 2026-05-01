const { execSync } = require('child_process');
const fs = require('fs');
const classifier = require('./coves_classifier');

// ── Horario Chile ─────────────────────────────────────────────────────────────
const now = new Date();
const fmtCL = new Intl.DateTimeFormat('es-CL', {
  hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'America/Santiago'
});
const parts = fmtCL.formatToParts(now);
const hourCL   = parseInt(parts.find(p => p.type === 'hour').value);
const minuteCL = parseInt(parts.find(p => p.type === 'minute').value);
const timeCL   = hourCL * 60 + minuteCL;

// ── Rangos horarios configurables ─────────────────────────────────────────────
// Ambos rangos usan filtros de imagen. Diferencia: umbrales más sensibles de madrugada.
// minDurMult: multiplica minDur del canal (0.8 = 20% más sensible)
const RANGOS = [
  {
    nombre: 'alerta',
    activo: (t) => t >= 20*60,           // 20:00–23:59
    emoji: '🚨',
    label: 'Alerta de presencia',
    tipo: 'alerta',
    umbrales: { minDurMult: 1.0, maxConsec: 3, maxSpan: 5, minBg: 15 }
  },
  {
    nombre: 'deteccion',
    activo: (t) => t < 5*60+30,          // 00:00–05:29
    emoji: '🔔',
    label: 'Detección de presencia',
    tipo: 'deteccion',
    umbrales: { minDurMult: 0.8, maxConsec: 4, maxSpan: 6, minBg: 12 }
  },
  {
    nombre: 'alerta',
    activo: (t) => t >= 5*60+30 && t <= 7*60,  // 05:30–07:00
    emoji: '🚨',
    label: 'Alerta de presencia',
    tipo: 'alerta',
    umbrales: { minDurMult: 1.0, maxConsec: 3, maxSpan: 5, minBg: 15 }
  }
];

const rango = RANGOS.find(r => r.activo(timeCL));
if (!rango) process.exit(0);

// ── Configuración Telegram ────────────────────────────────────────────────────
const BOT_TOKEN = '8661269510:AAE4E-jJXnS-0uvmGFlCozKwiHh-1aezr_I';
const CHAT_ID   = '-1003772633622';

// ── Supabase ──────────────────────────────────────────────────────────────────
let SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE = '';
try {
  const env = fs.readFileSync('/root/.env.coves', 'utf8');
  for (const line of env.split('\n')) {
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const k = line.slice(0, eqIdx).trim();
    const v = line.slice(eqIdx + 1).trim();
    if (k === 'SUPABASE_URL') SUPABASE_URL = v;
    if (k === 'SUPABASE_SERVICE_ROLE') SUPABASE_SERVICE_ROLE = v;
  }
} catch(e) {}

async function registrarSupabase(dvrKey, dvrLabel, ch, grupo, duracion, tipo, cls) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) return;
  const horaChile = `${String(hourCL).padStart(2,'0')}:${String(minuteCL).padStart(2,'0')}`;
  const fecha = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
  const body = JSON.stringify({
    fecha, hora_chile: horaChile,
    dvr_nombre: dvrKey, dvr_label: dvrLabel,
    canal: parseInt(ch), grupo, duracion_seg: Math.round(duracion), tipo,
    ...(cls && {
      es_persona: cls.es_persona,
      tipo_objeto: cls.tipo_objeto,
      conducta: cls.conducta,
      nivel_riesgo: cls.nivel_riesgo,
      descripcion_ia: cls.descripcion_ia,
      frame_path: cls.frame_path
    })
  });
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/coves_alertas_realtime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'apikey': SUPABASE_SERVICE_ROLE
      },
      body
    });
  } catch(e) {}
}

// ── DVRs y canales ────────────────────────────────────────────────────────────
const DVRS = {
  'DVR-PABLO': { label: 'DVR-PABLO', channels: {
    '2': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'normal',   minDur:20, maxConsec:3, maxSpan:5,  minBg:15, cooldown:480000},
    '4': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '5': {group:'especial', minDur:60, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '8': {group:'normal',   minDur:20, maxConsec:3, maxSpan:5,  minBg:15, cooldown:480000},
  }},
  '10ymedioN': { label: '10 1/2 Norte', channels: {
    '1': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'especial', minDur:60, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
  }},
  'COVES-CHICKEN': { label: 'COVES-CHICKEN', channels: {
    '1': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '4': {group:'normal',   minDur:20, maxConsec:3, maxSpan:5,  minBg:15, cooldown:480000},
  }},
  '11N_ROSA': { label: 'EDITH', channels: {
    '1': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'normal',   minDur:20, maxConsec:3, maxSpan:5,  minBg:15, cooldown:480000},
    '4': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
  }},
  '4 ORIENTE RODRIGUEZ': { label: 'TALLER', channels: {
    '1': {group:'normal',   minDur:20, maxConsec:3, maxSpan:5,  minBg:15, cooldown:480000},
    '2': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'normal',   minDur:20, maxConsec:3, maxSpan:5,  minBg:15, cooldown:480000},
  }},
  'WAIMEA 11 NORTE': { label: 'WAIMEA', channels: {
    '1': {group:'especial', minDur:60, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
  }},
  'COVES-11 NORTE 832': { label: '11N_Rosa', channels: {
    '1': {group:'especial', minDur:60, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'normal',   minDur:20, maxConsec:3, maxSpan:5,  minBg:15, cooldown:480000},
  }},
  'Cafe cielo': { label: 'CIELO', channels: {
    '1': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
  }},
  '13 norte Capriccio': { label: 'CAPRICCIO', channels: {
    '1': {group:'largo',    minDur:40,  maxConsec:3, maxSpan:5,  minBg:15, cooldown:1800000},
    '2': {group:'especial', minDur:60,  maxConsec:3, maxSpan:5,  minBg:15, cooldown:1800000},
    // ch3 mira intersección 2 calles — umbral subido de 20s a 90s (2026-04-30)
    '3': {group:'especial', minDur:90,  maxConsec:3, maxSpan:5,  minBg:15, cooldown:1800000},
  }},
  'condominio11': { label: 'COND.11', channels: {
    '1': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'especial', minDur:60, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
  }},
  'Don Mario': { label: 'Don Mario', channels: {
    '1': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'especial', minDur:60, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
  }},
  'TOBAR': { label: 'TOBAR', channels: {
    '1': {group:'especial', minDur:60, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '2': {group:'corto',    minDur:25, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
    '3': {group:'normal',   minDur:20, maxConsec:3, maxSpan:5,  minBg:15, cooldown:480000},
    '4': {group:'largo',    minDur:40, maxConsec:3, maxSpan:5,  minBg:15, cooldown:600000},
  }}
};

const MAX_GAP_SEC  = 4;
const cooldownFile = '/tmp/coves_cooldown.json';
let cooldown = {};
try { cooldown = JSON.parse(fs.readFileSync(cooldownFile, 'utf8')); } catch(e) {}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseFileTime(filename) {
  const m = filename.match(/_ch\d+_(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})_/);
  if (!m) return null;
  return `${m[4]}:${m[5]}:${m[6]} ${m[3]}/${m[2]}/${m[1]}`;
}

async function sendTelegramPhoto(imagePath, caption) {
  const form = new FormData();
  form.append('chat_id', CHAT_ID);
  form.append('caption', caption);
  form.append('photo',
    new Blob([fs.readFileSync(imagePath)], { type: 'image/jpeg' }),
    'alerta.jpg'
  );
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: form
  });
  return res.ok;
}

function diag(msg) {
  const ts = new Date().toISOString().slice(11,19);
  fs.appendFileSync('/tmp/coves_diag.log', `[${ts}] ${msg}\n`);
}

// ── Procesamiento con filtros (ambos rangos) ──────────────────────────────────
async function procesarConFiltros(dvrKey, dvr, ch, cfg, frames, rango) {
  const bursts = agruparBursts(frames);
  const nowSec = Date.now() / 1000;
  const coolKey = `${dvrKey}_${ch}`;
  const u = rango.umbrales;
  const minDurEfectivo = cfg.minDur * u.minDurMult;

  for (const b of bursts) {
    const duration = b[b.length-1].ts - b[0].ts;
    const age      = nowSec - b[b.length-1].ts;
    if (duration < minDurEfectivo || age > 60) {
      diag(`SKIP ${coolKey}[${rango.nombre}]: dur=${duration.toFixed(0)}s(min=${minDurEfectivo.toFixed(0)}) age=${age.toFixed(0)}s`);
      continue;
    }

    // Variación consecutiva
    const step = Math.max(1, Math.floor(b.length / 5));
    let maxConsecDiff = 0;
    for (let i = 0; i < b.length - step; i += step) {
      const out = execSync(
        `compare -metric RMSE "${b[i].path}" "${b[i+step].path}" /tmp/consec_${coolKey}.jpg 2>&1 || true`
      ).toString();
      const m = out.match(/\(([0-9.]+)\)/);
      if (m) maxConsecDiff = Math.max(maxConsecDiff, parseFloat(m[1]) * 100);
    }
    if (maxConsecDiff > u.maxConsec) {
      diag(`SKIP ${coolKey}[${rango.nombre}]: consecDiff=${maxConsecDiff.toFixed(2)}% > max=${u.maxConsec}%`);
      continue;
    }

    // Diferencia primer/último frame
    const spanOut = execSync(
      `compare -metric RMSE "${b[0].path}" "${b[b.length-1].path}" /tmp/span_${coolKey}.jpg 2>&1 || true`
    ).toString();
    const spanM = spanOut.match(/\(([0-9.]+)\)/);
    if (!spanM || parseFloat(spanM[1]) * 100 > u.maxSpan) {
      diag(`SKIP ${coolKey}[${rango.nombre}]: span=${spanM?(parseFloat(spanM[1])*100).toFixed(2):'err'}% > max=${u.maxSpan}%`);
      continue;
    }

    // Diferencia vs fondo (_T.jpg)
    const refLine = execSync(
      `find /home/ftpcoves/imagenes -name "${dvrKey}*_ch${ch}_*_T.jpg" -printf "%T@ %p\\n" | sort -n | tail -1`
    ).toString().trim();
    if (!refLine) {
      diag(`SKIP ${coolKey}[${rango.nombre}]: sin referencia _T.jpg`);
      continue;
    }
    const refPath  = refLine.split(' ').slice(1).join(' ');
    const midFrame = b[Math.floor(b.length / 2)];
    const bgOut    = execSync(
      `compare -metric RMSE "${refPath}" "${midFrame.path}" /tmp/diff_${coolKey}.jpg 2>&1 || true`
    ).toString();
    const bgM = bgOut.match(/\(([0-9.]+)\)/);
    if (!bgM || parseFloat(bgM[1]) * 100 < u.minBg) {
      diag(`SKIP ${coolKey}[${rango.nombre}]: bgDiff=${bgM?(parseFloat(bgM[1])*100).toFixed(2):'err'}% < min=${u.minBg}%`);
      continue;
    }

    diag(`${rango.tipo.toUpperCase()} ${coolKey}: dur=${duration.toFixed(0)}s consec=${maxConsecDiff.toFixed(2)}% span=${spanM?(parseFloat(spanM[1])*100).toFixed(2):'-'}% bg=${bgM?(parseFloat(bgM[1])*100).toFixed(2):'-'}%`);

    const eventTime = parseFileTime(midFrame.path.split('/').pop()) || midFrame.path.split('/').pop();

    // Clasificar con IA (no bloquea si falla)
    const cls = await classifier.classify(midFrame.path);

    // Router: enviar a Telegram solo si es persona de riesgo alto/medio
    // Si cls es null (IA falló), enviar igual como fallback seguro
    const debeEnviar = !cls || (cls.es_persona && (cls.nivel_riesgo === 'alto' || cls.nivel_riesgo === 'medio'));

    if (debeEnviar) {
      let caption;
      if (cls) {
        const emoji = cls.nivel_riesgo === 'alto' ? '🔴' : '🟡';
        caption = `${emoji} ${cls.descripcion_ia}\nDVR: ${dvr.label} · Canal ${ch} (${cfg.group})\nDuración: ${duration.toFixed(0)}s\nHora: ${eventTime}\nConducta: ${cls.conducta}`;
      } else {
        caption = `${rango.emoji} ${rango.label}\nDVR: ${dvr.label} · Canal ${ch} (${cfg.group})\nDuración: ${duration.toFixed(0)}s\nHora: ${eventTime}`;
      }
      const ok = await sendTelegramPhoto(midFrame.path, caption).catch(e => {
        diag(`ERROR Telegram ${coolKey}: ${e.message}`);
        return false;
      });
      if (ok) cooldown[coolKey] = Date.now();
    } else {
      cooldown[coolKey] = Date.now();
    }

    // Registrar en Supabase (siempre, con o sin clasificación)
    await registrarSupabase(dvrKey, dvr.label, ch, cfg.group, duration, rango.tipo, cls);

    return { dvr: dvr.label, ch, duration: duration.toFixed(0), tipo: rango.tipo, nivel_riesgo: cls?.nivel_riesgo ?? 'sin_clasificar' };
  }
  return null;
}

// ── Agrupador de bursts ───────────────────────────────────────────────────────
function agruparBursts(frames) {
  const bursts = [];
  let burst = [frames[0]];
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].ts - frames[i-1].ts <= MAX_GAP_SEC) burst.push(frames[i]);
    else { bursts.push(burst); burst = [frames[i]]; }
  }
  bursts.push(burst);
  return bursts;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const eventos = [];

  for (const [dvrKey, dvr] of Object.entries(DVRS)) {
    for (const [ch, cfg] of Object.entries(dvr.channels)) {
      const coolKey = `${dvrKey}_${ch}`;
      if (cooldown[coolKey] && (Date.now() - cooldown[coolKey]) < cfg.cooldown) continue;

      try {
        const cutoff = (Date.now() / 1000 - 180).toFixed(0);
        const raw = execSync(
          `find /home/ftpcoves/imagenes -name "${dvrKey}*_ch${ch}_*_E.jpg" -printf "%T@ %p\\n" | awk -v t=${cutoff} '$1>=t{print}' | sort -n`
        ).toString().trim();
        if (!raw) continue;

        const frames = raw.split('\n').filter(Boolean).map(l => ({
          ts:   parseFloat(l.split(' ')[0]),
          path: l.split(' ').slice(1).join(' ')
        }));
        if (frames.length === 0) continue;

        const resultado = await procesarConFiltros(dvrKey, dvr, ch, cfg, frames, rango);
        if (resultado) eventos.push(resultado);

      } catch(e) {
        // Silenciar errores individuales para no cortar el ciclo
      }
    }
  }

  fs.writeFileSync(cooldownFile, JSON.stringify(cooldown));
  if (eventos.length) {
    console.log(`Eventos enviados (${rango.nombre}): ${eventos.map(a => `${a.dvr}/ch${a.ch}(${a.duration}s,${a.tipo},${a.nivel_riesgo})`).join(', ')}`);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
