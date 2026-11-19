# CLAUDE.md: textos e idiomas ES/EN (`src/i18n/`)

Cómo se escribe el contenido bilingüe y el glosario de marca. La guardia de idioma está en `src/integrations/CLAUDE.md`. Raíz: `../../CLAUDE.md`.

## i18n — arquitectura y bug histórico (corregido 23/09/2026)

**Cómo funciona hoy:** cada ruta `/en/<page>` es un archivo Astro **separado** de su equivalente
`/es/<page>` (no hay una sola página que cambie de idioma dinámicamente). El toggle ES/EN del nav
(`Layout.astro`) navega con `window.location.href`, no cambia estado client-side. Por lo tanto,
**el texto de cada página debe estar hardcodeado en el idioma correcto directamente en el HTML
que genera Astro** — no debe depender de JavaScript para mostrarse correctamente.


**Regla para páginas EN nuevas o modificadas**: nunca usar `data-i18n` + script de traducción para
el contenido propio de una página — escribir el texto en inglés directamente en el archivo
`.astro` de `/en/`. Si se usa un script de reemplazo automatizado (ver commit `d5fced4` en
`my-config/handoffs/2026-09-23_3gi-web-i18n-server-side-en-pages.md` para el patrón completo), no
asumir que cada clave aparece una sola vez en el archivo — verificar con un escaneo de
consistencia entre ocurrencias duplicadas antes de dar el fix por terminado.


**Glosario de marca ES → EN** (confirmado con Gonzalo 23/09/2026, no reinventar):

| Español | Inglés |
|---|---|
| Radar (Express / 360) | Radar (Express / 360) — sin traducir |
| Test ERA | ERA Test |
| Plan de Vuelo | Flight Plan |
| Piloto Automático | Autopilot |
| Diagnóstico (genérico) | Diagnosis (NO confundir con "Test ERA" — son términos distintos en inglés aunque en español a veces se usan indistintamente) |
