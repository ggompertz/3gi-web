# Plan: reposicionamiento de servicios y Academia 3GI

Versión 1 · 2026-11-19 · borrador. Viene de [spec.md](spec.md) (← [intent.md](intent.md)). Cada chunk es de menos de 2 h y se puede desplegar solo. Estado de cada uno: pendiente (nada implementado todavía).

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
Acciones: `ACADEMIA_PUBLICADA` a `true`; entrada de `/academia` en `sitemap.xml`; línea de `llms.txt`; redirección de la raíz de `academia.3gi.cl` a `https://3gi.cl/academia`; variable de entorno de Cloudflare si se usó; verificar en producción.

## Trabajo relacionado en otros repositorios (fuera de este PR)
- `3gi-learning`: título de la pestaña «3G Intelligence · Capacitaciones» → «Academia 3GI»; redirección de la raíz al abrir (hoy responde 200 con cuerpo 404).
- Diploma: pendiente de decisión de Gonzalo el pie «3G Intelligence · Movemos tu empresa de una ERA a otra» (propuesta: «3G Intelligence · Academia»); implica `plantilla_version` v3.
- Lista para el abogado: `/terminos` y `/privacidad` de 3gi.cl dicen «consultora» y «consultoría»; la Academia necesita sus propios términos y privacidad.

## Decisiones pendientes de Gonzalo
1. Texto en inglés de la frase y del FAQ (propuesto en `spec.md`).
2. RF-11: ¿`/nosotros` solo título y meta?
3. Título y descripción de la home: ¿se dejan sin «consultoría», como hoy?
4. Texto de `/academia` (borrador en `spec.md`).
5. División del `CLAUDE.md` de 3gi-web (42,7 KB): trabajo aparte.
