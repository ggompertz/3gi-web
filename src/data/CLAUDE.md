# CLAUDE.md: oferta, precios y nomenclatura (`src/data/`)

La oferta vive solo en `oferta.mjs`. Nomenclatura pública, precios vigentes y segmento. Raíz: `../../CLAUDE.md`.

## Nomenclatura y precios en /precios (corregido 14/10/2026, PR #9 y #10)

- **El Test ERA es gratuito y NUNCA se llama "diagnóstico".** "Diagnóstico" es el nombre interno del servicio F1 de pago; la capa pública es **Radar Express / Radar 360 → Plan de Vuelo → Piloto Automático**. La nota de valor de `/precios` decía "el costo del Test ERA se descuenta de Plan de Vuelo" (falso: el Test ERA no cuesta); se refería al Radar. Corregido en `precios.astro` y `en/precios.astro`.

- **Política de descuento:** lo que el cliente paga por su Radar (Express o 360) se descuenta del precio del Plan de Vuelo si lo contrata dentro de los **90 días** siguientes a la entrega del informe.
- **El Radar NO incluye scoring, ROI ni PRD:** eso vive en Plan de Vuelo (desde USD 6.700; implementación aparte, 10 a 20% del ROI validado si supera USD 30.000). No prometer ROI cuantificado antes del Plan de Vuelo.
- **Precios vigentes (consultados 14/10/2026):** Radar Express USD 1.200-1.800 micro · 1.800-2.500 pequeña · 2.500-3.500 mediana · grande a cotizar; Radar 360 a cotizar (sin cifra en el sitio desde 2026-11-19; rangos internos por tamaño en el skill `ia-consultoria-pricing`, antes 6.000 plano); Data Foundation N1 800-2.500, N2 2.500-6.000, N3 6.000-15.000; Piloto Automático USD 1.500-2.500 / 2.500-4.500 / 4.500-8.000 al mes.
- **`<title>` SEO** separado del H1: ES "Precios de consultoría de IA para PyMEs · 3G Intelligence", EN "AI Consulting Pricing for SMBs · 3G Intelligence". El H1 sigue siendo "El Radar cuesta menos que un error de implementación".
- **Segmento: 2 a 50 empleados** (definitivo, Gonzalo 14 y 16/10/2026). Aplicado el 16/10 en `index`, `faq`, `metodologia` (ES y EN), tablas de traducción y JSON-LD de `Layout.astro`, y `public/llms.txt`. Las cifras de los casos (AMCL 5–10 empleados, distribuidora 10–15) son datos de clientes, no el segmento: no tocarlas. Pendiente: bloques en español dentro de `en/index.astro` (`faq3-a`, etc.) y revisar el segmento en `nosotros` (no declara rango).


## Oferta: fuente única, plantillas por idioma y guardia de contenido (2026-10-17)

**Dónde cambiar qué:**
- **Precios, plazos y condiciones** (Test ERA, Radar, Plan de Vuelo en 2 tramos, Data Foundation, Piloto Automático, ventana de 45 días, 10–20 % por hitos): SOLO en `src/data/oferta.mjs`. De ahí salen `/precios`, `/metodologia` (ES y EN) y `/llms.txt` (`src/pages/llms.txt.ts`, ya no existe `public/llms.txt`).
- **Textos** de `/precios` y `/metodologia`: `src/i18n/precios.mjs` y `src/i18n/metodologia.mjs` (`{ es, en }` por clave). Los precios y plazos van como `[[marcadores]]` (`radarDesde`, `pdvDesde`, `ventana`, `pct`, `testMin`, …; ver `tokens()` en `oferta.mjs`); un marcador desconocido rompe el build.
- **Estructura**: `src/components/pages/PreciosPage.astro` y `MetodologiaPage.astro` (una plantilla por página, prop `lang`); `src/pages/precios.astro`, `src/pages/en/precios.astro` y sus equivalentes de metodología son envoltorios de 10 líneas. **Ya no hay script de traducción en estas dos páginas**: lo que se ve es el HTML.
- Una página nueva con versión EN sigue el mismo patrón (plantilla + diccionario); no usar `data-i18n` ni tablas `T_*`.


- **Cifra de pérdidas definida por el dueño (sin fuente externa):** «pierde entre USD 30.000 y 100.000 anuales» en procesos automatizables, en el hero de la home y en el FAQ (ES y EN); declarada en `oferta.mjs` con su origen. Es una estimación de Gonzalo (2026-10-17), no un dato verificable: no presentarla como estadística de terceros.

- **Interruptor de la Academia (2026-11-19):** `src/data/academia.mjs` (`ACADEMIA_PUBLICADA`, `academiaVisible()`, `academiaNoindex()`, `FRASE_FAQ_ACADEMIA`). Tres estados: en construcción (hoy), revisión (`PUBLIC_ACADEMIA=1`) y publicada. La página `src/pages/academia.astro` existe siempre y `AcademiaPage.astro` muestra «Página en construcción» o el contenido completo según `academiaVisible()`. Lo leen además `Layout.astro` (ítem de menú y pie, solo ES), `llms.txt.ts` y el marcador `[[academiaFrase]]` de `fill()` en `oferta.mjs`. **No agregar claves de la Academia a la tabla `T` de `Layout.astro`:** quedarían dentro de todas las páginas aunque el interruptor esté apagado (lo detectó `npm run test:academia`). Con el ítem visible el menú lleva la clase `nav-6`: separación menor, WhatsApp solo con ícono y hamburguesa hasta 1100 px (con 6 ítems el logo se partía en dos líneas). Páginas solo en español: agregar su slug a `SOLO_ES` en `Layout.astro` para ocultar el selector de idioma.

