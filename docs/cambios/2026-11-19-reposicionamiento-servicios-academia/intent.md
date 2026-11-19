# Intención: reposicionamiento de servicios y Academia 3GI en 3gi.cl

Versión 1 · 2026-11-19 · estado: borrador aprobado en lo esencial por Gonzalo (ver «Decisiones»). Siguiente: [spec.md](spec.md) → [plan.md](plan.md).

## Qué se pidió y para quién
Gonzalo Gompertz (fundador). Separar en la web la marca madre 3G Intelligence en dos líneas, **Servicios para empresas** (Radar, Plan de Vuelo, Piloto Automático) y **Academia 3GI** (programa «Saca Valor a la IA»), y dejar de presentarse solo como «consultores», porque la empresa también construye y acompaña la operación. Público: dueños y gerentes de PyMEs y empresas medianas (servicios) y profesionales y dueños de cualquier rubro (academia).

## Decisiones de Gonzalo (2026-11-19)
- Frase aprobada: «Entendemos tu negocio antes de hablar de IA. Después diagnosticamos, construimos y te acompañamos en la operación.»
- Encabezado «Consultoría de IA para PyMEs» pasa a servicios de IA para empresas; «consultoría» se conserva en el título de pestaña y en la descripción meta donde ya está.
- FAQ «¿Quién hace el trabajo?» reescrito (ver spec).
- La Academia se nombra en el repositorio y los documentos ahora, **pero no se muestra al público** hasta que esté lista. Tiene una página corta preparada, detrás de un interruptor.
- Página solo en español, en `3gi.cl/academia`; al abrir, la raíz de `academia.3gi.cl` redirige a ella. **Sin botones** por ahora.

## Triage (3gi-blueprint)
Tier 2 (página nueva dentro de un proyecto existente). Corren: PRD y TRD fusionado, premisas y evidencia, UI/UX brief mínimo (una página y un ítem de menú) y plan. Se saltan: flujo de app (una sola pantalla nueva) y esquema backend (no hay base de datos). Memoria de Soluciones: sin reuso directo; la lección «el español se cuela en EN» se usa como prueba de control.

## Non-goals
- Textos legales (`/terminos`, `/privacidad`): no se tocan; van a la revisión del abogado.
- Formulario, lista de espera, precios, fechas o inscripción de la Academia.
- Versión en inglés de la Academia.
- Renombrar la consultoría o cambiar el logo y su lema.
- `/metodologia`, el libro y «Consultor dedicado, no software»: se mantienen.
- Dividir el `CLAUDE.md` de 3gi-web (42,7 KB, sobre el umbral): trabajo aparte.
