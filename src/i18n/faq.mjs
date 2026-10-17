// Textos de /faq (ES y EN). Precios y plazos como [[marcadores]] de src/data/oferta.mjs; también en el JSON-LD (FAQPage).
export const faq = {
  es: {
    meta: {"title":"Preguntas frecuentes sobre consultoría de IA para PyMEs · 3G Intelligence","description":"¿Cuánto cuesta implementar IA? ¿Cuánto tiempo toma? ¿Sirve para mi empresa? Respondemos las preguntas reales que hacen los dueños de PyMEs antes de dar el paso."},
    jsonld: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Cuánto cuesta implementar IA en una PyME?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "El Test ERA inicial es gratuito. Radar Express parte en [[radarDesde]] según el tamaño de tu empresa, Plan de Vuelo desde [[pdvDesde]], y Piloto Automático de USD 1.500 a USD 8.000 al mes. Si el Test ERA muestra oportunidades reales, el costo de Radar se descuenta de Plan de Vuelo si se contrata dentro de los [[descuentoDias]] días."
          }
        },
        {
          "@type": "Question",
          "name": "¿En cuánto tiempo se recupera la inversión en IA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "El caso promedio muestra retorno en 4–8 meses. El Test ERA proyecta el ROI a 12 meses por cada oportunidad antes de que decidas si invertir."
          }
        },
        {
          "@type": "Question",
          "name": "¿La IA es solo para empresas grandes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Las herramientas de IA más efectivas para operaciones cotidianas son accesibles desde USD 50–200 al mes. El problema no es el costo — es saber qué automatizar, en qué orden y cómo integrarlo. Eso es lo que hace 3GI."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cuánto tiempo toma implementar IA en mi empresa?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "El diagnóstico completo toma 3–4 semanas. Las implementaciones de Quick Wins se ejecutan en 4–8 semanas. Proyectos más complejos toman 2–4 meses."
          }
        },
        {
          "@type": "Question",
          "name": "¿La IA va a reemplazar a mis trabajadores?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lo que reemplaza la IA son tareas, no personas. El objetivo no es reducir gente — es multiplicar lo que hace cada uno eliminando el trabajo repetitivo de bajo valor."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cómo sé si mi empresa está lista para usar IA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No necesitas estar lista para empezar — necesitas saber dónde estás. El diagnóstico mide 5 dimensiones de madurez operacional que determinan tu ERA actual y qué nivel de IA puedes absorber hoy."
          }
        },
        {
          "@type": "Question",
          "name": "¿Mi equipo actual puede usar IA o necesito contratar especialistas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tu equipo actual puede usar IA. La arquitectura que entregamos está diseñada para personas sin conocimiento técnico, con onboarding de 1–2 horas."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué procesos conviene automatizar primero?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Los que combinan alto volumen, mucho tiempo manual y bajo riesgo: cotizaciones, reportes periódicos, carga de datos entre sistemas, seguimientos de clientes. El diagnóstico los identifica y ordena por ROI."
          }
        }
      ]
    },
    k: {
    "faqp-c1-sub": "Las preguntas reales sobre inversión, retorno y riesgo.",
    "faqp-c1-tag": "Dinero y ROI",
    "faqp-c1-title": "¿Cuánto cuesta y cuánto se recupera?",
    "faqp-c1a1": "Depende del alcance. El <strong>Test ERA inicial es gratuito</strong>. Radar Express parte en <strong>[[radarDesde]]</strong> según el tamaño de tu empresa, Plan de Vuelo desde [[pdvDesde]], y Piloto Automático de USD 1.500 a USD 8.000 al mes — sin cobros por hora. Si el Test ERA muestra oportunidades reales, el costo de Radar se descuenta de Plan de Vuelo si se contrata dentro de los [[descuentoDias]] días.",
    "faqp-c1a2": "El caso promedio que trabajamos muestra retorno en <strong>4–8 meses</strong>. El caso que publicamos en esta web recuperó USD 250K en procesos sin facturar en el primer trimestre post-implementación. El Test ERA proyecta el ROI a 12 meses por cada oportunidad antes de que decidas si invertir.",
    "faqp-c1a3": "Eso es precisamente lo que mide el Test ERA. En promedio, una PyME de 20–50 personas pierde <strong>entre USD 30.000 y USD 80.000 anuales</strong> en trabajo manual que podría automatizarse — cotizaciones, reportes, seguimientos, carga de datos. La mayoría no lo sabe porque nunca lo midió.",
    "faqp-c1a4": "Te lo decimos directamente. No vamos a crear un proyecto donde no hay oportunidad real. Si el Test ERA muestra que tu empresa no está lista o que el ROI no justifica la inversión, recibes ese informe igual — y es tuyo para usar como quieras. Preferimos clientes que avanzan con convicción.",
    "faqp-c1q1": "¿Cuánto cuesta implementar IA en una PyME?",
    "faqp-c1q2": "¿En cuánto tiempo se recupera la inversión?",
    "faqp-c1q3": "¿Cuánto dinero pierde mi empresa en tareas repetitivas hoy?",
    "faqp-c1q4": "¿Qué pasa si el Test ERA muestra que no vale la pena?",
    "faqp-c2-sub": "Plazos reales, sin promesas de \"implementación en 24 horas\".",
    "faqp-c2-tag": "Tiempo y proceso",
    "faqp-c2-title": "¿Cuándo empiezo a ver resultados?",
    "faqp-c2a1": "El diagnóstico completo toma <strong>3–4 semanas</strong>. Las implementaciones de Quick Wins (procesos simples) se ejecutan en <strong>4–8 semanas</strong>. Proyectos más complejos de automatización toman 2–4 meses. El diagnóstico te dice exactamente qué esperar antes de comprometer tiempo o presupuesto.",
    "faqp-c2a2": "Es la pregunta correcta. Nunca empezamos por el proceso crítico — empezamos por los <strong>Quick Wins</strong>: tareas repetitivas de bajo riesgo donde una falla no afecta la operación central. Una vez que el equipo gana confianza y el proceso demuestra resultados, escalamos. El orden importa más que la tecnología.",
    "faqp-c2a3": "Los que combinan tres cosas: <strong>alto volumen, mucho tiempo manual, y bajo riesgo si se equivocan</strong>. Generalmente: cotizaciones, reportes periódicos, carga de datos entre sistemas, seguimientos de clientes y proveedores. El diagnóstico los identifica y los ordena por ROI.",
    "faqp-c2a4": "No necesariamente. Si el diagnóstico detecta brechas de datos, ofrecemos un proyecto de <strong>Data Foundation</strong> previo que organiza, limpia e integra tus datos. Es un paso opcional entre el diagnóstico y la implementación de IA — y tiene precio fijo según complejidad.",
    "faqp-c2q1": "¿Cuánto tiempo toma implementar IA en mi empresa?",
    "faqp-c2q2": "¿Cómo implemento IA sin romper la operación actual?",
    "faqp-c2q3": "¿Qué procesos conviene automatizar primero?",
    "faqp-c2q4": "¿Necesito tener mis datos ordenados antes de empezar?",
    "faqp-c3-sub": "El mito más grande que frena a los dueños de empresa.",
    "faqp-c3-tag": "¿Es para mi empresa?",
    "faqp-c3-title": "¿La IA sirve para una PyME?",
    "faqp-c3a1": "No. Las herramientas de IA más efectivas para operaciones cotidianas son accesibles desde <strong>USD 50–200 al mes</strong>. El problema no es el costo de la herramienta — es saber qué automatizar, en qué orden y cómo integrarlo sin romper lo que ya funciona. Eso es exactamente lo que hace 3GI.",
    "faqp-c3a2": "Servicios profesionales (estudios, consultoras, salud), manufactura, logística y transporte, construcción y certificaciones, comercio y distribución. Si tu empresa tiene <strong>procesos repetibles con 2–50 personas</strong>, el método funciona — independiente del rubro. Lo que importa es que haya procesos, no que el rubro sea \"tech\".",
    "faqp-c3a3": "Tu equipo actual puede usar IA — ese es el objetivo. No implementamos soluciones que requieran un equipo técnico nuevo. La arquitectura que entregamos está diseñada para que <strong>personas sin conocimiento técnico</strong> puedan operar y escalar las soluciones después de un onboarding de 1–2 horas.",
    "faqp-c3a4": "Sí. Trabajamos con empresas en <strong>Chile, México, Colombia, Argentina y Perú</strong>. El diagnóstico y todas las fases se realizan de forma remota — sin costo de traslado. Lo único que varía entre países es el contexto regulatorio, que consideramos en el análisis.",
    "faqp-c3q1": "¿La IA es solo para empresas grandes con presupuesto de tecnología?",
    "faqp-c3q2": "¿Para qué rubros funciona mejor?",
    "faqp-c3q3": "¿Mi equipo actual puede usar IA o necesito contratar especialistas?",
    "faqp-c3q4": "¿Funciona para empresas fuera de Chile?",
    "faqp-c4-sub": "Las preguntas que nadie hace en voz alta pero todos piensan.",
    "faqp-c4-tag": "El momento de actuar",
    "faqp-c4-title": "¿Qué pasa si espero?",
    "faqp-c4a1": "Las empresas que implementan IA primero ganan en <strong>velocidad, costo y calidad</strong> simultáneamente. Una empresa que cotiza en 3 minutos compite diferente a una que tarda 35. Una que factura automático no pierde ingresos por descuido. La ventaja no es gradual — es estructural. Y una vez que se instala, es difícil de alcanzar.",
    "faqp-c4a2": "No en el sentido que te preocupa. Lo que reemplaza la IA son <strong>tareas</strong>, no personas. El trabajador que pasaba 35 minutos haciendo una cotización ahora cierra más ventas en el mismo tiempo. El que controlaba expedientes manualmente ahora supervisa excepciones. El objetivo no es reducir gente — es multiplicar lo que hace cada uno.",
    "faqp-c4a3": "Son riesgos reales — y por eso el diagnóstico los mapea antes de implementar. Los mitigamos con tres principios: <strong>empezar en procesos de bajo riesgo</strong>, mantener los datos en tu infraestructura (sin lock-in), y no automatizar decisiones críticas sin revisión humana. El riesgo cero no existe — pero el riesgo calculado es manejable.",
    "faqp-c4a4": "Una herramienta es genérica. El problema es saber cuál usar, para qué proceso, cómo integrarla con lo que ya tienes, y cómo hacer que tu equipo la adopte. Sin eso, la herramienta se convierte en otra licencia sin usar. 3GI no te vende herramientas — te entrega el <strong>diagnóstico, el roadmap y el acompañamiento</strong> para que el cambio sea real y medible.",
    "faqp-c4q1": "¿Qué pasará cuando mi competencia sí implemente IA?",
    "faqp-c4q2": "¿La IA va a reemplazar a mis trabajadores?",
    "faqp-c4q3": "¿Qué riesgos tiene usar IA? ¿Errores, privacidad, dependencia?",
    "faqp-c4q4": "¿Cuál es la diferencia entre contratar 3GI y comprar una herramienta de IA?",
    "faqp-c5-sub": "Sin letra chica. Así es el proceso real.",
    "faqp-c5-tag": "Cómo trabajamos",
    "faqp-c5-title": "¿Quién hace el trabajo y cómo?",
    "faqp-c5a1": "Nosotros hacemos el diagnóstico, el análisis y el roadmap. En Plan de Vuelo y Piloto Automático acompañamos la implementación con un consultor dedicado. <strong>No es un curso ni software</strong> que te dejamos solo. El objetivo es que al terminar, tu equipo opere de forma autónoma — sin depender de 3GI.",
    "faqp-c5a2": "Trabajamos con las herramientas que ya usas, no en contra de ellas. Integramos con <strong>WhatsApp Business, Excel/Google Sheets, ERPs, CRMs</strong> y sistemas propios. El diagnóstico mapea exactamente qué sistemas tienes y diseña el roadmap sobre esa base — no sobre un stack ideal que no existe en tu empresa.",
    "faqp-c5a3": "Las herramientas que recomendamos dependen del proceso — no hay una respuesta universal. Lo que sí podemos decir: <strong>las herramientas genéricas sin implementación específica son casi siempre humo</strong>. Un chatbot sin integración a tus sistemas solo responde preguntas frecuentes. La IA que mueve la aguja está conectada a tus datos y flujos reales.",
    "faqp-c5a4": "No necesitas estar \"lista\" para empezar — necesitas saber dónde estás. El diagnóstico mide exactamente eso: 5 dimensiones de madurez operacional que determinan tu ERA actual y qué nivel de IA puedes absorber hoy. Hay empresas en ERA 1 que pueden implementar Quick Wins en semanas. No esperes la perfección para empezar.",
    "faqp-c5q1": "¿Quién hace el trabajo — ustedes o me dejan con una herramienta?",
    "faqp-c5q2": "¿Cómo integran IA con WhatsApp, Excel, CRM o mi sistema actual?",
    "faqp-c5q3": "¿Qué herramientas de IA recomiendan y cuáles son puro humo?",
    "faqp-c5q4": "¿Cómo sé si mi empresa está lista para usar IA?",
    "faqp-cta-btn-diag": "Hacer el Test ERA gratuito",
    "faqp-cta-btn-wa": "Escribir por WhatsApp",
    "faqp-cta-sub": "Desde [[testMin]] minutos sabes en qué ERA está tu empresa y qué oportunidades concretas tiene hoy.",
    "faqp-cta-title": "¿Sigues con dudas?<br><span>El diagnóstico las responde todas.</span>",
    "faqp-eq1": "¿Tu equipo trabaja todo el día... o apaga incendios todo el día?",
    "faqp-eq2": "¿Cuánto dinero pierde tu empresa en tareas que alguien repite manualmente cada semana?",
    "faqp-eq3": "¿Qué proceso colapsa primero cuando aumenta la demanda?",
    "faqp-eq4": "¿Cuántas decisiones importantes sigues tomando sin datos reales?",
    "faqp-eq5": "¿Tu empresa está creciendo... o solo acumulando caos operativo?",
    "faqp-eq6": "¿Qué parte de tu operación depende demasiado de una sola persona?",
    "faqp-eq7": "¿Qué pasará cuando tu competencia sí implemente IA y tú no?",
    "faqp-eq8": "¿Dónde se pierde más tiempo hoy en tu empresa — y nadie lo mide?",
    "faqp-espejo-cta-btn": "Hacer el Test ERA gratuito",
    "faqp-espejo-cta-txt": "El Test ERA responde <span>exactamente</span> eso — desde [[testMin]] minutos.",
    "faqp-espejo-intro": "Si alguna de estas preguntas <span>resuena contigo</span>, ya tienes la respuesta que necesitas.",
    "faqp-hero-sub": "Sin filtros. Sin marketing. Las respuestas que realmente necesitas para decidir si la IA tiene sentido para tu negocio hoy.",
    "faqp-hero-tag": "Preguntas frecuentes",
    "faqp-hero-title": "Las preguntas que hacen<br>los dueños de empresa<br><em>antes de dar el paso.</em>",
  },
  },
  en: {
    meta: {"title":"FAQ · AI for SMBs · 3G Intelligence","description":"How much does AI cost? How long does it take? Does it work for my company? We answer the real questions business owners ask before taking the step."},
    jsonld: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does it cost to implement AI in an SME?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The initial ERA Test is free. Radar Express starts at [[radarDesde]] depending on company size, Flight Plan from [[pdvDesde]], and Autopilot from USD 1,500 to USD 8,000 per month. If the ERA Test shows real opportunities, the Radar cost is deducted from Flight Plan if contracted within [[descuentoDias]] days."
          }
        },
        {
          "@type": "Question",
          "name": "How long until my AI investment pays back?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The average case shows a return in 4 to 8 months. The ERA Test projects the 12-month ROI for each opportunity before you decide whether to invest."
          }
        },
        {
          "@type": "Question",
          "name": "Is AI only for large companies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The most effective AI tools for day-to-day operations cost USD 50 to 200 per month. The problem isn't cost, it's knowing what to automate, in what order, and how to integrate it. That's what 3GI does."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to implement AI in my company?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The full diagnosis takes 3 to 4 weeks. Quick Win implementations run in 4 to 8 weeks. More complex projects take 2 to 4 months."
          }
        },
        {
          "@type": "Question",
          "name": "Will AI replace my employees?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "What AI replaces is tasks, not people. The goal isn't to cut headcount, it's to multiply what each person can do by removing low-value repetitive work."
          }
        },
        {
          "@type": "Question",
          "name": "How do I know if my company is ready to use AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You don't need to be ready to start, you need to know where you stand. The diagnosis measures 5 dimensions of operational maturity that determine your current ERA and what level of AI you can absorb today."
          }
        },
        {
          "@type": "Question",
          "name": "Can my current team use AI or do I need to hire specialists?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Your current team can use AI. The architecture we deliver is designed for people without technical knowledge, with a 1 to 2 hour onboarding."
          }
        },
        {
          "@type": "Question",
          "name": "Which processes should be automated first?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The ones that combine high volume, lots of manual time, and low risk: quotes, recurring reports, data entry between systems, client follow-ups. The diagnosis identifies and ranks them by ROI."
          }
        }
      ]
    },
    k: {
    "faqp-c1-sub": "The real questions about investment, return, and risk.",
    "faqp-c1-tag": "Money & ROI",
    "faqp-c1-title": "How much does it cost and how much comes back?",
    "faqp-c1a1": "It depends on scope. The <strong>ERA Test is free</strong>. Radar Express starts at <strong>[[radarDesde]]</strong> depending on company size, Flight Plan from [[pdvDesde]], and Autopilot from USD 1,500 to USD 8,000 per month — no hourly fees. If the ERA Test shows real opportunities, the Radar cost is deducted from Flight Plan if contracted within [[descuentoDias]] days.",
    "faqp-c1a2": "The average case we work on shows return in <strong>4–8 months</strong>. The case published on this site recovered USD 250K in unbilled processes in the first quarter post-implementation. The diagnosis projects ROI at 12 months per opportunity before you decide whether to invest.",
    "faqp-c1a3": "That's precisely what the diagnosis measures. On average, an SME of 20–50 people loses <strong>between USD 30,000 and USD 80,000 annually</strong> on manual work that could be automated — quotes, reports, follow-ups, data entry. Most don't know because they've never measured it.",
    "faqp-c1a4": "We tell you directly. We won't create a project where there's no real opportunity. If the diagnosis shows your company isn't ready or the ROI doesn't justify the investment, you get that report anyway — and it's yours to use however you want. We prefer clients who move forward with conviction.",
    "faqp-c1q1": "How much does it cost to implement AI in an SME?",
    "faqp-c1q2": "How long does it take to recover the investment?",
    "faqp-c1q3": "How much money is my company losing on repetitive tasks today?",
    "faqp-c1q4": "What happens if the diagnosis shows it's not worth it?",
    "faqp-c2-sub": "Real timelines, no promises of \"implementation in 24 hours\".",
    "faqp-c2-tag": "Time & process",
    "faqp-c2-title": "When will I start seeing results?",
    "faqp-c2a1": "The full diagnosis takes <strong>3–4 weeks</strong>. Quick Win implementations (simple processes) execute in <strong>4–8 weeks</strong>. More complex automation projects take 2–4 months. The diagnosis tells you exactly what to expect before committing time or budget.",
    "faqp-c2a2": "That's the right question. We never start with the critical process — we start with <strong>Quick Wins</strong>: repetitive, low-risk tasks where a failure doesn't affect the core operation. Once the team gains confidence and the process shows results, we scale. The order matters more than the technology.",
    "faqp-c2a3": "Those that combine three things: <strong>high volume, lots of manual time, and low risk if they go wrong</strong>. Typically: quotes, periodic reports, data entry between systems, client and supplier follow-ups. The diagnosis identifies and ranks them by ROI.",
    "faqp-c2a4": "Not necessarily. If the diagnosis detects data gaps, we offer a prior <strong>Data Foundation</strong> project that organizes, cleans and integrates your data. It's an optional step between the diagnosis and AI implementation — with fixed pricing based on complexity.",
    "faqp-c2q1": "How long does it take to implement AI in my company?",
    "faqp-c2q2": "How do I implement AI without breaking current operations?",
    "faqp-c2q3": "Which processes should be automated first?",
    "faqp-c2q4": "Do I need to have my data organized before starting?",
    "faqp-c3-sub": "The biggest myth holding business owners back.",
    "faqp-c3-tag": "Is this for my company?",
    "faqp-c3-title": "Does AI work for an SME?",
    "faqp-c3a1": "No. The most effective AI tools for daily operations are accessible from <strong>USD 50–200 per month</strong>. The problem isn't the tool cost — it's knowing what to automate, in what order and how to integrate it without breaking what already works. That's exactly what 3GI does.",
    "faqp-c3a2": "Professional services (firms, consultancies, healthcare), manufacturing, logistics and transportation, construction and certifications, trade and distribution. If your company has <strong>repeatable processes with 2–50 people</strong>, the method works — regardless of industry. What matters is that there are processes, not that the industry is \"tech\".",
    "faqp-c3a3": "Your current team can use AI — that's the goal. We don't implement solutions that require a new technical team. The architecture we deliver is designed so <strong>people without technical knowledge</strong> can operate and scale the solutions after a 1–2 hour onboarding.",
    "faqp-c3a4": "Yes. We work with companies in <strong>Chile, Mexico, Colombia, Argentina and Peru</strong>. The diagnosis and all phases are done remotely — no travel cost. The only thing that varies between countries is the regulatory context, which we factor into the analysis.",
    "faqp-c3q1": "Is AI only for large companies with a technology budget?",
    "faqp-c3q2": "What industries does it work best for?",
    "faqp-c3q3": "Can my current team use AI or do I need to hire specialists?",
    "faqp-c3q4": "Does it work for companies outside Chile?",
    "faqp-c4-sub": "The questions nobody asks out loud but everyone thinks.",
    "faqp-c4-tag": "The time to act",
    "faqp-c4-title": "What happens if I wait?",
    "faqp-c4a1": "Companies that implement AI first win in <strong>speed, cost and quality</strong> simultaneously. A company that quotes in 3 minutes competes differently from one that takes 35. One that invoices automatically doesn't lose revenue to oversight. The advantage isn't gradual — it's structural. And once established, it's hard to catch up to.",
    "faqp-c4a2": "Not in the way you're worried about. What AI replaces are <strong>tasks</strong>, not people. The employee who spent 35 minutes on a quote now closes more sales in the same time. The one who controlled files manually now supervises exceptions. The goal isn't to reduce headcount — it's to multiply what each person does.",
    "faqp-c4a3": "Those are real risks — and that's why the diagnosis maps them before implementing. We mitigate them with three principles: <strong>start with low-risk processes</strong>, keep data in your infrastructure (no lock-in), and don't automate critical decisions without human review. Zero risk doesn't exist — but calculated risk is manageable.",
    "faqp-c4a4": "A tool is generic. The problem is knowing which one to use, for what process, how to integrate it with what you already have, and how to get your team to adopt it. Without that, the tool becomes another unused license. 3GI doesn't sell you tools — it delivers the <strong>diagnosis, roadmap and accompaniment</strong> to make the change real and measurable.",
    "faqp-c4q1": "What will happen when my competitors implement AI?",
    "faqp-c4q2": "Will AI replace my employees?",
    "faqp-c4q3": "What are the risks of using AI? Errors, privacy, dependency?",
    "faqp-c4q4": "What's the difference between hiring 3GI and buying an AI tool?",
    "faqp-c5-sub": "No fine print. This is the real process.",
    "faqp-c5-tag": "How we work",
    "faqp-c5-title": "Who does the work and how?",
    "faqp-c5a1": "We do the diagnosis, analysis and roadmap. In Flight Plan and Autopilot we accompany implementation with a dedicated consultant. <strong>This is not a course or software</strong> we hand off to you. The goal is that when we're done, your team operates autonomously — without depending on 3GI.",
    "faqp-c5a2": "We work with the tools you already use, not against them. We integrate with <strong>WhatsApp Business, Excel/Google Sheets, ERPs, CRMs</strong> and proprietary systems. The diagnosis maps exactly what systems you have and designs the roadmap on that basis — not on an ideal stack that doesn't exist in your company.",
    "faqp-c5a3": "The tools we recommend depend on the process — there's no universal answer. What we can say: <strong>generic tools without specific implementation are almost always hype</strong>. A chatbot without integration to your systems only answers FAQs. The AI that moves the needle is connected to your real data and flows.",
    "faqp-c5a4": "You don't need to be \"ready\" to start — you need to know where you are. The ERA Test measures exactly that: 5 dimensions of operational maturity that determine your current ERA and what level of AI you can absorb today. There are ERA 1 companies that can implement Quick Wins in weeks. Don't wait for perfection to start.",
    "faqp-c5q1": "Who does the work — you or do you leave me with a tool?",
    "faqp-c5q2": "How do you integrate AI with WhatsApp, Excel, CRM or my current system?",
    "faqp-c5q3": "What AI tools do you recommend and which are just hype?",
    "faqp-c5q4": "How do I know if my company is ready to use AI?",
    "faqp-cta-btn-diag": "Take the free ERA Test",
    "faqp-cta-btn-wa": "Write on WhatsApp",
    "faqp-cta-sub": "From [[testMin]] minutes you'll know what ERA your company is in and what concrete opportunities it has today.",
    "faqp-cta-title": "Still have questions?<br><span>The diagnosis answers them all.</span>",
    "faqp-eq1": "Does your team work all day... or put out fires all day?",
    "faqp-eq2": "How much money does your company lose on tasks someone repeats manually every week?",
    "faqp-eq3": "What process collapses first when demand increases?",
    "faqp-eq4": "How many important decisions are you still making without real data?",
    "faqp-eq5": "Is your company growing... or just accumulating operational chaos?",
    "faqp-eq6": "What part of your operation depends too much on one single person?",
    "faqp-eq7": "What will happen when your competitors do implement AI and you haven't?",
    "faqp-eq8": "Where is the most time lost in your company today — and nobody is measuring it?",
    "faqp-espejo-cta-btn": "Take the free ERA Test",
    "faqp-espejo-cta-txt": "The diagnosis answers <span>exactly</span> that — from [[testMin]] minutes.",
    "faqp-espejo-intro": "If any of these questions <span>resonates with you</span>, you already have the answer you need.",
    "faqp-hero-sub": "No filters. No marketing. The real answers you need to decide if AI makes sense for your business today.",
    "faqp-hero-tag": "Frequently asked questions",
    "faqp-hero-title": "The questions business owners ask<br>before taking the step.",
  },
  },
};
