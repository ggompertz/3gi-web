# Política de revisión (REVIEW.md)

Lo lee el revisor independiente (`/verify pre-pr`, fase 9) y quien revise un PR de este repo. Revisa el cambio contra estas reglas, sin conocer la conversación que lo produjo.

## Pasadas
Etiqueta cada hallazgo con su pasada:
1. **Errores**: lógica incorrecta, casos borde, regresiones, errores tragados que ocultan una falla, tests que no prueban lo que dicen o que pasarían aunque la protección no existiera.
2. **Seguridad**: autenticación y permisos, filtrado por usuario o tenant, secretos, datos personales en logs o errores, entradas sin validar.
3. **Cumplimiento**: reglas de este proyecto (abajo y en su `CLAUDE.md`), el plan o handoff del cambio si existe, y los estándares de `my-config/standards/`.

## Qué es Importante
Reserva **Importante** para lo que rompe un comportamiento, expone datos, incumple una regla de seguridad o de nomenclatura pública, o deja un test que no protege nada. Todo lo demás es detalle (nit).
- Una ruta que exige credenciales debe **autenticar antes de validar el recurso** (formato del id, consulta a la base). Excepciones solo las registradas en `my-config/standards/seguridad-rutas.md`.
- Una consulta con `service_role` o `supabaseAdmin` sin chequeo de rol o tenant en el código es Importante: esa credencial salta la protección de la base de datos.
- Un secreto, token o clave escritos en el código, o impresos en un log o error, es Importante.
- Texto visible al cliente con nomenclatura interna (F1 a F5, «Etapa», «Diagnóstico Profundo», «Post-Scan»), con «ERA» fuera de mayúsculas, o con voseo o chilenismos, es Importante.

## Tope de detalles
Informa como máximo **5 detalles**; del resto, solo cuántos hay. Los detalles de estilo y nombres no sustituyen a los hallazgos Importantes.

## No reportar
Archivos generados (`.next/`, `dist/`, `node_modules/`, `package-lock.json`), el historial movido (`docs/claude-md/historial.md`) y lo que el formateador o el linter del CI ya impone.

## Reglas de este proyecto (Astro, sitio público)
- **i18n**: el contenido de una página está en el idioma de la página en el HTML crudo. `data-i18n` con un script de traducción para el contenido es Importante (el HTML que indexa Google quedaría en español).
- **Nomenclatura pública** única (Test ERA, Radar, Plan de Vuelo, Piloto Automático) y ERA en mayúsculas. La guardia de contenido falla el build ante nomenclatura interna; no se debilita ni se rodea.
- **Consentimiento**: sin consentimiento aceptado no se escribe nada en el navegador (el ID de sesión vive solo en memoria). Un cambio en `funnel-track.js` que guarde datos antes del consentimiento es Importante.
- Las variables `PUBLIC_` nunca llevan secretos: quedan en el bundle.
- Una cifra o monto no se reemplaza por su marcador `[[x]]` solo porque el número coincide.
- Móvil: probar en 480 y 640 px; las tablas anchas pasan a tarjetas, no a scroll horizontal.
