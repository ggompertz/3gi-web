// Español intencional dentro de páginas en inglés que no se puede marcar con lang="es" en el HTML.
// Cada entrada lleva su MOTIVO. Preferir siempre marcar el elemento con lang="es" (o translate="no").
// pagina: ruta del build ('en/nosotros/index.html') o '*' para todas. texto: fragmento (sin distinguir mayúsculas).
export const PERMITIDOS = [
  { pagina: 'en/privacidad/index.html', texto: 'tgi_consent (localStorage)', motivo: 'nombre técnico de la clave de almacenamiento del consentimiento; igual en ambos idiomas' },
];
