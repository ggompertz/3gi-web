# Política de privacidad de 3GI SpA — paquete para revisión legal (versión 2026-11)

**Estado: borrador. No se publica hasta que lo revise un abogado y lo apruebe Gonzalo.** Este documento no es asesoría legal: reúne el contexto, lo que se decidió, lo que se verificó y lo que el abogado debe resolver.
Rama: `docs/privacidad-radar-previo` (3gi-web). Texto completo a revisar: `docs/privacidad-2026-11-texto-es.md` y `docs/privacidad-2026-11-texto-en.md`.
Páginas: `src/pages/privacidad.astro` (ES) y `src/pages/en/privacidad.astro` (EN). Fecha de este paquete: 2026-11-05.

> Las referencias a artículos de la Ley 21.719 salen de una consulta sobre el texto de la BCN (versión 2026-12-01). **Debe leerse el texto oficial de cada artículo antes de apoyarse en él.**

---

## 1. Contexto

**Quién:** 3GI SpA (nombre comercial 3G Intelligence), RUT 78.388.535-2, Viña del Mar, Chile. Consultora de inteligencia artificial para pymes. Representante: Gonzalo Gompertz Geldres.

**Qué cambia ahora:** la Ley 21.719 entra en vigencia el **1 de diciembre de 2026** (publicada el 13-dic-2024; reglamento de modelos de prevención: Decreto 662, 9-sep-2026). Además, 3GI lanza el formulario **«Preparación del Radar»** (`/radar/previo/`), donde un cliente entrega, antes de la reunión, información de su empresa. La política vigente (octubre 2026) cubría el Test ERA y el seguimiento comercial, pero no ese cuestionario, no identificaba a la sociedad responsable y no definía qué pasa con los datos de quien no contrata.

**Qué datos recoge el cuestionario:** cómo funciona el negocio (equipo, herramientas, procesos, tipos de datos que maneja, medidas de seguridad, canales comerciales, cumplimiento normativo y expectativas), más nombre y correo de contacto. **No pide datos personales de los clientes del cliente.** No pide montos ni ingresos.

**Cómo viajan los datos:**

| Pieza | Para qué | Ubicación | ¿Verificado? |
|---|---|---|---|
| Cloudflare (Pages y Worker) | Entrega la página y recibe el cuestionario | red global | no se verificó el país de procesamiento |
| Supabase | Base de datos: guarda respuestas y contacto | **EE.UU. (`us-west-2`, Oregón)** | sí (panel de Supabase, 2026-11-05) |
| Hetzner (servidor de 3GI) | n8n y agentes que procesan las respuestas y los avisos | **Núremberg, Alemania** | sí (DNS e IP geolocalizada, 2026-11-05) |
| n8n (propio, en Hetzner) | Aviso interno al enviar el formulario | Alemania | sí (mismo servidor) |
| Telegram | Aviso interno: nombre de la empresa y conteos, **nunca el contenido** | no verificado | contenido del aviso verificado en el código |
| Modelos de IA (Anthropic) | Generan el informe del Radar a partir de las respuestas que el consultor ingresa | EE.UU. (no verificado) | según el código del post-scan; confirmar |
| Vercel | Portal interno del consultor (`app.3gi.cl`); **no recibe respuestas de clientes** | EE.UU. (por IP) | parcial |

El servidor anterior de 3GI estaba en Ashburn, EE.UU., y fue dado de baja tras el incidente de seguridad de septiembre de 2026. Hoy no hay servidores de 3GI en EE.UU.; lo que está en EE.UU. es la base de datos (Supabase).

---

## 2. Decisiones ya tomadas por Gonzalo (2026-11-05)
- **Responsable:** 3GI SpA, RUT 78.388.535-2 (cédula del SII emitida el 27-03-2026). Domicilio publicado: **solo «Viña del Mar, Chile»**. No se publica la calle (parece residencial) ni el RUT personal del usuario de la cédula.
- **Contacto y solicitudes de derechos:** `chat@3gi.cl`.
- **IA:** redacción genérica, «modelos de inteligencia artificial», sin nombrar proveedor en esa frase.
- **Conservación:** quien no contrata, **12 meses** desde el último contacto, y luego se elimina o anonimiza. El enlace del cuestionario vence a los 14 días.
- **Se retiró** la frase sobre las «Cláusulas Contractuales Modelo aprobadas por el Ministerio de Economía» (no hay evidencia de que existan).
- **Se agregó** el derecho a la **suspensión temporal** del tratamiento (derecho de bloqueo).
- **Se corrigió** la ubicación de los proveedores con los hechos verificados.

## 3. Cambios en las páginas (los mismos en ES y EN)
1. Fecha y versión: «noviembre 2026 · Versión 2026-11».
2. **§1 Responsable** (3GI SpA, RUT, Viña del Mar, representante) y contacto único `chat@3gi.cl` (antes gonzalo@3gi.cl; también en la frase de derechos de la §6).
3. **§2 Datos:** nuevo punto sobre el cuestionario.
4. **§3 Finalidades:** preparar y realizar el Radar y la propuesta posterior (medidas previas a un contrato, a petición del titular); generar el informe del Radar con modelos de inteligencia artificial.
5. **§4 Proveedores:** se agregan Cloudflare y Telegram; se anota el país de Hetzner (Alemania) y de Supabase (Estados Unidos).
6. **§4 Dónde se tratan tus datos:** el párrafo nuevo reemplaza a «Estos proveedores están ubicados en Estados Unidos». Afirma solo lo verificado y **no cita un mecanismo legal de transferencia** (queda para el abogado, ver punto 1 de la sección 4).
7. **§5 Conservación:** 12 meses para quien no contrata; el enlace vence a los 14 días.
8. **§6 Derechos:** suspensión temporal desde el 1-dic-2026; vía de reclamo ante la Agencia de Protección de Datos Personales.
9. **§7 Seguridad y §8 Cookies:** enlace único, intransferible, que vence y puede revocarse; conexión cifrada; la página no usa analítica ni cookies; fila `rp_t` (sessionStorage, estrictamente necesaria, hasta cerrar la pestaña).

---

## 4. Lo que el abogado debe validar (con contexto)

> **Si hay poco tiempo, prioriza 1, 2 y 3:** son los que afectan lo que se publica al cliente.

### 4.1 Fundamento de la transferencia internacional
**Contexto.** Los datos del cuestionario salen de Chile: se guardan en EE.UU. (Supabase) y pasan por Alemania (Hetzner, n8n). La ley exige un fundamento para cada transferencia, y la política publicada **hoy no cita ninguno**.

**Qué dice la ley (art. 27).**
- *Casos generales:* (a) país con nivel adecuado de protección, que determina la Agencia (art. 28); (b) cláusulas contractuales, normas corporativas vinculantes u otros instrumentos con garantías adecuadas, suscritos entre quien transfiere y quien recibe; (c) un modelo de cumplimiento o mecanismo de certificación con garantías adecuadas.
- *Casos «específicos y no habituales», a falta de decisión de adecuación o de garantías:* (a) consentimiento expreso del titular para una transferencia determinada; (b) transferencias bancarias, financieras o bursátiles específicas conforme a sus leyes; (c) tratados o convenios internacionales; (d) convenios de cooperación entre órganos públicos; (e) autorización expresa de la ley para una finalidad determinada; (f) colaboración judicial internacional; **(g) que sea necesaria para celebrar o ejecutar un contrato entre el titular y el responsable, o para medidas precontractuales a solicitud del titular**; (h) urgencias médicas o sanitarias.

**Opciones para el texto publicado.**
- **(A) Medidas precontractuales, art. 27 inc. 2.º (g).** Es el que menos cambia. *Riesgo:* está en el grupo de los casos «no habituales»; si la operación del cuestionario lo usa de forma habitual, el abogado debe decir si encaja.
- **(B) Instrumento con garantías adecuadas, art. 27 inc. 1.º (b).** Es la vía natural para una operación habitual, pero exige un instrumento firmado con cada proveedor (ver 4.2). Hoy **no hay evidencia** de que existan.
- **(C) Consentimiento expreso, art. 27 inc. 2.º (a).** Exige una casilla de consentimiento en el formulario; hoy solo hay un aviso con enlace a la política. Además la ley pide que el consentimiento sea para una transferencia «específica y determinada».

**Texto propuesto (a elegir).**
> **Transferencias internacionales de datos.** Para prestarte el servicio, tus datos se tratan fuera de Chile: en Alemania (servidores de aplicaciones y automatización, Hetzner) y en Estados Unidos (base de datos, Supabase, y los demás proveedores indicados arriba, según sus propias políticas).
> **(A)** Estas transferencias son necesarias para ejecutar el servicio que nos solicitas o las medidas previas a un contrato adoptadas a petición tuya.
> **(B)** Estas transferencias se amparan en [instrumento que el abogado confirme, suscrito con cada proveedor y con garantías adecuadas].
> **(C)** Estas transferencias se realizan con tu consentimiento, que otorgas al enviar el cuestionario.
> Puedes solicitar más información sobre estas transferencias en chat@3gi.cl.

**Preguntas.** ¿Basta (A) para una operación habitual o debo ir por (B)? Mientras no exista mecanismo, ¿qué debo publicar? ¿Ayuda que Alemania (UE) y EE.UU. se traten de forma distinta?

### 4.2 Contratos con los proveedores que tratan datos por encargo
**Contexto.** Cuando un proveedor trata datos en nombre de 3GI (guardarlos, procesarlos, alojarlos), la ley lo trata como «tercero mandatario o encargado». Pueden serlo Supabase, Hetzner, Cloudflare y, si se le envían respuestas, el proveedor de IA.

**Qué dice la ley (art. 15 bis).** Ese tratamiento se rige por un contrato que debe fijar el objeto del encargo, su duración, la finalidad del tratamiento, el tipo de datos personales, las categorías de titulares y los derechos y obligaciones de las partes.

**Lo que no se sabe.** No hay evidencia de qué acuerdos tiene aceptados 3GI. Por conocimiento general (no verificado), estos proveedores suelen ofrecer un acuerdo de tratamiento de datos aceptable desde su panel. Ese acuerdo podría servir de instrumento para la opción (B) de 4.1.

**Preguntas.** ¿Qué debe contener cada contrato para cumplir el art. 15 bis? ¿Sirven los acuerdos estándar de los proveedores o hace falta algo adicional?

### 4.3 Base de licitud del cuestionario y plazo de 12 meses
**Contexto.** Hay que poder decir por qué se tratan estos datos. La propuesta es «medidas previas a un contrato, a petición del titular»: el cliente pide la reunión y responde para prepararla.

**Qué dice la ley.** Un principio central es conservar los datos solo el tiempo necesario y luego suprimirlos o anonimizarlos; el texto leído incluye una obligación específica de suprimir o anonimizar los datos obtenidos para medidas precontractuales. **No se encontró un plazo fijo.** Otros principios relevantes: finalidad y proporcionalidad.

**Sobre los 12 meses** (decisión de Gonzalo): es una decisión de negocio, no un número legal. Se propone desde el último contacto, y luego eliminar o anonimizar.

**Preguntas.** ¿La base «medidas precontractuales» es suficiente para todo el cuestionario o conviene sumar consentimiento o interés legítimo? ¿Es proporcional el plazo de 12 meses? ¿Qué plazos aplican a quienes sí contratan (tributarios, contables)? No se revisaron.

**Otra duda.** Si la persona que responde es un empresario individual, parte de la información de su negocio podría ser dato personal. La ley califica la «situación socioeconómica» como dato sensible (requiere consentimiento expreso). El cuestionario **no pide montos ni ingresos**, pero conviene que el abogado confirme que no entra en esa categoría.

### 4.4 Identificar al responsable con ciudad y correo, sin calle
**Contexto.** Hoy la política dice «3GI SpA, RUT 78.388.535-2, Viña del Mar, Chile, representada por Gonzalo Gompertz Geldres». El domicilio del SII parece una casa, por eso no se publica la calle.

**Qué dice la ley.** En lo leído, exige poner a disposición del público la individualización del responsable y de su representante legal, y nombra otros contenidos (política con fecha y versión, medidas de seguridad, conservación, transferencias). **No se vio que pida la calle.**

**Lo que no se sabe.** Si otra norma (de consumidores o comercio electrónico, por ejemplo) exige publicar domicilio.

**Preguntas.** ¿Basta ciudad y correo? Si no, ¿qué domicilio puede publicarse (comercial, oficina virtual) sin exponer el personal?

### 4.5 Delegado de protección de datos y derecho de suspensión temporal
**Delegado (art. 49 y 50).** Es **opcional**: el responsable «podrá» designarlo. Forma parte del «modelo de prevención de infracciones»; contar con un modelo certificado da una **atenuante** de responsabilidad (art. 36 n.º 5, con certificado según el art. 51). En micro, pequeñas y medianas empresas el dueño puede asumir el rol. Crea tareas formales (asesorar, promover la política, atender consultas de los titulares).

**Suspensión temporal (art. 8 ter, «derecho de bloqueo»).** Mientras se resuelve una solicitud de rectificación, supresión u oposición, el titular puede pedir que se suspenda temporalmente el tratamiento de sus datos; no afecta al almacenamiento. **Ya se agregó a la política** (§6, «desde el 1 de diciembre de 2026»).

**Plazo de respuesta (art. 11).** Treinta días corridos desde el ingreso de la solicitud, prorrogables una sola vez hasta por otros treinta. La política **no lo declara** hoy.

**Preguntas.** ¿Conviene designar delegado a Gonzalo y publicarlo? ¿Redacción adecuada del derecho de bloqueo? ¿Debe publicarse el plazo de 30 días?

---

## 5. Tareas de 3GI (no del abogado)
- **Contratos de tratamiento:** revisar en cada cuenta (Supabase, Hetzner, Cloudflare, Anthropic y otros) si hay un acuerdo de tratamiento de datos aceptado, y guardar copia.
- **Proceso de solicitudes de derechos:** quién atiende `chat@3gi.cl`, cómo se registra cada solicitud, cómo se detiene el seguimiento (por ejemplo flujos de n8n) mientras dura una suspensión, y cómo se responde en 30 días corridos.
- **Si el abogado elige consentimiento (opción C):** agregar una casilla al formulario (cambio en 3gi-web y en el Worker).
- **Proveedores que ya existen pero no figuran en la lista:** Zoho (correo) y Cal.com (agenda); Vercel (portal interno), si se prefiere por transparencia.
- **`terminos.astro` y `en/terminos.astro`:** mantienen `gonzalo@3gi.cl` como contacto; no se revisaron.
- **Retirar** las 4 excepciones «TEMPORAL: texto legal pendiente de revisión externa» de `src/data/diagnostico-permitido.mjs` al cerrar esta revisión.
- **Tras desplegar:** probar ambas páginas en el navegador (`innerText`, móvil y escritorio), según la regla del sitio.

## 6. Lo que NO se modificó
No se tocó el resto del texto vigente que no se relaciona con el cuestionario (cookies de analítica y publicidad, bot de WhatsApp, Test ERA, derechos sobre decisiones automatizadas). Tampoco se revisaron los *Términos de Servicio*.

## 7. Fuentes consultadas
Ley 21.719 (BCN, versión 2026-12-01) y Decreto 662 (9-sep-2026); NCG 502 de la CMF; cédula del SII de 3GI SpA (27-03-2026); panel de Supabase (región); resolución DNS y geolocalización de IP del servidor (2026-11-05).
