import * as Sentry from '@sentry/astro';

// Páginas privadas con enlace único (formulario «Preparación del Radar», /radar/ y /en/radar/): no se inicializa Sentry.
// Sus trazas de carga incluyen la URL completa y el enlace lleva un token en el fragmento (#t=); además el cliente escribe
// información de su negocio. Una prueba en scripts/manual-tests/radar-previo-ui.mjs comprueba que no sale ninguna solicitud a Sentry.
const paginaPrivada = /^\/(en\/)?radar\//.test(location.pathname);

if (!paginaPrivada) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
