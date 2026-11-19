# Plan: reposicionamiento de servicios y Academia 3GI

Versión 1 · 2026-11-19 · borrador. Viene de [spec.md](spec.md) (← [intent.md](intent.md)). Cada chunk es de menos de 2 h y se puede desplegar solo. Estado (2026-11-19): chunks 0 a 4 hechos y fusionados (PR #36 división del `CLAUDE.md`, #37 chunks 1 y 2, #38 chunk 3). La Academia sigue apagada. Pendiente: la apertura (ver más abajo) y el seguimiento en Search Console.

## Límites para quien implemente
- **Siempre:** seguir `frontend-astro.md`; rama nueva desde `master` y PR (nunca directo a `master`); textos solo en `src/i18n/*.mjs`; correr el build con las tres guardias; probar ES y EN en el HTML crudo y en el navegador (`innerText`); commits en español, con archivos específicos en `git add`.
- **Preguntar antes:** cambiar variables de entorno en Cloudflare Pages; agregar dependencias; tocar `/terminos` o `/privacidad`; publicar la Academia (encender el interruptor); cambiar `_redirects`, `_headers` o `robots.txt`.
- **Nunca:** leer o escribir secretos o `.env`; escribir «[skip ci]» en un mensaje de commit; usar `data-i18n` para contenido de página; mostrar F1 a F5 o «Etapa» al público; dar un deploy por bueno sin verificar el commit desplegado.

## Chunks

| Chunk | Contenido | Requisitos | Criterio |
|---|---|---|---|
| **0. Verificar** (30 min) | Probar `injectRoute` condicional en el build estático; confirmar con Gonzalo si Cloudflare Pages permite variables solo en vista previa y si esas vistas quedan protegidas | RF-07 | Premisas «no verificadas» pasan a verificadas, o se cambia el mecanismo (alternativa: archivo en `src/paginas-pendientes/` y un script de build que lo copia) |
| **1. Guardia y textos** (1,5 h) | Acotar `DIAGNOSTICO` con autopruebas (positiva y negativa); x-051, x-052, x-053, `hero-tag`, `faq5-a`, `faqp-c5a1` en ES y EN; JSON-LD del FAQ sincronizado | RF-01 a RF-04, RF-06 | Build verde; controles negativos fallan como deben (español en EN, «implementación incluida», «diagnóstico» como sustantivo) |
| **2. Metadatos y rastreo** (1 h) | `Layout.astro` (título y descripción por defecto, JSON-LD del servicio y `OfferCatalog`), `llms.txt.ts`, `lastmod` del sitemap, `README.md`, `CLAUDE.md`; `/nosotros` solo si Gonzalo lo confirma | RF-05, RF-10, RF-11, RF-12 | `dist/llms.txt` sin «es una consultora»; sitemap con fechas nuevas |
| **3. Interruptor, página y menú** (2 h) | `src/data/academia.mjs`, ruta `/academia` condicionada, ítem de menú en los 3 sitios con claves ES/EN, ocultar el selector EN sin versión EN, frase de la Academia en FAQ y `llms.txt` condicionada | RF-07 a RF-09 | Apagado: producción sin rastro visible de la Academia. Encendido (vista previa): página, menú y frases presentes y guardias verdes |
| **4. Cierre** (30 min) | Revisión visual a 375, 768, 901, 1100, 1239 y 1366 px; verificar el commit desplegado en Cloudflare y la URL pública; handoff en `my-config/handoffs/` | RNF-01 a RNF-04 | Sin scroll horizontal ni errores de consola; commit desplegado = el del PR |

Orden: 0, 1, 2 salen en el primer PR (reposicionamiento de servicios). El 3 puede ir en el mismo PR o en uno aparte, siempre apagado.

## Apertura de la Academia (otro PR, cuando se cumpla todo)
Condiciones: (1) INAPI para «Academia 3GI» y «Saca Valor a la IA»; (2) revisión legal de términos y privacidad de la Academia; (3) alias de correo propio y fin de `CORREO_PERMITIDOS`; (4) plan de Vercel apto para uso comercial; (5) tareas programadas con envío real probado; (6) decisión de precio e inscripción; (7) textos de `/academia` aprobados por Gonzalo.
Acciones: `ACADEMIA_PUBLICADA` a `true`; entrada de `/academia` en `sitemap.xml`; línea de `llms.txt`; redirección de la raíz de `academia.3gi.cl` a `https://3gi.cl/academia`; variable de entorno de Cloudflare si se usó; **quitar el `noindex` por defecto de `app/layout.tsx` en `3gi-learning`** (puesto el 2026-11-19; sin quitarlo la inscripción, los términos y la privacidad de la Academia no se indexan); subir la versión de plantilla del módulo a v3 en el panel si aún no se hizo; verificar en producción.

## Trabajo relacionado en otros repositorios (fuera de este PR)
- `3gi-learning`: título de la pestaña «3G Intelligence · Capacitaciones» → «Academia 3GI»; redirección de la raíz al abrir (hoy es una página mínima con el nombre viejo, sin `noindex`; la nota anterior que decía «cuerpo 404» era un error: esa era la respuesta de `/robots.txt`).
- Diploma: pendiente de decisión de Gonzalo el pie «3G Intelligence · Movemos tu empresa de una ERA a otra» (propuesta: «3G Intelligence · Academia»); implica `plantilla_version` v3.
- Lista para el abogado: `/terminos` y `/privacidad` de 3gi.cl dicen «consultora» y «consultoría»; la Academia necesita sus propios términos y privacidad.

## Decisiones pendientes de Gonzalo
1. Texto en inglés de la frase y del FAQ. **Resuelta: aprobado (Gonzalo, 2026-11-19).**
2. RF-11: `/nosotros` solo título y meta. **Resuelta: sí (Gonzalo, 2026-11-19).**
3. Título y descripción de la home sin «consultoría», como hoy. **Resuelta: sí (Gonzalo, 2026-11-19).**
4. Texto de `/academia`. **Resuelta: aprobado (Gonzalo, 2026-11-19).**
5. División del `CLAUDE.md` de 3gi-web. **Resuelta: se hace antes, en la rama `chore/dividir-claude-md` (Gonzalo, 2026-11-19).** Este plan se implementa después de fusionarla.

## Registro del chunk 1 (2026-11-19)
- Guardia de «diagnóstico» acotada: acepta diagnosticamos, diagnosticar, diagnosticando y diagnosticaremos; sigue marcando diagnóstico, diagnóstica, diagnósticos, diagnostica y diagnosis. Mutación comprobada: con la expresión antigua fallan 3 pruebas.
- Textos aprobados aplicados en `src/i18n/home.mjs` (x-051, x-052, x-053, `hero-tag`, `faq5-a`), `src/i18n/faq.mjs` (`faqp-c5a1`) y el JSON-LD del FAQ en `Layout.astro`, en ES y EN. Verificado: la respuesta del JSON-LD aparece idéntica en el texto visible de las 4 páginas.
- Controles negativos: español dentro del inglés, «implementación incluida» y «diagnóstico» como sustantivo hacen fallar el build en la guardia correspondiente.
- Revisión en navegador (375 px, 768 y 1366): sin errores; las peticiones externas se bloquearon para no escribir en el Supabase del embudo.
- **Hallazgo previo, no causado por este cambio:** la home (ES y EN) a 375 px tiene scroll horizontal (ancho 402 contra 360; banner del libro, botón «Ver cómo se recuperaron…» y el texto final). Idéntico en `master`. `/faq` no lo tiene.
- **Para decidir:** el titular nuevo ocupa 6 líneas en escritorio y 9 en móvil (antes unas 4). Opciones: reducir su tamaño de letra o dejar la segunda frase en tamaño menor.
- Sin tocar: x-055 («Entendemos el negocio antes de hablar de tecnología…») repite la idea del titular nuevo; decidir si se ajusta.

## Registro del chunk 2 (2026-11-19)
- Decisiones de Gonzalo: titular reducido de tamaño; x-055 ajustado. Titular con `font-size: clamp(21px, 2.9vw, 35px)` solo en ese bloque (antes 46 px y 26 px): 4 líneas en escritorio (antes 6) y 8 a 9 en móvil (antes 9).
- x-055 ES: «Ventas, operaciones, ERP, equipos. Conocemos el negocio por dentro: eso es lo que pocos consultores de IA tienen.» EN: «Sales, operations, ERP, teams. We know the business from the inside: something few AI consultants have.»
- `Layout.astro`: descripción por defecto (conserva «Consultoría» y el título por defecto), `description` y `OfferCatalog` del JSON-LD del servicio en ES y EN.
- `llms.txt.ts`: presentación como servicios de IA, sin «consultora»; línea de Nosotros.
- `/nosotros` (ES y EN): solo título y descripción meta. Textos nuevos escritos por Claude, por revisar en el PR.
- `public/sitemap.xml`: `lastmod` 2026-11-19 en la home, `/faq` y `/nosotros` (ES y EN). `README.md` y `CLAUDE.md` (raíz y `src/integrations/`) actualizados.
- Menciones de «consultor» que quedan a propósito: `/terminos` y `/privacidad` (textos legales, para el abogado), títulos meta de `/precios` y `/faq`, comparaciones de `/metodologia`, relato personal de `/nosotros`, página del libro y «Consultor dedicado, no software».
- Verificado: build con las tres guardias en verde; las 7 frases viejas dan 0 resultados en `dist/`.

## Registro del chunk 3 (2026-11-19)
- **Hecho:** `src/data/academia.mjs` (interruptor, apagado), integración `academia-condicional`, página `src/paginas-pendientes/academia.astro` con plantilla `AcademiaPage.astro` y diccionario `src/i18n/academia.mjs` (solo ES, texto aprobado, sin botones ni enlaces), ítem de menú en escritorio, móvil y pie (solo ES), frase del FAQ vía `[[academiaFrase]]` (home, `/faq` y JSON-LD), línea de `llms.txt`, selector ES/EN oculto en páginas `SOLO_ES`, `noindex` cuando se enciende solo por variable de entorno.
- **Prueba:** `npm run test:academia` construye apagado y encendido y comprueba 17 cosas; pasan todas. En su primera corrida detectó un error mío: las claves `nav-academia` en la tabla `T` dejaban «Academia» dentro de todas las páginas con el interruptor apagado; se quitaron.
- **Hallazgo y corrección:** con 6 ítems el menú no cabía: a 1366 px el logo se partía en dos líneas y «Academia» tocaba el selector de idioma (con 5 ítems había 44 px de holgura; con 6, cero). Medido y corregido con la clase `nav-6` (separación de 20 px, WhatsApp solo ícono y hamburguesa hasta 1100 px). Holgura medida después: 32 a 69 px en la home y 78 a 115 px en `/academia` desde 1101 px.
- **Revisión visual** a 375, 768, 901, 960, 1000, 1100, 1101, 1239, 1240, 1366 y 1600 px, con las peticiones externas bloqueadas. Menú de hamburguesa: 6 ítems en ES, 5 en EN, y sin selector de idioma en `/academia`.
- **No hecho a propósito:** `/academia` no está en `sitemap.xml` (se agrega solo al abrir) ni hay redirección de `academia.3gi.cl` (también al abrir).
- **Pie de página:** con el enlace «Academia» los enlaces del pie pasan a dos filas a 1366 px; se ve centrado y legible.
- **Control de no regresión:** con el interruptor apagado, el sitio generado es idéntico al de `origin/master` (34 archivos html, txt y xml comparados, sin CSS ni la clave pública de PostHog: 0 diferencias, ninguno nuevo).

## Registro del chunk 4: cierre (2026-11-19)
- PR #38 fusionado (63bb881). Verificado en `https://3gi.cl` en vivo, sin caché: la hoja de estilos desplegada trae la regla `nav-6` del PR #38; la frase aprobada, el encabezado y x-055 están en ES y EN; las frases viejas no aparecen; el JSON-LD del FAQ coincide con el texto visible; `llms.txt` y `sitemap.xml` actualizados; `/academia` y `/en/academia` responden 404.
- Ninguna de las 26 URLs del sitemap, ni `llms.txt`, `robots.txt` o `sitemap.xml`, menciona la Academia.
- No verificado: el identificador del despliegue en el panel de Cloudflare (se comprobó por el contenido publicado, no por el panel).
- **Seguimiento recomendado en Search Console** (a los 7, 14 y 28 días): consultas, impresiones y posición de `/`, `/faq`, `/nosotros` y sus versiones EN, y el informe de fragmentos enriquecidos de preguntas frecuentes, porque cambiaron títulos, descripciones y la respuesta del FAQ en el JSON-LD. Si cae el tráfico de consultas como «consultoría de IA», reponer el término en el cuerpo y en los títulos meta. No se tomó una línea base antes del cambio.
- Pendiente aparte: el scroll horizontal de la home a 375 px (anterior a este cambio).

