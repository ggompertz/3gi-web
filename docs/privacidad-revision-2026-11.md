# Política de privacidad — borrador para revisión legal (versión 2026-11)

**Estado: borrador. No publicar hasta que lo revise un abogado y lo apruebe Gonzalo.** Este documento no es asesoría legal: resume qué cambió, qué se decidió y qué no se pudo verificar.
Rama: `docs/privacidad-radar-previo` · Páginas: `src/pages/privacidad.astro` (ES) y `src/pages/en/privacidad.astro` (EN).

## Por qué se cambia
El formulario «Preparación del Radar» (`/radar/previo/`) recoge información de la empresa y datos de contacto antes de la reunión. La política vigente (octubre 2026) cubría el Test ERA y el seguimiento comercial, pero no ese cuestionario, no identificaba a la sociedad responsable y no definía qué pasa con los datos de quien no contrata. La Ley 21.719 entra en vigencia el **1 de diciembre de 2026** (BCN, versión 2026-12-01).

## Qué cambia (los mismos 8 puntos en ES y EN)
1. **Fecha y versión:** «noviembre 2026 · Versión 2026-11» (la ley pide fecha y versión de la política).
2. **§1 Responsable:** «3G Intelligence es el nombre comercial de 3GI SpA, RUT 78.388.535-2, con domicilio en Viña del Mar, Chile, representada por Gonzalo Gompertz Geldres». Contacto único: **chat@3gi.cl** (antes gonzalo@3gi.cl; cambiado también en la frase de derechos de la §6).
3. **§2 Datos:** nuevo punto sobre el cuestionario («No te pedimos datos personales de tus clientes»).
4. **§3 Finalidades:** preparar y realizar el Radar y la propuesta posterior (medidas previas a un contrato, a petición del titular); generar el informe del Radar, «para lo cual parte de tus respuestas se procesa con modelos de inteligencia artificial» (redacción genérica, sin nombrar proveedor en esa frase).
5. **§4 Proveedores:** se agregan **Cloudflare** (aloja el sitio y el servicio que recibe el cuestionario) y **Telegram** (avisos internos con nombre de empresa y conteos, nunca contenido).
6. **§5 Conservación:** si no se contrata, las respuestas y demás datos de preparación se eliminan o anonimizan a más tardar **12 meses** después del último contacto; el enlace del cuestionario vence a los 14 días.
7. **§6 Derechos:** desde el 1-dic-2026, si no respondemos o rechazamos una solicitud, el titular puede reclamar ante la Agencia de Protección de Datos Personales.
8. **§7 Seguridad y §8 Cookies:** enlace único, intransferible, que vence y puede revocarse; conexión cifrada; la página no usa analítica ni cookies; nueva fila `rp_t` (sessionStorage, estrictamente necesaria, hasta cerrar la pestaña).

## Decisiones de Gonzalo (2026-11-05)
- Razón social y RUT: los de la cédula del SII (emisión 27-03-2026).
- Domicilio publicado: **solo «Viña del Mar, Chile»**. El domicilio de casa matriz de la cédula parece residencial y no se publica. El RUT personal del usuario de la cédula tampoco.
- Correo de contacto y de solicitudes: chat@3gi.cl.
- IA: redacción genérica «modelos de inteligencia artificial».
- Plazo de 12 meses: **confirmar** (el mensaje con la decisión llegó cortado: «12 meses o…»).

## Preguntas para el abogado
1. **Base de licitud del cuestionario:** ¿bastan las «medidas precontractuales a petición del titular», o conviene un consentimiento expreso en el propio formulario? El formulario hoy solo muestra un aviso con enlace a esta política.
2. **Plazo y mecanismo de borrado:** ¿12 meses desde el último contacto es razonable para prospectos? ¿«anonimizar» es suficiente alternativa a eliminar?
3. **Identificación del responsable:** ¿basta ciudad y correo, sin calle? ¿debe nombrarse al representante legal (hoy sí)?
4. **Delegado de protección de datos:** la ley indica que en micro, pequeñas y medianas empresas el dueño puede asumir ese rol. ¿Conviene designarlo y publicarlo?
5. **Derechos:** el texto lista acceso, rectificación, eliminación, oposición y portabilidad. El texto de la ley que se leyó también menciona la **suspensión temporal** del tratamiento mientras se resuelve una solicitud. ¿Se agrega?
6. **Conservación general (§5):** «mientras dure la relación comercial» sigue sin plazo para clientes; la ley exige conservar solo el tiempo necesario.

## Lo que NO se modificó porque no se pudo verificar (revisar)
- La frase *«La transferencia se ampara en las Cláusulas Contractuales Modelo aprobadas por el Ministerio de Economía de Chile»*: no hay evidencia de que existan. En la ley nueva la Agencia es quien determina los países con nivel adecuado.
- La frase *«Estos proveedores están ubicados en Estados Unidos»*: Hetzner opera desde Alemania (Núremberg, según la documentación de la plataforma).
- `terminos.astro` y `en/terminos.astro` mantienen `gonzalo@3gi.cl` como contacto; no se revisaron.
- Proveedores que ya existen pero no figuran en la lista: Zoho (correo) y Cal.com (agenda). No forman parte de este cambio.

## Pendiente técnico al aprobar
- `src/data/diagnostico-permitido.mjs` tiene 4 excepciones «TEMPORAL: texto legal pendiente de revisión externa» para estas dos páginas; se retiran al cerrar esta revisión (hoy siguen amparando frases que no se tocaron).
- Probar ambas páginas en el navegador (`innerText`, móvil y escritorio) tras desplegar, según la regla del sitio.

## Fuentes consultadas
Ley 21.719 (BCN, versión 2026-12-01) y Decreto 662 (9-sep-2026); NCG 502 de la CMF; cédula del SII de 3GI SpA (27-03-2026).
