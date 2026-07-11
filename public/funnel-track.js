(function () {
  var SUPA_URL = 'https://rfvhiuyqtfpqzjwpumav.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmhpdXlxdGZwcXpqd3B1bWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4Mzc5OTksImV4cCI6MjA4ODQxMzk5OX0.BQfrR1TdfptuXsbEhqjFtYOULgOjKxae8H5nrzIZbQs';

  function getSessionId() {
    try {
      var sid = sessionStorage.getItem('_3gi_fsid');
      if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem('_3gi_fsid', sid);
      }
      return sid;
    } catch (e) {
      return null;
    }
  }

  function captureUtm() {
    try {
      var params = new URLSearchParams(location.search);
      var keys = ['src', 'lid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      var stored = {};
      try {
        stored = JSON.parse(sessionStorage.getItem('_3gi_futm') || '{}');
      } catch (e) {}
      var changed = false;
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

  window.__funnelTrack = function (evento, meta) {
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

  captureUtm();
})();
