// Usos de «diagnóstico / diagnosis» que SÍ se mantienen en el sitio (los revisa src/integrations/guardia-diagnostico.mjs).
// Regla (2026-10-14): «Diagnóstico» es el nombre INTERNO del servicio de pago; el público es Radar → Plan de Vuelo → Piloto Automático
// y el Test ERA es gratis y NUNCA se llama «diagnóstico». Política pragmática (Gonzalo, 2026-10-22): se mantiene la palabra como
// término genérico del método, citas de clientes, piezas editoriales y el marco del libro; se reemplaza cuando nombra un servicio.
// Cada entrada: página del build ('casos/index.html'), fragmento del texto (sin distinguir mayúsculas) y MOTIVO.
// Las entradas «TEMPORAL» se retiran cuando se resuelve lo pendiente. Las páginas del Test ERA NO admiten excepciones.
export const PERMITIDOS_DIAGNOSTICO = [
  { pagina: "casos/index.html", texto: "\"Antes de este diagnóstico no teníamos claridad sobre qué automatizar", motivo: "cita textual de un cliente o descripción de un caso real; no nombra un servicio" },
  { pagina: "casos/index.html", texto: "La empresa sabía que había ineficiencias pero no tenía claridad sobre", motivo: "cita textual de un cliente o descripción de un caso real; no nombra un servicio" },
  { pagina: "casos/index.html", texto: "Lo que cambió todo fue una revisión interna. Alguien encontró", motivo: "cita textual de un cliente o descripción de un caso real; no nombra un servicio" },
  { pagina: "casos/index.html", texto: "Sobre la inversión total en diagnóstico e implementación", motivo: "cita textual de un cliente o descripción de un caso real; no nombra un servicio" },
  { pagina: "contenido/index.html", texto: "35 min → 3 min por presupuesto, USD 250.000 recuperados en cobros", motivo: "título de una pieza editorial publicada en redes (uso genérico)" },
  { pagina: "contenido/index.html", texto: "4 de cada 5 proyectos de IA fracasan, y casi nunca es por la", motivo: "título de una pieza editorial publicada en redes (uso genérico)" },
  { pagina: "contenido/index.html", texto: "Dos empresas, el mismo diagnóstico pendiente: no sabían cuál era su", motivo: "título de una pieza editorial publicada en redes (uso genérico)" },
  { pagina: "contenido/index.html", texto: "El diagnóstico no basta: hay que acompañar la ejecución", motivo: "título de una pieza editorial publicada en redes (uso genérico)" },
  { pagina: "contenido/index.html", texto: "Las 10 preguntas que hago en todo diagnóstico antes de recomendar", motivo: "título de una pieza editorial publicada en redes (uso genérico)" },
  { pagina: "en/casos/index.html", texto: "\"Before this diagnosis we had no clarity on what to automate first.", motivo: "cita textual de un cliente o descripción de un caso real; no nombra un servicio" },
  { pagina: "en/casos/index.html", texto: "On total investment in diagnosis and implementation", motivo: "cita textual de un cliente o descripción de un caso real; no nombra un servicio" },
  { pagina: "en/casos/index.html", texto: "The company knew there were inefficiencies but had no clarity on what", motivo: "cita textual de un cliente o descripción de un caso real; no nombra un servicio" },
  { pagina: "en/casos/index.html", texto: "What changed everything was an internal review. Someone found", motivo: "cita textual de un cliente o descripción de un caso real; no nombra un servicio" },
  { pagina: "en/contenido/index.html", texto: "\"El diagnóstico no basta: hay que acompañar la ejecución\"", motivo: "título de una pieza editorial publicada en redes (uso genérico)" },
  { pagina: "en/contenido/index.html", texto: "A diagnosis isn't enough — you need to see it through", motivo: "título de una pieza editorial publicada en redes (uso genérico)" },
  { pagina: "en/index.html", texto: "Implementing AI without a diagnosis is guesswork. Companies that fail", motivo: "uso genérico del método («empieza con diagnóstico»), decidido por Gonzalo el 2026-10-22" },
  { pagina: "en/inteligencia-organizacional/index.html", texto: "\"AI doesn't transform companies. Organizational structure determines", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "en/inteligencia-organizacional/index.html", texto: "A framework for diagnosis and action", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "en/inteligencia-organizacional/index.html", texto: "Diagnostic signals, common mistakes, typical leadership profile, and", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "en/inteligencia-organizacional/index.html", texto: "Its foundation in Bertalanffy's systems theory, its two diagnostic", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "en/inteligencia-organizacional/index.html", texto: "Professionals accompanying organizational maturity processes who need", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "en/metodologia/index.html", texto: "Does it start with a diagnosis or does it already have the solution?", motivo: "uso genérico del método («empieza con diagnóstico»), decidido por Gonzalo el 2026-10-22" },
  { pagina: "en/metodologia/index.html", texto: "Starts with diagnosis", motivo: "uso genérico del método («empieza con diagnóstico»), decidido por Gonzalo el 2026-10-22" },
  { pagina: "en/privacidad/index.html", texto: "3G Intelligence is an artificial intelligence consultancy offering", motivo: "TEMPORAL: texto legal pendiente de revisión externa (revision-privacidad.md); retirar al fusionar el PR de privacidad" },
  { pagina: "en/privacidad/index.html", texto: "To generate internal diagnostic reports", motivo: "TEMPORAL: texto legal pendiente de revisión externa (revision-privacidad.md); retirar al fusionar el PR de privacidad" },
  { pagina: "index.html", texto: "Implementar IA sin diagnóstico es adivinar. Las empresas que fallan", motivo: "uso genérico del método («empieza con diagnóstico»), decidido por Gonzalo el 2026-10-22" },
  { pagina: "inteligencia-organizacional/index.html", texto: "\"La IA no transforma empresas. La estructura organizacional determina", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "inteligencia-organizacional/index.html", texto: "El diagnóstico del problema central y por qué el ecosistema evita", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "inteligencia-organizacional/index.html", texto: "Profesionales que acompañan procesos de madurez organizacional y", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "inteligencia-organizacional/index.html", texto: "Señales diagnósticas, errores frecuentes, perfil de liderazgo típico", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "inteligencia-organizacional/index.html", texto: "Su fundamento en la teoría de sistemas de Bertalanffy, sus dos", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "inteligencia-organizacional/index.html", texto: "Un marco de diagnóstico y acción", motivo: "marco teórico del libro (uso conceptual)" },
  { pagina: "metodologia/index.html", texto: "Empieza con diagnóstico", motivo: "uso genérico del método («empieza con diagnóstico»), decidido por Gonzalo el 2026-10-22" },
  { pagina: "metodologia/index.html", texto: "¿Empieza con diagnóstico o ya trae la solución?", motivo: "uso genérico del método («empieza con diagnóstico»), decidido por Gonzalo el 2026-10-22" },
  { pagina: "privacidad/index.html", texto: "3G Intelligence es una consultora de inteligencia artificial que", motivo: "TEMPORAL: texto legal pendiente de revisión externa (revision-privacidad.md); retirar al fusionar el PR de privacidad" },
  { pagina: "privacidad/index.html", texto: "Generar reportes internos de diagnóstico", motivo: "TEMPORAL: texto legal pendiente de revisión externa (revision-privacidad.md); retirar al fusionar el PR de privacidad" },
];
