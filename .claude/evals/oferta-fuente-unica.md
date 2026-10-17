# Eval: oferta de 3GI en una sola fuente + guardia de contenido

**Alcance:** `src/data/oferta.ts`, `src/pages/llms.txt.ts`, `src/integrations/guardia-contenido.mjs`, y (chunks siguientes) plantillas únicas de `/precios` y `/metodologia` (ES y EN).

## Criterios de aceptación
1. Todo precio, duración, plazo y porcentaje de la oferta vive en `src/data/oferta.ts`; ninguna página lo repite a mano (chunks 2 y 3) y `llms.txt` se genera desde ahí.
2. `astro build` FALLA con un mensaje claro si el HTML generado contiene: F1–F5, «Etapa», E1–E3, voseo o regionalismos, el segmento obsoleto (5–200, 10–200), duraciones obsoletas del Test ERA, afirmaciones sin fuente, nombres de producto con «Diagnóstico/Diagnosis» aplicados al Test ERA, o un monto en USD que no esté en `oferta.ts`.
3. El guardia corre aunque Cloudflare use otro comando de build (va como integración de Astro, no en `package.json`).
4. Un cambio de precio en `oferta.ts` se refleja en español, inglés y `llms.txt` sin tocar más archivos (chunks 2 y 3).

## Regresión
- `/precios`, `/metodologia` y sus versiones `/en/` muestran el mismo texto visible que antes de la refactor (comparación de `innerText` en navegador real, ES y EN), salvo diferencias listadas y aprobadas.
- `/llms.txt` sigue respondiendo 200 `text/plain`.
- El build limpio (`npm ci && npm run build`) pasa sin errores.

## Prueba negativa
- Introducir a propósito un «acá» o un precio no declarado y comprobar que el build falla (y revertir).
