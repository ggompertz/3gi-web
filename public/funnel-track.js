(function () {
  var SUPA_URL = 'https://rfvhiuyqtfpqzjwpumav.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmhpdXlxdGZwcXpqd3B1bWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4Mzc5OTksImV4cCI6MjA4ODQxMzk5OX0.BQfrR1TdfptuXsbEhqjFtYOULgOjKxae8H5nrzIZbQs';

  // Sin consentimiento aceptado no se escribe nada en el navegador: el ID vive solo en esta
  // variable (dura lo que dura la página). Sí se envían los utm_* de la dirección actual (etiquetas
  // de campaña, sin guardarlas), solo si el valor es una etiqueta simple (ver readUtm).
  var memSid = null;

  function hasConsent() {
    try {
      var c = JSON.parse(localStorage.getItem('tgi_consent') || 'null');
      return !!c && c.status === 'accepted';
    } catch (e) {
      return false;
    }
  }

  // Los rastreadores y navegadores automatizados inflaban las visitas del funnel.
  function isBot() {
    try {
      return !!navigator.webdriver ||
        /bot|crawl|spider|headless|lighthouse|pagespeed|preview|facebookexternalhit|slurp/i.test(navigator.userAgent || '');
    } catch (e) {
      return false;
    }
  }

  function getSessionId() {
    try {
      if (!hasConsent()) {
        if (!memSid) memSid = crypto.randomUUID();
        return memSid;
      }
      var sid = sessionStorage.getItem('_3gi_fsid');
      if (!sid) {
        // Si ya había un ID en memoria (la persona aceptó a mitad de página), se adopta para no partir la sesión
        sid = memSid || crypto.randomUUID();
        sessionStorage.setItem('_3gi_fsid', sid);
      }
      return sid;
    } catch (e) {
      return null;
    }
  }

  // Sin consentimiento: solo utm_* de la dirección actual, sin leer ni escribir storage. Un valor
  // que no sea una etiqueta simple se omite, para que un enlace con un correo u otro dato personal
  // en la dirección no quede registrado. 'src' y 'lid' no se registran en este nivel.
  function readUtm() {
    try {
      var params = new URLSearchParams(location.search);
      var out = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
        var v = params.get(k);
        if (v !== null && /^[A-Za-z0-9._~-]{1,64}$/.test(v)) out[k] = v;
      });
      return out;
    } catch (e) {
      return {};
    }
  }

  function captureUtm() {
    if (!hasConsent()) return readUtm();
    try {
      var params = new URLSearchParams(location.search);
      // 'lid' (ID de un lead en el enlace del PDF) NO se guarda: uniría la navegación con una persona identificada
      var keys = ['src', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      var stored = {};
      try {
        stored = JSON.parse(sessionStorage.getItem('_3gi_futm') || '{}');
      } catch (e) {}
      var changed = false;
      if (stored.lid !== undefined) {
        delete stored.lid;
        changed = true;
      }
      keys.forEach(function (k) {
        if (params.has(k)) {
          stored[k] = params.get(k);
          changed = true;
        }
      });
      if (changed) sessionStorage.setItem('_3gi_futm', JSON.stringify(stored));
      return stored;
    } catch (e) {
      return {};
    }
  }

  // Reenvío a PostHog. Este archivo redefine window.__funnelTrack (el de Layout.astro solo
  // reenviaba a PostHog), así que sin esto el funnel nunca llegaba ahí. PostHog carga async
  // y solo con consentimiento (__posthogLoaded lo marca Layout.astro): si aún no está listo,
  // el evento espera en __phQueue y Layout.astro lo vacía tras posthog.init().
  function toPostHog(evento, meta) {
    try {
      if (window.posthog) window.posthog.capture(evento, meta || {});
      else if (window.__posthogLoaded) (window.__phQueue = window.__phQueue || []).push([evento, meta || {}]);
    } catch (e) {}
  }

  window.__funnelTrack = function (evento, meta) {
    if (isBot()) return;
    toPostHog(evento, meta);
    try {
      var sid = getSessionId();
      if (!sid) return;
      var utm = captureUtm();
      var body = JSON.stringify({
        evento: evento,
        session_id: sid,
        path: location.pathname,
        utm: utm,
        meta: meta || {},
      });
      fetch(SUPA_URL + '/rest/v1/funnel_events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPA_KEY,
          Authorization: 'Bearer ' + SUPA_KEY,
          Prefer: 'return=minimal',
        },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  };

  if (hasConsent()) captureUtm();
})();
