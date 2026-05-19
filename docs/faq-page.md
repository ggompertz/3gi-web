# Página /faq — Arquitectura y mantenimiento

## Propósito

Página de SEO/AEO orientada a capturar tráfico de búsqueda semántica:
- Preguntas que hacen dueños de PyMEs antes de contratar consultoría de IA
- Optimizada para Google rich snippets (FAQPage schema) y respuestas en ChatGPT/Perplexity

## Estructura

### 1. Sección Espejo (`#espejo`)
8 preguntas de **dolor operacional** — no tienen respuesta, solo generan reconocimiento.  
El prospecto se identifica antes de leer una sola respuesta. Funciona como activador emocional.

Principio: las preguntas que convierten combinan **dolor + dinero + tiempo + miedo a quedarse atrás**.

Ejemplos implementados:
- "¿Tu equipo trabaja todo el día... o apaga incendios todo el día?"
- "¿Qué pasará cuando tu competencia sí implemente IA?"
- "¿Cuántas decisiones importantes sigues tomando sin datos reales?"

### 2. FAQ por categorías
5 categorías, 4 preguntas cada una = 20 preguntas totales.

| Categoría | Objeción que resuelve |
|---|---|
| Dinero y ROI | "¿Es caro? ¿Vale la pena?" |
| Tiempo y proceso | "¿Cuándo veo resultados?" |
| ¿Es para mi empresa? | "¿Funciona para PyMEs / mi rubro?" |
| El momento de actuar | "¿Qué pasa si espero?" |
| Cómo trabajamos | "¿Quién hace el trabajo?" |

## Schema JSON-LD

La página tiene su propio `FAQPage` schema con 8 preguntas (las más buscadas).  
El `Layout.astro` tiene un segundo schema global con 5 preguntas base.

**Mantener sincronizados:** si se actualiza una respuesta en el HTML, actualizar también el JSON-LD.

## Cómo agregar preguntas

1. Agregar `<div class="faq-item">` dentro del `<div class="faq-list">` de la categoría correspondiente
2. Seguir el patrón: `faq-q-btn` > `faq-ans` > `faq-ans-inner`
3. Agregar la pregunta al schema JSON-LD al final del archivo
4. Si es una pregunta muy relevante para SEO, agregarla también al schema en `Layout.astro`

## Criterio para incluir una pregunta

La pregunta debe cumplir al menos uno:
- Combina dolor operacional + consecuencia económica
- Genera miedo a quedarse atrás (competencia, mercado)
- Resuelve una objeción de compra real documentada
- Tiene búsqueda semántica probable en Google/ChatGPT

## Nav

`/faq` está en el nav principal (desktop y mobile). Si se reordena el nav, mantener FAQ visible — es un punto de entrada importante para prospectos en fase de evaluación.
