# 3GI Web — Sitio público de 3G Intelligence

Sitio web de [3gi.cl](https://3gi.cl) — consultora de IA para PyMEs latinoamericanas.

## Stack

- **Framework:** Astro (SSG)
- **Estilos:** CSS global en `Layout.astro` (sin framework CSS)
- **Tipografía:** Syne (display) + DM Sans (body) — Google Fonts
- **Deploy:** Cloudflare Pages (Direct Upload via Wrangler)
- **Analytics:** Google Tag Manager (`GTM-PC7C2ZZQ`)

## Estructura

```
src/
  layouts/
    Layout.astro        ← Componente base: head, nav, footer, CSS global, schemas JSON-LD
  pages/
    index.astro         ← Homepage
    faq.astro           ← Página FAQ (espejo de dolor + 20 preguntas por categoría)
    metodologia.astro   ← Metodología F1–F5
    precios.astro       ← Inversión y precios
    casos.astro         ← Casos reales
    nosotros.astro      ← Equipo
    contenido.astro     ← Blog / contenido semanal
    diagnostico.astro   ← CTA principal al diagnóstico
    framework.astro     ← Framework 3 ERAs detallado
    privacidad.astro    ← Política de privacidad
public/                 ← Imágenes estáticas, robots.txt, sitemap
dist/                   ← Build output (no commitear)
```

## Branding

| Token | Valor |
|---|---|
| Verde principal | `#00E891` |
| Fondo | `#06060D` |
| Fondo secundario | `#0D0D1A` |
| Fondo terciario | `#141422` |
| Texto | `#EEF1F6` |
| Texto muted | `rgba(238,241,246,0.45)` |
| Display | Syne 700/800 |
| Body | DM Sans 300/400/500 |

## Nomenclatura obligatoria

- **ERAs siempre en mayúsculas:** ERA 1, ERA 2, ERA 3
- **Nunca "Etapa":** usar Diagnóstico, F1, F2, F3, F4, F5
- **CTA principal:** `/test-era` — nunca Calendly directo ni `/pre-scan`

## Páginas y propósito

| Página | Propósito | CTA principal |
|---|---|---|
| `/` | Conversión — dolor → ERAs → metodología → caso → FAQ → diagnóstico | `/test-era` |
| `/faq` | SEO/AEO — responder objeciones de compra B2B | `/test-era` + WhatsApp |
| `/metodologia` | Educación — detalle F1–F5 | Agendar llamada |
| `/precios` | Cierre — precio fijo + ROI justificado | Calendly |
| `/casos` | Prueba social — casos reales anonimizados | Ver diagnóstico |
| `/framework` | Autoridad — detalle del Framework 3 ERAs | `/test-era` |
| `/test-era` | Landing de entrada al test ERA gratuito | Quiz inline |

## SEO / AEO

`Layout.astro` incluye dos schemas JSON-LD globales:

1. `ProfessionalService` — datos de la empresa, `hasOfferCatalog`, `founder`, `sameAs`
2. `FAQPage` — 5 preguntas de conversión (duplicadas en `/faq` con 8 preguntas adicionales)

La página `/faq` tiene su propio schema `FAQPage` con 8 preguntas orientadas a búsqueda semántica (ChatGPT, Perplexity, Google AI Overviews).

## i18n

El sitio tiene soporte ES/EN. El idioma se gestiona con:
- Objeto `T = { es: {...}, en: {...} }` al final de cada página
- Función `applyLang(lang)` que recorre `data-i18n` attributes
- Toggle en el nav persiste en `localStorage`

Al agregar texto nuevo visible al usuario, agregar la key en ambos idiomas.

## Deploy

```bash
# Build
npm run build

# Deploy a Cloudflare Pages
npx wrangler pages deploy dist --project-name=3gi-web --commit-dirty=true
```

El proyecto en Cloudflare Pages se llama `3gi-web` (sirve 3gi.cl, www.3gi.cl y 3g-ia-agents.com). El proyecto `3g-ia-agents` es un proyecto Pages distinto y NO sirve tráfico de producción — no usarlo para deploys.

## Contenido semanal

Las publicaciones de redes sociales se agregan en `src/pages/contenido.astro` **al inicio** del `.content-grid`. Cada tarjeta incluye: título, fecha, descripción, imagen y links a redes.

Las imágenes van en `contenido/semanaX-nombre.png`.

## Variables de entorno

No hay variables de entorno en este repo — es un sitio estático. Todo el contenido dinámico (diagnóstico, portal) vive en repos separados.
