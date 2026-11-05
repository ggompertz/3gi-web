// Lógica del cliente del formulario «Preparación del Radar»: carga con el token del enlace, guardado automático con control de
// concurrencia, condiciones, revisión y envío. Se carga desde RadarPrevioPage.astro.
//
// Reglas:
//  - El token viaja en el fragmento (#t=), se guarda solo en sessionStorage (necesario para poder recargar) y se quita de la URL.
//  - «Guardado» se muestra únicamente cuando el Worker confirmó con 200. Ante un error nunca se muestra texto del servidor.
//  - Todo texto visible sale del HTML (elementos [data-t]); aquí no hay frases escritas, para que las guardias del sitio las revisen.

const raiz = document.getElementById('rp');
const API = raiz.dataset.api;
const EST = JSON.parse(document.getElementById('rp-estructura').textContent);
const T = Object.fromEntries([...raiz.querySelectorAll('[data-t]')].map((e) => [e.dataset.t, e.textContent.trim()]));
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const $ = (sel, ctx = raiz) => ctx.querySelector(sel);
const $$ = (sel, ctx = raiz) => [...ctx.querySelectorAll(sel)];
const NO_SE = 'no_se';

const S = {
  token: null, base: null, respuestas: {}, precarga: {}, plantilla: '', servidor: '',
  sucias: new Map(), versiones: {}, conError: new Set(), timer: null, reintento: null, intentos: 0,
  activa: -1, seccionesActivas: [], enVuelo: null, pendSeccion: null, conflicto: null,
};

// ── Token ──────────────────────────────────────────────────────────────────────
function obtenerToken() {
  const m = /^#t=([A-Za-z0-9_-]{43})$/.exec(location.hash);
  let token = m ? m[1] : null;
  try {
    if (m) sessionStorage.setItem('rp_t', m[1]);
    else token = sessionStorage.getItem('rp_t');
  } catch { /* sin almacenamiento: solo sirve el enlace con #t= */ }
  if (m) history.replaceState(null, '', location.pathname + location.search);
  return token;
}

// ── API ────────────────────────────────────────────────────────────────────────
async function api(ruta, cuerpo) {
  const res = await fetch(API + ruta, {
    method: 'POST', cache: 'no-store', referrerPolicy: 'no-referrer',
    headers: { Authorization: `Bearer ${S.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo ?? {}),
  });
  let datos = null;
  try { datos = await res.json(); } catch { /* respuesta sin JSON */ }
  return { status: res.status, datos };
}

// ── Pantallas y estado ─────────────────────────────────────────────────────────
function mostrar(nombre, idSeccion) {
  for (const p of $$('[data-pantalla]')) {
    const es = p.dataset.pantalla === nombre && (nombre !== 'seccion' || p.dataset.seccion === idSeccion);
    p.hidden = !es;
    if (es) { $('h1, h2', p)?.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  }
  $('[data-conflicto]').hidden = true;
}

let ocultarEstado = null;
function estado(clave, nivel = 'ok', extra) {
  const e = $('[data-estado]');
  clearTimeout(ocultarEstado);
  if (!clave) { e.hidden = true; return; }
  e.textContent = fmt(T[clave], extra ?? {});
  e.dataset.nivel = nivel;
  e.hidden = false;
  if (clave === 'guardado') ocultarEstado = setTimeout(() => { e.hidden = true; }, 2500);
}

// ── Lectura y escritura de valores del DOM ─────────────────────────────────────
const campo = (path) => $(`[data-campo="${path}"]`);
const campos = (path) => $$(`[data-campo="${path}"]`);
const noSe = (id) => !!$(`[data-nose="${id}"]`)?.checked;
const vacia = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)
  || (typeof v === 'object' && !Array.isArray(v) && Object.values(v).every(vacia));

function leerCampo(def, path) {
  switch (def.tipo) {
    case 'texto_corto': case 'texto_largo': return campo(path)?.value.trim() ?? '';
    case 'numero': { const s = campo(path)?.value.trim() ?? ''; return s === '' ? undefined : Number(s); }
    case 'seleccion': {
      const el = campo(path);
      if (el?.tagName === 'SELECT') return el.value || undefined;
      return campos(path).find((r) => r.checked)?.value;
    }
    case 'multiseleccion': return campos(path).filter((c) => c.checked).map((c) => c.value);
    default: return undefined;
  }
}

const filasRep = (id) => $$('[data-fila-activa]', $(`[data-pregunta="${id}"]`));

function leerPregunta(id) {
  const def = EST.preguntas[id];
  if (noSe(id)) return { _: NO_SE };
  if (def.tipo === 'compuesto') {
    const o = {};
    for (const [k, c] of Object.entries(def.campos)) { const v = leerCampo(c, `${id}.${k}`); if (!vacia(v)) o[k] = v; }
    return o;
  }
  if (def.tipo === 'repetidor') {
    const items = filasRep(id).map((_, i) => {
      const o = {};
      for (const [k, c] of Object.entries(def.campos)) { const v = leerCampo(c, `${id}[${i}].${k}`); if (!vacia(v)) o[k] = v; }
      return o;
    }).filter((o) => (o.descripcion ?? '').trim() !== '');
    return items.length ? items : undefined;
  }
  if (def.tipo === 'ref_repetidor') { const v = campo(id)?.value; return v === '' || v === undefined ? undefined : Number(v); }
  return leerCampo(def, id);
}

function escribirCampo(def, path, v) {
  if (def.tipo === 'seleccion') {
    const el = campo(path);
    if (el?.tagName === 'SELECT') el.value = v ?? '';
    else campos(path).forEach((r) => { r.checked = r.value === v; });
  } else if (def.tipo === 'multiseleccion') {
    campos(path).forEach((c) => { c.checked = Array.isArray(v) && v.includes(c.value); });
  } else if (campo(path)) {
    campo(path).value = v ?? '';
  }
}

function bloquear(id, si) {
  for (const el of $$('input, select, textarea, button', $(`[data-pregunta="${id}"] [data-controles]`))) el.disabled = si;
}

// Repetidor: las filas se clonan de la plantilla; su índice va en `data-campo` y `name` («n06[0].area»).
function renombrar(fila, i) {
  for (const el of $$('[data-campo], [name]', fila)) {
    for (const a of ['data-campo', 'name']) { const v = el.getAttribute(a); if (v) el.setAttribute(a, v.replace(/\[(\d+|#)\]/, `[${i}]`)); }
  }
  $('[data-fila-titulo]', fila).textContent = fmt(T.tarea_n, { n: i + 1 });
}
function refrescarBotonesFila(id) {
  const rep = $('[data-repetidor]', $(`[data-pregunta="${id}"]`));
  const n = filasRep(id).length;
  $('[data-agregar-fila]', rep).hidden = n >= Number(rep.dataset.max);
  filasRep(id).forEach((f, i) => { $('[data-quitar-fila]', f).hidden = n === 1; $('[data-fila-titulo]', f).textContent = fmt(T.tarea_n, { n: i + 1 }); });
}
function agregarFila(id) {
  const rep = $('[data-repetidor]', $(`[data-pregunta="${id}"]`));
  if (filasRep(id).length >= Number(rep.dataset.max)) return null;
  const i = filasRep(id).length;
  const fila = $('[data-fila]', rep).content.firstElementChild.cloneNode(true);
  $('[data-filas]', rep).append(fila);
  renombrar(fila, i);
  refrescarBotonesFila(id);
  actualizarRef();
  return fila;
}
function quitarFila(fila) {
  const id = fila.closest('[data-pregunta]').dataset.pregunta;
  fila.remove();
  filasRep(id).forEach((f, i) => renombrar(f, i));
  refrescarBotonesFila(id);
  actualizarRef();
}

// n07 ofrece las tareas escritas en n06
function actualizarRef() {
  const sel = $('[data-ref="n06"]');
  if (!sel) return;
  const previo = sel.value;
  sel.replaceChildren(new Option(T.elegir, ''));
  filasRep('n06').forEach((_, i) => { const d = campo(`n06[${i}].descripcion`)?.value.trim(); if (d) sel.add(new Option(d.slice(0, 80), String(i))); });
  sel.value = [...sel.options].some((o) => o.value === previo) ? previo : '';
}

function escribirPregunta(id, v) {
  const def = EST.preguntas[id];
  if (def.tipo === 'repetidor' && filasRep(id).length === 0) agregarFila(id);
  const nose = $(`[data-nose="${id}"]`);
  if (v && v._ === NO_SE) { nose.checked = true; bloquear(id, true); return; }
  nose.checked = false; bloquear(id, false);
  if (def.tipo === 'compuesto') {
    for (const [k, c] of Object.entries(def.campos)) escribirCampo(c, `${id}.${k}`, v?.[k]);
  } else if (def.tipo === 'repetidor') {
    const items = Array.isArray(v) && v.length ? v : [{}];
    while (filasRep(id).length < items.length) agregarFila(id);
    items.forEach((it, i) => { for (const [k, c] of Object.entries(def.campos)) escribirCampo(c, `${id}[${i}].${k}`, it[k]); });
    refrescarBotonesFila(id);
  } else if (def.tipo === 'ref_repetidor') {
    actualizarRef();
    if (v !== undefined) campo(id).value = String(v);
  } else {
    escribirCampo(def, id, v);
  }
}

// ── Condiciones y precarga ─────────────────────────────────────────────────────
function visible(id) {
  const cond = JSON.parse($(`[data-pregunta="${id}"]`).dataset.visibleSi ?? 'null');
  if (!cond) return true;
  const r = leerPregunta(cond.pregunta);
  if (r === undefined || (r && r._ === NO_SE)) return true;
  const valor = cond.campo ? r?.[cond.campo] : r;
  if (valor === undefined) return true;
  if (cond.op === 'gt') return Number(valor) > cond.valor;
  if (cond.op === 'ne') return valor !== cond.valor;
  return true;
}
function actualizarCondiciones() {
  for (const p of $$('[data-visible-si]')) p.hidden = !visible(p.dataset.pregunta);
}
function actualizarPrecarga() {
  for (const p of $$('[data-pregunta]')) {
    const id = p.dataset.pregunta;
    const caja = $('[data-precarga]', p);
    if (!caja) continue;
    const sug = S.precarga[id]?.sugerencia;
    caja.hidden = !sug || !vacia(leerPregunta(id)) || noSe(id);
    if (sug) {
      $('[data-precarga-texto]', caja).textContent = sug;
      $('[data-usar-precarga]', caja).hidden = !['texto_corto', 'texto_largo'].includes(EST.preguntas[id].tipo);
    }
  }
}

// ── Secciones y revisión ───────────────────────────────────────────────────────
const idsActivas = () => EST.secciones.filter((s) => !s.modulo || S.plantilla.includes(s.modulo)).map((s) => s.id);
const seccionDe = (id) => EST.secciones.find((s) => s.preguntas.includes(id))?.id;

function irASeccion(i) {
  S.activa = i;
  const id = S.seccionesActivas[i];
  mostrar('seccion', id);
  const sec = $(`[data-seccion="${id}"]`);
  const pt = $('[data-prog-txt]', sec);
  pt.textContent = `${fmt(T.seccion_n_de_total, { n: i + 1, total: S.seccionesActivas.length })} · ${fmt(T.minutos, { m: pt.dataset.min })}`;
  $('[data-prog-fill]', sec).style.width = `${Math.round(((i + 1) / (S.seccionesActivas.length + 1)) * 100)}%`;
  $('[data-ir="siguiente"]', sec).textContent = i === S.seccionesActivas.length - 1 ? T.revisar : T.siguiente;
}
function navegar(dir) {
  const actual = S.seccionesActivas[S.activa];
  if (actual) guardar({ seccion: actual });
  const hacia = S.activa + dir;
  if (hacia < 0) return mostrar('intro');
  if (hacia >= S.seccionesActivas.length) return irARevision();
  irASeccion(hacia);
}

function resumen() {
  const ids = S.seccionesActivas.flatMap((s) => EST.secciones.find((x) => x.id === s).preguntas).filter(visible);
  let respondidas = 0;
  let nose = 0;
  for (const id of ids) { if (noSe(id)) nose++; else if (!vacia(leerPregunta(id))) respondidas++; }
  const faltan = ids.filter((id) => EST.preguntas[id].obligatoria && !noSe(id) && vacia(leerPregunta(id)));
  return { total: ids.length, respondidas, nose, faltan };
}
function irARevision(faltanServidor) {
  const r = resumen();
  const faltan = faltanServidor ?? r.faltan;
  S.activa = S.seccionesActivas.length;
  mostrar('revision');
  $('[data-revision-resumen]').textContent = fmt(T.revision_resumen, { n: r.respondidas, total: r.total, nose: r.nose });
  $('[data-revision-pendientes]').hidden = faltan.length === 0;
  $('[data-revision-ok]').hidden = faltan.length > 0;
  const lista = $('[data-revision-lista]');
  lista.replaceChildren();
  for (const id of faltan) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'rp-btn rp-btn-sec rp-btn-chico'; b.dataset.irPregunta = id;
    b.textContent = `${$(`#rp-t-${id}`).childNodes[0].textContent} — ${T.revision_ir}`;
    li.append(b); lista.append(li);
  }
  $('[data-error-envio]').hidden = true;
}

// ── Guardado automático ────────────────────────────────────────────────────────
function marcarSucia(id) {
  S.versiones[id] = (S.versiones[id] ?? 0) + 1;
  S.sucias.set(id, S.versiones[id]);
  S.conError.delete(id);
  const e = $(`[data-pregunta="${id}"] [data-error]`);
  if (e) e.hidden = true;
}
function programarGuardado(ms = 1200) {
  clearTimeout(S.timer);
  S.timer = setTimeout(() => guardar(), ms);
}
function reintentar(clave) {
  estado(clave, clave === 'sin_conexion' ? 'aviso' : 'error');
  clearTimeout(S.reintento);
  const espera = [3000, 8000, 20000, 45000][Math.min(S.intentos++, 3)];
  S.reintento = setTimeout(() => guardar(), espera);
}

/** Serializa los guardados: uno a la vez, en orden. Devuelve true si no quedó nada pendiente o el servidor lo confirmó. */
async function guardar({ seccion } = {}) {
  if (seccion) S.pendSeccion = seccion;
  while (S.enVuelo) await S.enVuelo;
  S.enVuelo = hacerGuardado().finally(() => { S.enVuelo = null; });
  return S.enVuelo;
}

async function hacerGuardado() {
  const cambios = {};
  const versiones = {};
  for (const id of [...S.sucias.keys()]) {
    if (S.conError.has(id)) continue;
    const v = leerPregunta(id);
    if (v === undefined) { S.sucias.delete(id); continue; } // nada enviable (p. ej. una selección vacía): no se reintenta
    cambios[id] = v; versiones[id] = S.sucias.get(id);
  }
  const seccion = S.pendSeccion;
  if (!Object.keys(cambios).length && !seccion) return true;
  estado('guardando', 'aviso');
  let r;
  try { r = await api('/v1/guardar', { base_actualizado_en: S.base, cambios, ...(seccion ? { seccion } : {}) }); }
  catch { reintentar('sin_conexion'); return false; }

  if (r.status === 200 && r.datos?.actualizado_en) {
    S.base = r.datos.actualizado_en; S.intentos = 0;
    if (S.pendSeccion === seccion) S.pendSeccion = null;
    for (const [id, ver] of Object.entries(versiones)) { S.respuestas[id] = cambios[id]; if (S.sucias.get(id) === ver) S.sucias.delete(id); }
    if (S.servidor === 'enviado' && r.datos.estado === 'borrador') { S.servidor = 'borrador'; estado('reabierto', 'aviso'); }
    else estado('guardado', 'ok');
    if ([...S.sucias.keys()].some((id) => !S.conError.has(id))) programarGuardado(300);
    return true;
  }
  if (r.status === 401) { mostrar('invalido'); return false; }
  if (r.status === 409) { S.conflicto = r.datos; $('[data-conflicto]').hidden = false; estado(null); return false; }
  if (r.status === 422 && Array.isArray(r.datos?.campos)) {
    for (const c of r.datos.campos) {
      if (!EST.preguntas[c.id]) continue;
      S.conError.add(c.id);
      const e = $(`[data-pregunta="${c.id}"] [data-error]`);
      if (e) { e.textContent = T.error_validacion; e.hidden = false; }
    }
    estado('error_validacion', 'error');
    if ([...S.sucias.keys()].some((id) => !S.conError.has(id))) programarGuardado(300); // lo válido se reenvía sin lo rechazado
    return false;
  }
  if (r.status === 413) { estado('error_tamano', 'error'); return false; }
  reintentar('error_guardar');
  return false;
}

/** Antes de enviar: deja todo guardado. Lo rechazado por formato no se reintenta; lo decide el servidor al enviar. */
async function vaciarPendientes() {
  for (let i = 0; i < 6; i++) {
    clearTimeout(S.timer);
    const pendientes = [...S.sucias.keys()].some((id) => !S.conError.has(id));
    if (!pendientes && !S.pendSeccion && !S.enVuelo) return true;
    if (!(await guardar())) return false;
  }
  return false;
}

// ── Carga ──────────────────────────────────────────────────────────────────────
function aplicarServidor(d) {
  S.base = d.actualizado_en; S.respuestas = d.respuestas ?? {}; S.precarga = d.precarga ?? {};
  S.plantilla = d.plantilla ?? ''; S.servidor = d.estado; S.sucias.clear(); S.conError.clear();
  S.seccionesActivas = idsActivas();
  for (const id of Object.keys(EST.preguntas)) escribirPregunta(id, S.respuestas[id]);
  actualizarRef();
  for (const id of Object.keys(EST.preguntas)) if (EST.preguntas[id].tipo === 'ref_repetidor' && S.respuestas[id] !== undefined) campo(id).value = String(S.respuestas[id]);
  actualizarCondiciones(); actualizarPrecarga();
  const hay = Object.keys(S.respuestas).length > 0 || Object.keys(d.progreso ?? {}).length > 0;
  $('[data-empezar-txt]').textContent = hay ? T.continuar : T.empezar;
}
async function cargar() {
  mostrar('cargando');
  let r;
  try { r = await api('/v1/cargar'); } catch { return mostrar('error-carga'); }
  if (r.status === 401) return mostrar('invalido');
  if (r.status !== 200 || !r.datos) return mostrar('error-carga');
  aplicarServidor(r.datos);
  if (S.servidor === 'cerrado') return mostrar('cerrado');
  return mostrar(S.servidor === 'enviado' ? 'enviado' : 'intro');
}

// ── Eventos ────────────────────────────────────────────────────────────────────
function alCambiar(e) {
  const el = e.target;
  const preg = el.closest('[data-pregunta]');
  if (!preg) return;
  const id = preg.dataset.pregunta;
  if (el.matches('[data-nose]')) bloquear(id, el.checked);
  if (el.matches('input[type="checkbox"][data-campo]') && el.checked) {
    // «Ninguna» es exclusiva: marcarla desmarca el resto y marcar otra la desmarca
    if (el.dataset.exclusiva === '1') campos(el.dataset.campo).forEach((c) => { if (c !== el) c.checked = false; });
    else campos(el.dataset.campo).filter((c) => c.dataset.exclusiva === '1').forEach((c) => { c.checked = false; });
  }
  if (id === 'n06') actualizarRef();
  marcarSucia(id);
  if (id === 'n06') marcarSucia('n07');
  actualizarCondiciones(); actualizarPrecarga();
  programarGuardado(e.type === 'change' ? 600 : 1200);
}
raiz.addEventListener('input', alCambiar);
raiz.addEventListener('change', alCambiar);

raiz.addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.matches('[data-empezar]')) return irASeccion(0);
  if (b.matches('[data-ir]')) return navegar(b.dataset.ir === 'siguiente' ? 1 : -1);
  if (b.matches('[data-agregar-fila]')) {
    const id = b.closest('[data-pregunta]').dataset.pregunta;
    const f = agregarFila(id);
    if (f) $('input, select, textarea', f).focus();
    return marcarSucia(id);
  }
  if (b.matches('[data-quitar-fila]')) {
    const id = b.closest('[data-pregunta]').dataset.pregunta;
    quitarFila(b.closest('[data-fila-activa]'));
    marcarSucia(id); marcarSucia('n07'); actualizarCondiciones();
    return programarGuardado();
  }
  if (b.matches('[data-usar-precarga]')) {
    const id = b.closest('[data-pregunta]').dataset.pregunta;
    const el = campo(id);
    el.value = S.precarga[id].sugerencia;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return el.focus();
  }
  if (b.matches('[data-ir-pregunta]')) {
    const id = b.dataset.irPregunta;
    irASeccion(S.seccionesActivas.indexOf(seccionDe(id)));
    const el = $(`[data-pregunta="${id}"]`);
    el.scrollIntoView({ block: 'center' });
    return $('input, select, textarea', el)?.focus();
  }
  if (b.matches('[data-reintentar-carga]')) return cargar();
  if (b.matches('[data-cargar-servidor]')) { aplicarServidor(S.conflicto); $('[data-conflicto]').hidden = true; return estado(null); }
  if (b.matches('[data-editar]')) return irASeccion(0);
  if (b.matches('[data-enviar]')) return enviar(b);
});

async function enviar(boton) {
  boton.disabled = true; boton.textContent = T.enviando;
  const restaurar = () => { boton.disabled = false; boton.textContent = T.enviar; };
  if (!(await vaciarPendientes())) { restaurar(); $('[data-error-envio]').hidden = false; return; }
  let r;
  try { r = await api('/v1/enviar', { base_actualizado_en: S.base }); } catch { restaurar(); $('[data-error-envio]').hidden = false; return; }
  restaurar();
  if (r.status === 200) {
    S.servidor = 'enviado';
    if (r.datos?.actualizado_en) S.base = r.datos.actualizado_en; // el envío cambia la versión: sin esto la siguiente edición recibiría un 409 falso
    estado(null);
    return mostrar('enviado');
  }
  if (r.status === 422 && r.datos?.error === 'FALTAN') return irARevision(r.datos.ids.filter((id) => EST.preguntas[id]));
  if (r.status === 401) return mostrar('invalido');
  if (r.status === 409) { S.conflicto = r.datos; $('[data-conflicto]').hidden = false; return; }
  $('[data-error-envio]').hidden = false;
}

window.addEventListener('online', () => { if (S.sucias.size) guardar(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && S.sucias.size) guardar(); });
window.addEventListener('beforeunload', (e) => { if (S.sucias.size || S.enVuelo) { e.preventDefault(); e.returnValue = ''; } });

S.token = obtenerToken();
if (!S.token) mostrar('invalido'); else cargar();
