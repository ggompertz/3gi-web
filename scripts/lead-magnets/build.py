#!/usr/bin/env python3
"""Genera los 5 lead magnets PDF de 3G Intelligence desde contenido HTML con marca."""
import weasyprint, os

FOOTER = '''<div class="footer"><span>3G Intelligence · 3gi.cl</span><span class="tagline">Movemos tu empresa de una ERA a otra</span><span>{pag}</span></div>'''

def portada(kicker, titulo, bajada, slug):
    return f'''<div class="pagina portada">
      <img class="logo" src="assets/isotipo.png"/>
      <p class="kicker">{kicker}</p>
      <h1>{titulo}</h1>
      <p class="bajada">{bajada}</p>
      <p class="serie">Basado en el libro <strong>Inteligencia Organizacional en la Era IA</strong> · Gonzalo Gompertz · 3G Intelligence</p>
      {FOOTER.format(pag='')}
    </div>'''

def cta(slug):
    return f'''<div class="cta-final">
      <p class="titulo">¿En qué ERA está tu empresa?</p>
      <p style="color:#C7CBD4">Descúbrelo en 5 minutos con el Test ERA — gratuito, con informe personalizado generado por IA.</p>
      <a class="cta-boton" href="https://3gi.cl/test-era?src=pdf&amp;pdf={slug}">Hacer el Test ERA →</a>
      <a class="cta-sec" href="https://3gi.cl/inteligencia-organizacional/">Conocer el libro</a>
      <p class="cta-url">3gi.cl/test-era &nbsp;·&nbsp; 3gi.cl/inteligencia-organizacional</p>
    </div>'''

def pagina(contenido, pag):
    return f'<div class="pagina">{contenido}{FOOTER.format(pag=pag)}</div>'

def doc(cuerpo):
    return f'''<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
    <link rel="stylesheet" href="estilo.css"></head><body>{cuerpo}</body></html>'''

PDFS = {}

# ── 1. ¿Por qué fallan 4 de cada 5 proyectos de IA? ──────────────────────────
PDFS['fallan-4-de-5'] = doc(
portada("El problema", "¿Por qué fallan 4 de cada 5 proyectos de IA?",
 "Las tres formas en que la inteligencia artificial fracasa en las organizaciones — y las 10 señales para reconocerlas en la tuya antes de invertir.", 'fallan-4-de-5')
+ pagina('''
<p class="kicker">Los datos que el ecosistema prefiere no mirar</p>
<h1 style="font-size:20pt">La tecnología está disponible. El valor, no.</h1>
<p class="lead">Nunca en la historia empresarial se invirtió tanto en una tecnología con tan poca claridad sobre por qué las implementaciones fracasan.</p>
<div class="dato"><span class="cifra">4 de cada 5</span>pilotos de IA fracasan antes de despegar.<div class="fuente">IBM Research, 2023</div></div>
<div class="dato"><span class="cifra">&lt; 1%</span>de las organizaciones considera que su estrategia de IA es suficientemente madura para capturar valor real.<div class="fuente">McKinsey, 2025</div></div>
<div class="dato"><span class="cifra">85%</span>de los proyectos de IA no llegan a producción.<div class="fuente">Gartner</div></div>
<p>Estos números son extraordinarios. Y extraordinariamente ignorados: el ecosistema de la IA —consultoras, vendedores, plataformas— tiene un poderoso incentivo para hablar de los éxitos y silenciar los fracasos. La pregunta que evita hacerse es la más importante: <strong>¿por qué fallan?</strong></p>
<p>El patrón de fracaso no es aleatorio. Estudiado con atención, revela tres modalidades recurrentes.</p>
''', '2')
+ pagina('''
<h2>Modalidad 1 — Implementación sobre el caos</h2>
<p>Una empresa con procesos informales, información dispersa y coordinación dependiente de personas clave implementa IA sobre esa base frágil. El sistema funciona técnicamente, pero la organización no puede usar sus outputs de manera sistemática. <strong>La IA amplifica el caos en lugar de reducirlo.</strong></p>
<div class="alerta"><span class="tag">El dato</span>El 58% de las organizaciones en estadios iniciales de madurez carece de la infraestructura de datos mínima para sostener un modelo en producción (Gartner). La IA no fracasa por sí misma: fracasa porque aprende de un entorno que no está en condiciones de enseñarle nada útil.</div>
<h2>Modalidad 2 — Automatización sin visibilidad</h2>
<p>Se automatizan procesos que nadie mide y nadie entiende completamente. La automatización los hace más rápidos y baratos, pero no mejores: <strong>los errores se replican más rápido</strong>. Velocidad sin dirección.</p>
<div class="alerta"><span class="tag">El dato</span>El 88% de las organizaciones que usan IA lo hacen como complemento de procesos existentes que nunca fueron auditados ni optimizados antes de ser automatizados (McKinsey).</div>
<h2>Modalidad 3 — Rechazo cultural</h2>
<p>La IA llega a una organización cuya cultura, incentivos y dinámicas de poder no están alineados con su adopción. Quienes la perciben como amenaza la sabotean — a veces conscientemente, más frecuentemente sin saberlo.</p>
<div class="alerta"><span class="tag">El dato</span>En organizaciones de baja madurez, la adopción efectiva de herramientas de IA no supera el 30%, incluso cuando el sistema funciona técnicamente bien (MIT CISR).</div>
''', '3')
+ pagina('''
<h2>10 señales de alerta en tu empresa</h2>
<p>Si reconoces tres o más, tu próxima inversión en IA tiene alta probabilidad de engrosar la estadística:</p>
<ul class="check">
<li>La operación depende de 2-3 personas que "tienen todo en la cabeza".</li>
<li>Los procesos críticos no están documentados — o la documentación no coincide con lo que realmente se hace.</li>
<li>La misma información vive en planillas distintas con valores distintos.</li>
<li>Nadie puede responder hoy, con datos, cuál es el cuello de botella de la operación.</li>
<li>Se quiere automatizar un proceso que nadie ha medido nunca.</li>
<li>Las decisiones importantes se justifican con intuición y antigüedad, no con datos.</li>
<li>El último proyecto tecnológico "funcionó", pero nadie lo usa.</li>
<li>Los incentivos del equipo premian exactamente el comportamiento que la IA debería cambiar.</li>
<li>La IA se evalúa preguntando qué tan bueno es el modelo, no si la organización está lista para usarlo.</li>
<li>Se espera que la tecnología ordene la casa — en vez de ordenar la casa para usar la tecnología.</li>
</ul>
<p><strong>Ninguna de estas causas se resuelve comprando más tecnología.</strong> La variable que determina el éxito no es el acceso a la IA — es la madurez organizacional para usarla. Esa madurez se puede diagnosticar con rigor, no con intuición.</p>
''' + cta('fallan-4-de-5'), '4'))

# ── 2. Las 3 ERAs ─────────────────────────────────────────────────────────────
PDFS['las-3-eras'] = doc(
portada("El framework", "Las 3 ERAs: ¿en cuál está tu empresa?",
 "Todas las organizaciones están en una de tres etapas de madurez. Saber cuál es la tuya cambia todas las decisiones tecnológicas que vienen.", 'las-3-eras')
+ pagina('''
<p class="kicker">Un mapa, no un ranking</p>
<h1 style="font-size:20pt">Ninguna ERA es "mala". Pero cada una define qué inversión en IA genera valor — y cuál genera caos.</h1>
<p>El Framework 3 ERAs, fundado en la teoría general de sistemas de Ludwig von Bertalanffy, no describe el estado ideal al que toda organización debería llegar: describe el estado real en que cada organización se encuentra hoy. Sus tres etapas son perfiles operacionales con síntomas reconocibles.</p>
<div class="era-card"><span class="era-nombre">ERA 1 — Coordinación por personas</span><div class="era-sub">El sistema existe, pero es invisible</div>
<p>La coordinación depende de conversaciones, reuniones y excepciones gestionadas persona a persona. No es una organización incompetente: sus mecanismos fueron diseñados para un mundo donde el observador humano era el único instrumento de medición. Señales típicas: el conocimiento vive en personas clave, la información está fragmentada, y cuando alguien importante se va, se pierde una porción irreemplazable del sistema.</p></div>
<div class="era-card"><span class="era-nombre">ERA 2 — Visibilidad sistémica</span><div class="era-sub">La organización empieza a verse a sí misma</div>
<p>Indicadores conectados entre sí, flujos de datos que cruzan los silos, dashboards que reflejan la realidad operacional. La organización deja de gestionar desde la intuición y pasa a gestionar desde el conocimiento sistémico. Señales típicas: los procesos están medidos, los cuellos de botella son identificables con datos, y las decisiones importantes se pueden justificar sin recurrir a la jerarquía.</p></div>
<div class="era-card"><span class="era-nombre">ERA 3 — Sistema adaptativo aumentado por IA</span><div class="era-sub">El sistema nervioso digital</div>
<p>La organización no se limita a observar su entorno: lo interpreta, aprende en tiempo real y reconfigura su comportamiento antes de que la perturbación se convierta en crisis. Los bucles de retroalimentación gobernados por IA no son un mecanismo de control — son el sistema nervioso de una organización que se adapta a la velocidad del mundo que la rodea.</p></div>
''', '2')
+ pagina('''
<h2>Por qué importa saber tu ERA</h2>
<p>Porque <strong>el mismo proyecto de IA que transforma a una empresa ERA 2 destruye valor en una empresa ERA 1</strong>. Implementar IA sobre procesos invisibles amplifica el caos; automatizar sin medición replica errores más rápido. La secuencia importa: primero visibilidad, después inteligencia.</p>
<p>Cada ERA tiene además sub-niveles (ERA 1-, ERA 1, ERA 1+ …) que precisan el punto exacto del camino, los errores predecibles al implementar IA desde ahí, y las condiciones concretas para avanzar a la siguiente etapa. Ese nivel de detalle — las señales diagnósticas completas, las transiciones medibles y el camino de seis fases para moverse de una ERA a otra — es el corazón del libro.</p>
<blockquote>La IA no transforma organizaciones. Las organizaciones con la estructura adecuada transforman sus resultados usando IA como herramienta.<span class="autor">— Inteligencia Organizacional en la Era IA</span></blockquote>
<h2>El primer paso es gratis</h2>
<p>Saber tu ERA con precisión no requiere una consultoría de meses: requiere responder con honestidad un conjunto de preguntas sobre cómo opera realmente tu empresa. El Test ERA lo hace en 5 minutos y entrega tu perfil operacional y comercial con un informe generado por IA.</p>
''' + cta('las-3-eras'), '3'))

# ── 3. 10 preguntas antes de invertir en IA ───────────────────────────────────
PDFS['10-preguntas'] = doc(
portada("Guía del líder", "10 preguntas que hacerte antes de invertir en IA",
 "Una checklist honesta sobre datos, procesos, cultura y liderazgo. Si no puedes responder estas preguntas, la IA no es tu próximo paso — todavía.", '10-preguntas')
+ pagina('''
<p class="kicker">Antes de firmar el presupuesto</p>
<h1 style="font-size:20pt">La pregunta correcta no es "¿qué IA compro?"</h1>
<p class="lead">Es: <strong>¿está mi organización en condiciones de generar valor con IA?</strong> No es una pregunta tecnológica. Es una pregunta organizacional — y tiene respuesta diagnosticable.</p>
<h2>Datos</h2>
<ul class="check">
<li><strong>1.</strong> Si pido el mismo indicador a dos áreas distintas, ¿recibo el mismo número?</li>
<li><strong>2.</strong> ¿Existe una fuente única y confiable de los datos que la IA necesitaría para operar?</li>
<li><strong>3.</strong> ¿Cuánto de la información crítica del negocio vive solo en la cabeza (o el correo) de alguien?</li>
</ul>
<h2>Procesos</h2>
<ul class="check">
<li><strong>4.</strong> El proceso que quiero automatizar, ¿está documentado tal como realmente ocurre?</li>
<li><strong>5.</strong> ¿Lo hemos medido? ¿Sabemos su costo, su tiempo de ciclo y su tasa de error actuales?</li>
<li><strong>6.</strong> Si lo aceleramos 10 veces, ¿aceleramos valor — o aceleramos errores?</li>
</ul>
<h2>Cultura y liderazgo</h2>
<ul class="check">
<li><strong>7.</strong> ¿Quién pierde poder, comodidad o relevancia si esta IA funciona? ¿Qué haremos con eso?</li>
<li><strong>8.</strong> ¿Los incentivos actuales premian el comportamiento que la IA debería cambiar?</li>
<li><strong>9.</strong> La última herramienta que compramos, ¿la usa alguien hoy? ¿Por qué sí o por qué no?</li>
<li><strong>10.</strong> ¿Estamos midiendo el éxito por lo bueno que es el modelo — o por el valor real que genera en nuestra operación?</li>
</ul>
''', '2')
+ pagina('''
<h2>Cómo leer tus respuestas</h2>
<p><strong>7 o más respuestas sólidas:</strong> tu organización probablemente tiene la madurez para capturar valor con IA. La pregunta pasa a ser cuál iniciativa priorizar y en qué secuencia — ahí el diagnóstico fino marca la diferencia.</p>
<p><strong>Entre 4 y 6:</strong> hay fundaciones, pero también brechas que una implementación de IA va a exponer con crudeza. Conviene saber exactamente cuáles son antes de comprometer presupuesto.</p>
<p><strong>3 o menos:</strong> invertir en IA hoy tiene alta probabilidad de amplificar el desorden. La buena noticia: el camino para prepararse es conocido, ordenado y más corto de lo que parece — pero empieza por un diagnóstico honesto, no por una compra.</p>
<blockquote>La preparación empieza por saber dónde se está.<span class="autor">— Inteligencia Organizacional en la Era IA</span></blockquote>
<p>Estas 10 preguntas son una versión de bolsillo de algo más profundo: un framework de madurez organizacional con dos dimensiones de diagnóstico, síntomas reconocibles por etapa y un camino de transición en seis fases. El Test ERA aplica ese framework a tu empresa en 5 minutos.</p>
''' + cta('10-preguntas'), '3'))

# ── 4. Cambio de paradigma ────────────────────────────────────────────────────
PDFS['cambio-de-paradigma'] = doc(
portada("El fundamento", "La IA no es una mejora. Es un cambio de paradigma.",
 "Por qué juzgar la inteligencia artificial con los criterios del paradigma anterior es el error de Kodak y Nokia — y cómo evitarlo en tu organización.", 'cambio-de-paradigma')
+ pagina('''
<p class="kicker">Una lectura desde Thomas Kuhn</p>
<h1 style="font-size:20pt">Lo nuevo siempre se juzga con los criterios de lo viejo</h1>
<p>Cuando Copérnico propuso que la Tierra giraba alrededor del Sol, los instrumentos conceptuales disponibles no solo no podían confirmar la idea: activamente la contradecían. La reacción ante estos momentos sigue un patrón constante: asombro genuino, resistencia activa, y una tendencia irresistible a <strong>juzgar lo nuevo con los criterios de lo viejo</strong>.</p>
<p>En 1962, Thomas Kuhn publicó <em>La Estructura de las Revoluciones Científicas</em> y le dio nombre a ese patrón. Un <strong>paradigma</strong> es el marco de supuestos, conceptos y prácticas que define qué problemas son legítimos y qué soluciones son válidas. Las <strong>anomalías</strong> — resultados que no encajan — primero se ignoran; cuando se acumulan, producen una crisis; y la salida de la crisis no es una corrección gradual: es una <strong>revolución</strong> que reemplaza el paradigma entero.</p>
<blockquote>Después de una revolución científica, muchas medidas antiguas resultan obsoletas. El mundo del científico se transforma cualitativamente.<span class="autor">— Thomas S. Kuhn, 1962</span></blockquote>
<p>La irrupción de la IA generativa no es una mejora incremental sobre la computación tradicional — el paradigma determinista donde las máquinas ejecutan instrucciones explícitas escritas por humanos. Es un cambio de paradigma en el sentido técnico de Kuhn: <strong>una transformación en los supuestos de lo que es posible, lo que es válido, y lo que significa saber y hacer.</strong></p>
''', '2')
+ pagina('''
<h2>Kodak no ignoró lo digital. Lo inventó.</h2>
<p>La primera cámara digital fue desarrollada por un ingeniero de Kodak en 1975. La empresa tenía las patentes, la capacidad técnica, los recursos y el acceso al mercado. No lideró la transición porque el paradigma del carrete era, simultáneamente, <strong>el motor de sus ingresos y la lente a través de la cual evaluaba el futuro</strong>.</p>
<p>Nokia tuvo una historia análoga: no falló por falta de capacidad tecnológica, sino porque el paradigma del smartphone implicaba una reorganización de prioridades, incentivos y estructuras de poder que la organización no podía hacer sin destruirse en el proceso.</p>
<p><strong>La tecnología no fue el problema. La estructura organizacional fue el problema.</strong></p>
<h2>Qué significa esto para tu empresa</h2>
<p>Entender la IA como cambio de paradigma tiene tres consecuencias prácticas:</p>
<ul class="check">
<li>La resistencia interna al cambio no es un defecto de tu equipo: es el comportamiento predecible de todo paradigma en retirada. Se gestiona, no se reprocha.</li>
<li>Las críticas del tipo "la IA se equivoca, no es confiable" son inevitablemente inadecuadas: evalúan el paradigma nuevo con los estándares del viejo — exactamente lo que hicieron los críticos de Copérnico.</li>
<li>Un cambio de paradigma premia a quienes se preparan y penaliza a quienes esperan. Y la preparación no empieza comprando tecnología: <strong>empieza por saber dónde se está</strong>.</li>
</ul>
''' + cta('cambio-de-paradigma'), '3'))

# ── 5. La métrica equivocada ──────────────────────────────────────────────────
PDFS['metrica-equivocada'] = doc(
portada("La brecha de evaluación", "Estás midiendo la IA con la métrica equivocada",
 "La investigación está 94 veces más ocupada en benchmarks que en valor real. Tu empresa probablemente también. Estas son las preguntas correctas.", 'metrica-equivocada')
+ pagina('''
<p class="kicker">Lo que la industria no mide</p>
<h1 style="font-size:20pt">¿Qué tan bueno es el modelo? Pregunta equivocada.</h1>
<p>Una investigación de Cambridge presentada en IJCAI 2025 (Burden, Tešić, Pacchiardi y Hernández-Orallo) analizó 125 estudios del campo de evaluación de IA e identificó seis paradigmas que operan fragmentados, con terminologías incompatibles y sin comunicación entre sí. Su conclusión es directamente operacional: esta fragmentación <em>"contribuye a expectativas no cumplidas en los sistemas de IA desplegados"</em>.</p>
<div class="dato"><span class="cifra">57%</span>de toda la investigación en evaluación de IA se concentra en <strong>Benchmarking</strong>: medir el desempeño del modelo en tareas estandarizadas.<div class="fuente">Burden et al., IJCAI 2025</div></div>
<div class="dato"><span class="cifra">3,2%</span>estudia el <strong>Impacto en el Mundo Real</strong>: si la IA genera valor medible en contextos reales de uso.<div class="fuente">Burden et al., IJCAI 2025</div></div>
<p>El ecosistema está, en términos proporcionales, <strong>94 veces más ocupado</strong> en saber si un modelo responde bien un benchmark que en saber si genera valor real en el mundo.</p>
<p>Esa asimetría se replica en las empresas. Cuando una organización evalúa adoptar IA tiende a preguntar lo mismo que la investigación: ¿qué tan preciso es el modelo? ¿qué puntaje obtuvo? Son preguntas legítimas — <strong>del paradigma equivocado para una decisión organizacional</strong>.</p>
''', '2')
+ pagina('''
<h2>Las preguntas del paradigma correcto</h2>
<p>La pregunta relevante pertenece al paradigma menos desarrollado de todos — el del impacto real:</p>
<ul class="check">
<li>¿Está <strong>esta</strong> organización en condiciones de generar valor con <strong>esta</strong> IA en <strong>su</strong> contexto específico?</li>
<li>¿Qué decisiones reales va a cambiar el sistema — y quién las toma hoy?</li>
<li>¿Cómo mediremos el valor generado en la operación, no el desempeño del modelo?</li>
<li>¿Qué tiene que ser cierto en nuestros datos, procesos y cultura para que los outputs se usen de verdad?</li>
</ul>
<p>Cuando una implementación de IA fracasa, las causas reales son casi siempre organizacionales: información fragmentada, procesos no documentados, coordinación dependiente de personas clave, incentivos que premian el comportamiento que la IA debería cambiar. <strong>Ninguna se resuelve comprando más tecnología.</strong></p>
<p>Y ese es exactamente el problema: el ecosistema que debería hacer el diagnóstico correcto es el mismo que tiene incentivos para vender la solución tecnológica.</p>
<h2>Evaluar la madurez, no el modelo</h2>
<p>Existe un framework que opera precisamente en el paradigma minoritario: no evalúa las capacidades del modelo de IA — evalúa la madurez organizacional para crear valor con IA. No pregunta si la tecnología es buena; pregunta si la organización está lista. El primer paso es un diagnóstico de 5 minutos.</p>
''' + cta('metrica-equivocada'), '3'))


# ── 6. Guía completa: qué hace cada fase de 3GI (post "Por qué le cambiamos el nombre") ──────────
PDFS['guia-fases-3gi'] = doc(
portada("El camino completo, paso a paso", "Qué hace cada fase de 3GI, en qué orden y qué esperar",
 "Una guía de lectura rápida: los cinco pasos del camino, para qué sirve cada uno, qué recibes al terminarlo y cuánto toma.", 'guia-fases-3gi')
+ pagina('''
<p class="kicker">Las tres preguntas de todo proyecto de IA</p>
<h1 style="font-size:20pt">¿Dónde estoy? ¿Cómo llego? ¿Cómo me sostengo?</h1>
<p class="lead">Cada pregunta tiene un paso que la responde. Esta guía te cuenta qué hace cada uno, qué recibes al terminarlo y cuánto toma.</p>
<div class="dato"><span class="cifra">Radar</span>responde <strong>¿dónde estoy?</strong> Te dice dónde está tu empresa hoy y qué oportunidades tiene.</div>
<div class="dato"><span class="cifra">Plan de Vuelo</span>responde <strong>¿cómo llego?</strong> Traza el camino, calcula cuánto rinde y lo construye.</div>
<div class="dato"><span class="cifra">Piloto Automático</span>responde <strong>¿cómo me sostengo?</strong> Mantiene y hace evolucionar lo implementado.</div>
<p>El punto de entrada es siempre el <strong>Test ERA</strong>, gratuito. Cada empresa parte en un punto distinto — algunas hacen todo el recorrido y otras llegan directo a Plan de Vuelo. Lo único que no se salta es el Test ERA.</p>
''', '2')
+ pagina('''
<h2>1 · Test ERA — dónde partir <span style="font-weight:400">(gratuito)</span></h2>
<p>Un formulario donde identificamos los tres mayores dolores operativos de tu empresa y su potencial de IA. En 24 a 48 horas recibes un Informe ERA con la brecha entre tu situación actual y la ideal, los procesos con mayor oportunidad y el siguiente paso recomendado.</p>
<ul class="check"><li><strong>Recibes:</strong> Informe ERA en PDF y la recomendación de qué fase sigue.</li></ul>
<h2>2 · Radar — dónde estás hoy <span style="font-weight:400">(desde USD 1.200)</span></h2>
<p>Un diagnóstico pagado de dónde está tu empresa y qué oportunidades tiene. Tiene dos variantes:</p>
<ul class="check">
<li><strong>Radar Express:</strong> 1 sesión con la dirección. Precio según el tamaño de la empresa.</li>
<li><strong>Radar 360:</strong> una vuelta completa, con entrevistas en 4 a 6 áreas, más Quick Wins tácticos.</li>
<li><strong>Recibes:</strong> Score de Madurez IA, clasificación ERA e informe ejecutivo con las oportunidades identificadas.</li>
<li><strong>Ojo:</strong> ninguna de las dos incluye scoring cuantificado, ROI ni PRD. Eso es trabajo de Plan de Vuelo.</li>
</ul>
<h2>Data Foundation <span style="font-weight:400">(solo si aplica)</span></h2>
<p>La IA funciona bien solo con datos de calidad. No lo eliges tú: tu Radar determina si tus datos ya califican o si hace falta un proyecto previo para limpiar, estructurar e integrar tus fuentes antes de avanzar.</p>
''', '3')
+ pagina('''
<h2>3 · Plan de Vuelo — cómo llegar <span style="font-weight:400">(desde USD 6.700)</span></h2>
<p>Aquí, y solo aquí, se cuantifica, se diseña y se construye: scoring con ROI proyectado a 12 meses, análisis profundo de los procesos, PRD técnico completo e implementación acompañada hasta que el retorno sea real. El precio final depende de cuántas oportunidades persigas y de qué tan compleja sea la solución, y se cotiza al cerrar tu Radar.</p>
<ul class="check"><li><strong>Recibes:</strong> hoja de ruta cuantificada con ROI, PRD técnico completo y la solución construida y funcionando.</li></ul>
<h2>4 · Piloto Automático — sostener el rumbo <span style="font-weight:400">(USD 1.500–8.000 al mes)</span></h2>
<p>Una vez en el nuevo rumbo, esto lo mantiene: soporte y evolución continua de las soluciones ya implementadas. Hay tres niveles según las horas mensuales — Básico (5 a 10 h), Estándar (10 a 20 h) y Avanzado (20 a 40 h) — y se cotiza a medida después de la implementación.</p>
<h2>Resumen</h2>
<div class="dato"><span class="cifra">Orden</span>Test ERA → Radar → (Data Foundation, si aplica) → Plan de Vuelo → Piloto Automático.</div>
<p style="font-size:9pt;color:#6B7280">Los valores son referenciales y corresponden a los publicados en 3gi.cl; el alcance y el precio final se definen en cada caso.</p>
''' + cta('guia-fases-3gi'), '4'))

# ── 7. Checklist: ¿Radar Express o Radar 360? (post "Radar Express o Radar 360: ¿cuál necesitas?") ─
PDFS['checklist-radar'] = doc(
portada("Antes de elegir por dónde empezar", "Radar Express o Radar 360: 5 preguntas para saber cuál te conviene",
 "Elegir la variante equivocada te hace perder tiempo o gastar de más. Responde con sinceridad — sin darle vueltas.", 'checklist-radar')
+ pagina('''
<p class="kicker">Las dos formas de empezar</p>
<h1 style="font-size:20pt">Qué es cada una, en una línea</h1>
<div class="dato"><span class="cifra">Radar Express</span>1 sesión con tu equipo directivo. Desde USD 1.200, según el tamaño de la empresa. Sirve si ya sabes más o menos dónde te aprieta el zapato.</div>
<div class="dato"><span class="cifra">Radar 360</span>Una vuelta completa: entrevistas en 4 a 6 áreas, más Quick Wins tácticos. Referencia: USD 6.000. Sirve si nadie en tu empresa se pone de acuerdo en cuál es el problema real.</div>
<p><strong>Ninguna de las dos incluye scoring, ROI ni PRD todavía.</strong> Eso es trabajo de la fase siguiente (Plan de Vuelo): recién ahí se cuantifica y se construye.</p>
<h2>Las 5 preguntas</h2>
<p>Responde <strong>Sí</strong> o <strong>No</strong> a cada una y cuenta cuántas veces respondiste <strong>No</strong>.</p>
<ul class="check">
<li><strong>1. ¿Tu equipo directivo coincide en cuál es el problema principal?</strong></li>
<li><strong>2. ¿Sabes en qué una o dos áreas concentrarías el trabajo?</strong></li>
<li><strong>3. ¿La información que necesitas está en pocas personas o sistemas?</strong> (No, si vive dispersa en 4 o más áreas.)</li>
<li><strong>4. ¿Puedes partir sin mostrarle un panorama de toda la empresa a tus socios o al directorio?</strong></li>
<li><strong>5. ¿Tienes clara tu primera prioridad, sin necesitar mejoras rápidas en varios frentes a la vez?</strong></li>
</ul>
''', '2')
+ pagina('''
<h2>Tu resultado</h2>
<div class="dato"><span class="cifra">0 a 1 "No"</span><strong>Radar Express.</strong> Ya sabes dónde mirar; una sesión con la dirección basta para ordenarlo.</div>
<div class="dato"><span class="cifra">2 "No"</span><strong>Zona intermedia.</strong> Haz primero el Test ERA (gratuito): su informe ayuda a desempatar.</div>
<div class="dato"><span class="cifra">3 a 5 "No"</span><strong>Radar 360.</strong> Hay que escuchar a más áreas antes de decidir dónde actuar.</div>
<p style="font-size:9pt;color:#6B7280">Es una guía de orientación, no un compromiso: la variante final se confirma contigo antes de empezar. Valores referenciales, publicados en 3gi.cl.</p>
''' + cta('checklist-radar'), '3'))

os.makedirs('out', exist_ok=True)
import sys
_solo = sys.argv[1:] or list(PDFS)
for slug, html in ((k, v) for k, v in PDFS.items() if k in _solo):
    with open(f'{slug}.html', 'w') as f: f.write(html)
    weasyprint.HTML(string=html, base_url='.').write_pdf(f'out/3GI-{slug}.pdf')
    print(f'✓ out/3GI-{slug}.pdf')
