// Textos del formulario «Preparación del Radar». Una entrada por pregunta y por opción de src/data/radar-previo/*.json;
// `verificarCobertura` hace fallar el build si falta o sobra alguna. Nomenclatura pública únicamente (Radar, Test ERA).
// El inglés (`en`) usa el glosario de marca: Radar → Radar, Test ERA → ERA Test. Cada idioma debe tener las mismas claves: la prueba
// src/i18n/radar-previo.test.mjs y el build lo exigen. `enlaces` lleva las rutas que cambian por idioma (política de privacidad).

const SEL = (...pares) => Object.fromEntries(pares);

export const radarPrevio = {
  es: {
    ui: {
      pagina_titulo: 'Preparación de tu Radar · 3G Intelligence',
      titulo: 'Preparación de tu Radar',
      subtitulo: 'Cuéntanos cómo funciona tu negocio para que la reunión parta con ventaja.',
      intro_guardado: 'Se guarda solo mientras escribes. Puedes dejarlo y volver con el mismo enlace.',
      intro_tiempo: 'Toma entre 20 y 25 minutos en total.',
      intro_no_se: 'Si no sabes algo o prefieres verlo en la reunión, marca «No sé / lo vemos en la reunión»: es una respuesta válida.',
      intro_privacidad: 'No escribas nombres ni datos personales de tus clientes: solo necesitamos saber cómo funciona tu negocio. Usamos tus respuestas únicamente para preparar tu Radar.',
      privacidad_enlace: 'Política de privacidad',
      empezar: 'Empezar',
      continuar: 'Continuar donde quedé',
      siguiente: 'Siguiente',
      anterior: 'Anterior',
      revisar: 'Revisar y enviar',
      seccion_n_de_total: 'Sección {n} de {total}',
      minutos: '~{m} min',
      obligatoria: 'Obligatoria',
      no_se: 'No sé / lo vemos en la reunión',
      agregar_tarea: 'Agregar otra tarea',
      quitar: 'Quitar',
      tarea_n: 'Tarea {n}',
      elegir: 'Elige una opción',
      precarga_titulo: 'Esto fue lo que nos contaste en el Test ERA:',
      precarga_usar: 'Usar esta respuesta',
      precarga_nota: 'Puedes confirmarla o corregirla.',
      guardando: 'Guardando…',
      guardado: 'Guardado',
      sin_conexion: 'Sin conexión. Tus cambios siguen en esta pantalla y se guardarán apenas vuelva la conexión.',
      error_guardar: 'No pudimos guardar. Tus cambios siguen en esta pantalla; vamos a reintentar.',
      error_validacion: 'Revisa esta respuesta: no tiene el formato esperado.',
      error_tamano: 'Esta respuesta es demasiado larga.',
      conflicto_titulo: 'Este formulario cambió en otra pestaña o dispositivo',
      conflicto_texto: 'Para no perder nada, carga la versión guardada. Tus últimos cambios en esta pantalla no se han guardado.',
      conflicto_boton: 'Cargar la versión guardada',
      cargando: 'Cargando tus respuestas…',
      invalido_titulo: 'Este enlace no es válido o ya venció',
      invalido_texto: 'Escríbenos y te enviamos uno nuevo.',
      contacto: 'chat@3gi.cl',
      error_carga_titulo: 'No pudimos cargar el formulario',
      error_carga_texto: 'Revisa tu conexión y vuelve a intentarlo.',
      reintentar: 'Reintentar',
      cerrado_titulo: 'Este formulario ya fue cerrado',
      cerrado_texto: 'Ya recibimos tus respuestas. Si necesitas cambiar algo, escríbenos.',
      revision_titulo: 'Revisa antes de enviar',
      // Misma frase que el aviso al consultor, el Pipeline y el archivo de respuestas (3gi-platform, textoAvance). «No sé» cuenta como contestada.
      revision_resumen: '{c} de {total} preguntas contestadas (respondidas: {n} · «No sé»: {nose})',
      revision_pendientes: 'Faltan estas preguntas obligatorias:',
      revision_ok: 'Están todas las preguntas obligatorias.',
      revision_ir: 'Ir a la pregunta',
      revision_privacidad: 'Al enviar, usaremos tus respuestas solo para preparar tu Radar.',
      enviar: 'Enviar mis respuestas',
      enviando: 'Enviando…',
      error_enviar: 'No pudimos enviar. Tus respuestas están guardadas; inténtalo de nuevo en unos segundos.',
      enviado_titulo: 'Recibimos tus respuestas',
      enviado_texto: 'Gracias. Las revisaremos antes de la reunión.',
      enviado_editar: 'Puedes editar tus respuestas hasta la reunión. Si cambias algo, tendrás que enviarlas otra vez.',
      editar: 'Editar mis respuestas',
      reabierto: 'Editaste tus respuestas: recuerda enviarlas otra vez al terminar.',
    },
    enlaces: { privacidad: '/privacidad/' },
    secciones: {
      s1: { titulo: 'Tu negocio', minutos: 3 },
      s2: { titulo: 'Tu tiempo', minutos: 4 },
      s3: { titulo: 'Herramientas y datos', minutos: 4 },
      s4: { titulo: 'Datos sensibles y seguridad', minutos: 3 },
      sf: { titulo: 'Cumplimiento normativo', minutos: 2 },
      s5: { titulo: 'Tus clientes: cómo llegan y cómo los sigues', minutos: 3 },
      s6: { titulo: 'Inteligencia artificial y decisiones', minutos: 3 },
      s7: { titulo: 'Tus expectativas', minutos: 3 },
    },
    preguntas: {
      n01: { titulo: 'Cuéntanos cómo gana dinero tu empresa', ayuda: 'Qué ofreces y a quién.' },
      n02: {
        titulo: '¿Cuántas personas trabajan en el negocio, contándote a ti?',
        campos: {
          personas: { label: 'Número de personas' },
          composicion: { label: 'Cómo se compone el equipo', opciones: SEL(['solo_yo', 'Solo yo'], ['yo_dependientes', 'Yo y personas que dependen de mí'], ['yo_externos', 'Yo y colaboradores externos'], ['ambos', 'Ambos']) },
        },
      },
      n03: {
        titulo: '¿Cuántos clientes activos tienes y cómo ha cambiado tu cartera en los últimos 12 meses?',
        campos: {
          clientes: { label: 'Clientes activos hoy', opciones: SEL(['lt15', 'Menos de 15'], ['r15_40', 'Entre 15 y 40'], ['r41_100', 'Entre 41 y 100'], ['gt100', 'Más de 100']) },
          tendencia: { label: 'Tu cartera en los últimos 12 meses', opciones: SEL(['crecio', 'Creció'], ['igual', 'Se mantuvo'], ['bajo', 'Bajó']) },
        },
      },
      n04: { titulo: '¿Qué quieres lograr en los próximos 12 meses?', ayuda: 'Una o dos metas, por ejemplo: más clientes, ordenar el cumplimiento o ahorrar tiempo.' },
      n05: { titulo: 'En este proyecto, ¿quién toma la decisión final?', opciones: SEL(['yo', 'Yo'], ['yo_con_otros', 'Yo, junto con otras personas'], ['otra_persona', 'Otra persona']) },
      n06: {
        titulo: '¿Qué tareas repetitivas te quitan más tiempo?',
        ayuda: 'Hasta tres. Una estimación sirve.',
        campos: {
          area: { label: 'Área', opciones: SEL(['ventas', 'Ventas'], ['atencion_clientes', 'Atención a clientes'], ['operaciones', 'Operaciones'], ['finanzas_administracion', 'Finanzas y administración'], ['cumplimiento', 'Cumplimiento'], ['marketing', 'Marketing'], ['otra', 'Otra']) },
          descripcion: { label: '¿Qué haces?', placeholder: 'Ej.: registrar las recomendaciones de cada cliente' },
          horas: { label: 'Horas por semana' },
          frecuencia: { label: 'Cada cuánto', opciones: SEL(['diaria', 'Todos los días'], ['semanal', 'Cada semana'], ['mensual', 'Cada mes'], ['anual', 'Una vez al año']) },
        },
      },
      n07: { titulo: '¿Cuál de ellas te pesa más?' },
      n08: { titulo: '¿Hay algo que solo tú sabes hacer y que se trabaría si faltas una semana?' },
      n09: {
        titulo: '¿Qué herramientas usas para trabajar?',
        campos: {
          herramientas: { label: 'Marca todas las que uses', opciones: SEL(['excel', 'Excel u hojas de cálculo'], ['whatsapp', 'WhatsApp'], ['correo', 'Correo'], ['drive', 'Google Drive u OneDrive'], ['crm', 'Un CRM'], ['contable_erp', 'Sistema contable o ERP'], ['plataformas_terceros', 'Plataformas de las instituciones con las que trabajo'], ['software_rubro', 'Software propio de mi rubro'], ['otra', 'Otra'], ['ninguna', 'Ninguna']) },
          crm_cual: { label: '¿Cuál CRM?' },
          erp_cual: { label: '¿Cuál sistema contable o ERP?' },
          software_cual: { label: '¿Cuál software del rubro?' },
          otra_cual: { label: '¿Qué otra herramienta?' },
        },
      },
      n10: { titulo: '¿Dónde vive hoy la información de tus clientes?', ayuda: 'Marca la que más se parezca a tu realidad.', opciones: SEL(['cabeza_papel', 'En mi cabeza o en papel'], ['whatsapp_correo', 'En WhatsApp y correos'], ['excel', 'En Excel u hojas de cálculo'], ['sistema_diario', 'En un sistema que uso a diario'], ['varios_conectados', 'En varios sistemas conectados entre sí']) },
      n11: { titulo: '¿Tienes por escrito cómo haces tus procesos principales?', opciones: SEL(['no', 'No'], ['notas', 'Algunas notas'], ['principales', 'Sí, los principales'], ['revisa_mide', 'Sí, y los reviso o mido']) },
      n12: {
        titulo: '¿Has intentado antes digitalizar o automatizar algo?',
        campos: {
          opcion: { label: 'Tu respuesta', opciones: SEL(['no', 'No'], ['si_funciono', 'Sí, y funcionó'], ['si_no_adoptamos', 'Sí, pero no lo adoptamos']) },
          detalle: { label: 'Cuéntanos qué pasó' },
        },
      },
      n13: { titulo: '¿Qué tipos de datos de tus clientes guardas?', ayuda: 'Solo el tipo de dato, no los datos.', opciones: SEL(['identificacion_contacto', 'Identificación y contacto'], ['situacion_financiera', 'Situación financiera o patrimonial'], ['perfil_riesgo', 'Perfil de riesgo o de inversión'], ['salud', 'Salud'], ['menores', 'Datos de menores de edad'], ['ninguno', 'Ninguno']) },
      n14: { titulo: '¿Tienes una política de privacidad y el consentimiento de tus clientes por escrito?', opciones: SEL(['no', 'No'], ['informal', 'Algo informal'], ['escrita', 'Sí, escrita'], ['escrita_revisa', 'Sí, escrita y la reviso periódicamente']) },
      n15: { titulo: '¿Qué medidas usas hoy para proteger esa información?', opciones: SEL(['clave_bloqueo', 'Clave y bloqueo en computador y celular'], ['doble_verificacion', 'Doble verificación en correo y nube'], ['respaldos_auto', 'Respaldos automáticos'], ['disco_cifrado', 'Disco cifrado'], ['confidencialidad_terceros', 'Acuerdos de confidencialidad con terceros'], ['ninguna', 'Ninguna de las anteriores']) },
      n16: {
        titulo: '¿Has tenido algún incidente o susto de seguridad con esa información?',
        campos: {
          opcion: { label: 'Tu respuesta', opciones: SEL(['no', 'No'], ['susto', 'Un susto, sin consecuencias'], ['si', 'Sí']) },
          detalle: { label: 'Si quieres, cuéntanos qué pasó' },
        },
      },
      f01: { titulo: '¿Qué normas te aplican o te preocupan hoy?', opciones: SEL(['ley_fintec', 'Ley Fintec (21.521)'], ['ncg_502', 'NCG 502 de la CMF (registro, autorización y obligaciones de los prestadores)'], ['ley_21719', 'Ley 21.719 de datos personales (vigente desde el 1 de diciembre de 2026)'], ['otra', 'Otra']) },
      f02: { titulo: '¿Cómo registras el perfil de riesgo e idoneidad de cada cliente?', opciones: SEL(['no_formal', 'No lo registro formalmente'], ['papel', 'En papel'], ['excel', 'En Excel'], ['plataforma_institucion', 'En un formulario o plataforma de la institución'], ['formulario_propio', 'En un formulario propio digital']) },
      f03: { titulo: '¿Cómo dejas constancia de tus recomendaciones y de los posibles conflictos de interés?', opciones: SEL(['no_formal', 'No dejo constancia formal'], ['papel', 'En papel'], ['excel', 'En Excel'], ['plataforma_institucion', 'En un formulario o plataforma de la institución'], ['formulario_propio', 'En un formulario propio digital']) },
      f04: { titulo: '¿Cuánto del cumplimiento normativo lo resuelven hoy por ti las instituciones con las que trabajas?', opciones: SEL(['nada', 'Nada'], ['parte', 'Una parte'], ['casi_todo', 'Casi todo']) },
      n17: {
        titulo: '¿De dónde vienen tus clientes nuevos?',
        campos: {
          principal: { label: 'Fuente principal', opciones: SEL(['referidos', 'Referidos'], ['contactos_personales', 'Contactos personales'], ['redes', 'Redes sociales'], ['web_busquedas', 'Sitio web o búsquedas'], ['alianzas_instituciones', 'Alianzas o instituciones'], ['eventos', 'Eventos'], ['otra', 'Otra']) },
          segunda: { label: 'Segunda fuente', opciones: SEL(['referidos', 'Referidos'], ['contactos_personales', 'Contactos personales'], ['redes', 'Redes sociales'], ['web_busquedas', 'Sitio web o búsquedas'], ['alianzas_instituciones', 'Alianzas o instituciones'], ['eventos', 'Eventos'], ['otra', 'Otra']) },
        },
      },
      n18: {
        titulo: '¿Dónde te pueden encontrar hoy?',
        campos: {
          lugares: { label: 'Marca todos los que correspondan', opciones: SEL(['sitio_propio', 'Sitio web propio'], ['ficha_google', 'Ficha de Google'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['otra', 'Otro lugar'], ['ninguno', 'En ningún lugar']) },
          enlaces: { label: 'Enlaces (opcional)' },
        },
      },
      n19: { titulo: '¿Cómo sigues a tus clientes después de la venta?', opciones: SEL(['no_hago', 'No lo hago'], ['cuando_escriben', 'Cuando ellos me escriben'], ['manual_periodico', 'Contacto manual periódico'], ['programado_registro', 'Contacto programado y con registro (CRM o recordatorios)']) },
      n20: { titulo: '¿Con qué frecuencia publicas contenido sobre tu trabajo?', opciones: SEL(['nunca', 'Nunca'], ['rara_vez', 'Rara vez'], ['mensual_mas', 'Una vez al mes o más'], ['semanal', 'Cada semana']) },
      n21: { titulo: '¿Qué parte de tus clientes llegó por recomendación de otro cliente?', opciones: SEL(['casi_ninguno', 'Casi ninguno'], ['algunos_sin_registro', 'Algunos, sin llevar la cuenta'], ['muchos_con_cuenta', 'Muchos, y llevo la cuenta']) },
      n22: { titulo: '¿Qué decisión importante tomas hoy «a ojo» y qué dato te gustaría tener para decidir mejor?' },
      n23: { titulo: 'Si pudieras mejorar un solo proceso con inteligencia artificial, ¿cuál sería?' },
      n24: {
        titulo: '¿Usas inteligencia artificial hoy?',
        campos: {
          opcion: { label: 'Tu respuesta', opciones: SEL(['no', 'No'], ['personal_algo', 'Algo, de forma personal'], ['personal_seguido', 'Seguido, de forma personal'], ['en_procesos', 'En procesos del negocio']) },
          detalle: { label: 'Si la usas, ¿cuál y para qué?' },
        },
      },
      n25: { titulo: 'Cuando has cambiado una forma de trabajar, ¿cómo reaccionó el equipo?', opciones: SEL(['resistencia', 'Con resistencia'], ['desgano', 'Con desgano'], ['disposicion', 'Con disposición'], ['entusiasmo', 'Con entusiasmo']) },
      n26: { titulo: '¿Qué te motivó a pedir esta reunión ahora?', ayuda: 'Un hecho concreto, un problema o una oportunidad.' },
      n27: { titulo: 'Si esto no se resuelve en los próximos 6 meses, ¿qué pasa?' },
      n28: { titulo: '¿Quién más participa en la decisión y qué necesita ver?' },
      n29: {
        titulo: '¿Hay presupuesto asignado este año para tecnología o mejoras? Y si la propuesta te convence, ¿en cuánto tiempo podrías decidir?',
        campos: {
          presupuesto: { label: 'Presupuesto este año', opciones: SEL(['si', 'Sí'], ['no', 'No'], ['depende', 'Depende de la propuesta']) },
          plazo: { label: 'Plazo para decidir', opciones: SEL(['dos_semanas', 'En 2 semanas'], ['uno_dos_meses', 'Entre 1 y 2 meses'], ['mas_dos_meses', 'Más de 2 meses']) },
        },
      },
      n30: { titulo: '¿Cómo sabrás en 6 meses que fue una buena decisión?' },
      n31: { titulo: '¿Algo más que debamos saber, o preguntas para la reunión?', ayuda: 'Opcional.' },
    },
  },
  en: {
    ui: {
      pagina_titulo: 'Radar Preparation · 3G Intelligence',
      titulo: 'Radar Preparation',
      subtitulo: 'Tell us how your business works so the meeting starts one step ahead.',
      intro_guardado: 'It saves automatically as you type. You can leave and come back with the same link.',
      intro_tiempo: 'It takes between 20 and 25 minutes in total.',
      intro_no_se: 'If you are not sure about something or prefer to cover it in the meeting, tick “I don’t know / let’s cover it in the meeting”: it is a valid answer.',
      intro_privacidad: 'Please do not write names or personal data of your customers: we only need to know how your business works. We use your answers only to prepare your Radar.',
      privacidad_enlace: 'Privacy policy',
      empezar: 'Start',
      continuar: 'Continue where I left off',
      siguiente: 'Next',
      anterior: 'Back',
      revisar: 'Review and send',
      seccion_n_de_total: 'Section {n} of {total}',
      minutos: '~{m} min',
      obligatoria: 'Required',
      no_se: 'I don’t know / let’s cover it in the meeting',
      agregar_tarea: 'Add another task',
      quitar: 'Remove',
      tarea_n: 'Task {n}',
      elegir: 'Choose an option',
      precarga_titulo: 'This is what you told us in the ERA Test:',
      precarga_usar: 'Use this answer',
      precarga_nota: 'You can confirm it or correct it.',
      guardando: 'Saving…',
      guardado: 'Saved',
      sin_conexion: 'No connection. Your changes are still on this screen and will be saved as soon as the connection returns.',
      error_guardar: 'We could not save. Your changes are still on this screen; we will try again.',
      error_validacion: 'Please check this answer: it does not have the expected format.',
      error_tamano: 'This answer is too long.',
      conflicto_titulo: 'This form changed in another tab or device',
      conflicto_texto: 'To avoid losing anything, load the saved version. Your latest changes on this screen have not been saved.',
      conflicto_boton: 'Load the saved version',
      cargando: 'Loading your answers…',
      invalido_titulo: 'This link is not valid or has expired',
      invalido_texto: 'Write to us and we will send you a new one.',
      contacto: 'chat@3gi.cl',
      error_carga_titulo: 'We could not load the form',
      error_carga_texto: 'Check your connection and try again.',
      reintentar: 'Try again',
      cerrado_titulo: 'This form is now closed',
      cerrado_texto: 'We have already received your answers. If you need to change something, write to us.',
      revision_titulo: 'Review before sending',
      revision_resumen: '{c} of {total} questions completed (answered: {n} · “I don’t know”: {nose})',
      revision_pendientes: 'These required questions are still missing:',
      revision_ok: 'All required questions are answered.',
      revision_ir: 'Go to the question',
      revision_privacidad: 'By sending, we will use your answers only to prepare your Radar.',
      enviar: 'Send my answers',
      enviando: 'Sending…',
      error_enviar: 'We could not send. Your answers are saved; try again in a few seconds.',
      enviado_titulo: 'We received your answers',
      enviado_texto: 'Thank you. We will review them before the meeting.',
      enviado_editar: 'You can edit your answers until the meeting. If you change anything, you will need to send them again.',
      editar: 'Edit my answers',
      reabierto: 'You edited your answers: remember to send them again when you finish.',
    },
    enlaces: { privacidad: '/en/privacidad/' },
    secciones: {
      s1: { titulo: 'Your business', minutos: 3 },
      s2: { titulo: 'Your time', minutos: 4 },
      s3: { titulo: 'Tools and data', minutos: 4 },
      s4: { titulo: 'Sensitive data and security', minutos: 3 },
      sf: { titulo: 'Regulatory compliance', minutos: 2 },
      s5: { titulo: 'Your customers: how they arrive and how you follow up', minutos: 3 },
      s6: { titulo: 'Artificial intelligence and decisions', minutos: 3 },
      s7: { titulo: 'Your expectations', minutos: 3 },
    },
    preguntas: {
      n01: { titulo: 'Tell us how your company makes money', ayuda: 'What you offer and to whom.' },
      n02: {
        titulo: 'How many people work in the business, counting yourself?',
        campos: {
          personas: { label: 'Number of people' },
          composicion: { label: 'How the team is made up', opciones: SEL(['solo_yo', 'Just me'], ['yo_dependientes', 'Me and people who report to me'], ['yo_externos', 'Me and outside collaborators'], ['ambos', 'Both']) },
        },
      },
      n03: {
        titulo: 'How many active customers do you have, and how has your customer base changed over the last 12 months?',
        campos: {
          clientes: { label: 'Active customers today', opciones: SEL(['lt15', 'Fewer than 15'], ['r15_40', 'Between 15 and 40'], ['r41_100', 'Between 41 and 100'], ['gt100', 'More than 100']) },
          tendencia: { label: 'Your customer base over the last 12 months', opciones: SEL(['crecio', 'It grew'], ['igual', 'It stayed the same'], ['bajo', 'It shrank']) },
        },
      },
      n04: { titulo: 'What do you want to achieve in the next 12 months?', ayuda: 'One or two goals, for example: more customers, getting compliance in order, or saving time.' },
      n05: { titulo: 'In this project, who makes the final decision?', opciones: SEL(['yo', 'I do'], ['yo_con_otros', 'I do, together with other people'], ['otra_persona', 'Someone else']) },
      n06: {
        titulo: 'Which repetitive tasks take up most of your time?',
        ayuda: 'Up to three. An estimate is fine.',
        campos: {
          area: { label: 'Area', opciones: SEL(['ventas', 'Sales'], ['atencion_clientes', 'Customer service'], ['operaciones', 'Operations'], ['finanzas_administracion', 'Finance and administration'], ['cumplimiento', 'Compliance'], ['marketing', 'Marketing'], ['otra', 'Other']) },
          descripcion: { label: 'What do you do?', placeholder: 'E.g.: record the recommendations given to each customer' },
          horas: { label: 'Hours per week' },
          frecuencia: { label: 'How often', opciones: SEL(['diaria', 'Every day'], ['semanal', 'Every week'], ['mensual', 'Every month'], ['anual', 'Once a year']) },
        },
      },
      n07: { titulo: 'Which of them weighs on you the most?' },
      n08: { titulo: 'Is there anything only you know how to do that would stall if you were away for a week?' },
      n09: {
        titulo: 'Which tools do you use for work?',
        campos: {
          herramientas: { label: 'Tick all that apply', opciones: SEL(['excel', 'Excel or spreadsheets'], ['whatsapp', 'WhatsApp'], ['correo', 'Email'], ['drive', 'Google Drive or OneDrive'], ['crm', 'A CRM'], ['contable_erp', 'Accounting system or ERP'], ['plataformas_terceros', 'Platforms of the institutions I work with'], ['software_rubro', 'Software specific to my field'], ['otra', 'Other'], ['ninguna', 'None']) },
          crm_cual: { label: 'Which CRM?' },
          erp_cual: { label: 'Which accounting system or ERP?' },
          software_cual: { label: 'Which field-specific software?' },
          otra_cual: { label: 'Which other tool?' },
        },
      },
      n10: { titulo: 'Where does your customers’ information live today?', ayuda: 'Pick the one closest to your reality.', opciones: SEL(['cabeza_papel', 'In my head or on paper'], ['whatsapp_correo', 'In WhatsApp and emails'], ['excel', 'In Excel or spreadsheets'], ['sistema_diario', 'In a system I use every day'], ['varios_conectados', 'In several systems connected to each other']) },
      n11: { titulo: 'Do you have your main processes written down?', opciones: SEL(['no', 'No'], ['notas', 'Some notes'], ['principales', 'Yes, the main ones'], ['revisa_mide', 'Yes, and I review or measure them']) },
      n12: {
        titulo: 'Have you tried to digitize or automate anything before?',
        campos: {
          opcion: { label: 'Your answer', opciones: SEL(['no', 'No'], ['si_funciono', 'Yes, and it worked'], ['si_no_adoptamos', 'Yes, but we did not adopt it']) },
          detalle: { label: 'Tell us what happened' },
        },
      },
      n13: { titulo: 'What types of customer data do you keep?', ayuda: 'Only the type of data, not the data itself.', opciones: SEL(['identificacion_contacto', 'Identification and contact details'], ['situacion_financiera', 'Financial or asset information'], ['perfil_riesgo', 'Risk or investment profile'], ['salud', 'Health'], ['menores', 'Data of minors'], ['ninguno', 'None']) },
      n14: { titulo: 'Do you have a written privacy policy and your customers’ written consent?', opciones: SEL(['no', 'No'], ['informal', 'Something informal'], ['escrita', 'Yes, in writing'], ['escrita_revisa', 'Yes, in writing, and I review it periodically']) },
      n15: { titulo: 'Which measures do you use today to protect that information?', opciones: SEL(['clave_bloqueo', 'Passwords and screen lock on computer and phone'], ['doble_verificacion', 'Two-step verification on email and cloud'], ['respaldos_auto', 'Automatic backups'], ['disco_cifrado', 'Encrypted disk'], ['confidencialidad_terceros', 'Confidentiality agreements with third parties'], ['ninguna', 'None of the above']) },
      n16: {
        titulo: 'Have you had any security incident or scare with that information?',
        campos: {
          opcion: { label: 'Your answer', opciones: SEL(['no', 'No'], ['susto', 'A scare, without consequences'], ['si', 'Yes']) },
          detalle: { label: 'If you wish, tell us what happened' },
        },
      },
      f01: { titulo: 'Which regulations apply to you or concern you today?', opciones: SEL(['ley_fintec', 'Fintec Law (No. 21,521)'], ['ncg_502', 'CMF General Rule No. 502 (registration, authorization and obligations of providers)'], ['ley_21719', 'Personal Data Law No. 21,719 (in force from 1 December 2026)'], ['otra', 'Other']) },
      f02: { titulo: 'How do you record each customer’s risk and suitability profile?', opciones: SEL(['no_formal', 'I do not record it formally'], ['papel', 'On paper'], ['excel', 'In Excel'], ['plataforma_institucion', 'In a form or platform of the institution'], ['formulario_propio', 'In my own digital form']) },
      f03: { titulo: 'How do you keep a record of your recommendations and of possible conflicts of interest?', opciones: SEL(['no_formal', 'I do not keep a formal record'], ['papel', 'On paper'], ['excel', 'In Excel'], ['plataforma_institucion', 'In a form or platform of the institution'], ['formulario_propio', 'In my own digital form']) },
      f04: { titulo: 'How much of the regulatory compliance do the institutions you work with already handle for you?', opciones: SEL(['nada', 'None'], ['parte', 'Part of it'], ['casi_todo', 'Almost all']) },
      n17: {
        titulo: 'Where do your new customers come from?',
        campos: {
          principal: { label: 'Main source', opciones: SEL(['referidos', 'Referrals'], ['contactos_personales', 'Personal contacts'], ['redes', 'Social media'], ['web_busquedas', 'Website or search'], ['alianzas_instituciones', 'Partnerships or institutions'], ['eventos', 'Events'], ['otra', 'Other']) },
          segunda: { label: 'Second source', opciones: SEL(['referidos', 'Referrals'], ['contactos_personales', 'Personal contacts'], ['redes', 'Social media'], ['web_busquedas', 'Website or search'], ['alianzas_instituciones', 'Partnerships or institutions'], ['eventos', 'Events'], ['otra', 'Other']) },
        },
      },
      n18: {
        titulo: 'Where can people find you today?',
        campos: {
          lugares: { label: 'Tick all that apply', opciones: SEL(['sitio_propio', 'My own website'], ['ficha_google', 'Google Business profile'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['otra', 'Somewhere else'], ['ninguno', 'Nowhere']) },
          enlaces: { label: 'Links (optional)' },
        },
      },
      n19: { titulo: 'How do you follow up with customers after the sale?', opciones: SEL(['no_hago', 'I do not'], ['cuando_escriben', 'When they write to me'], ['manual_periodico', 'Regular manual contact'], ['programado_registro', 'Scheduled contact with a record (CRM or reminders)']) },
      n20: { titulo: 'How often do you publish content about your work?', opciones: SEL(['nunca', 'Never'], ['rara_vez', 'Rarely'], ['mensual_mas', 'Once a month or more'], ['semanal', 'Every week']) },
      n21: { titulo: 'What share of your customers came from another customer’s recommendation?', opciones: SEL(['casi_ninguno', 'Almost none'], ['algunos_sin_registro', 'Some, without keeping count'], ['muchos_con_cuenta', 'Many, and I keep count']) },
      n22: { titulo: 'Which important decision do you make “by feel” today, and what data would you like to have to decide better?' },
      n23: { titulo: 'If you could improve just one process with artificial intelligence, which would it be?' },
      n24: {
        titulo: 'Do you use artificial intelligence today?',
        campos: {
          opcion: { label: 'Your answer', opciones: SEL(['no', 'No'], ['personal_algo', 'A little, personally'], ['personal_seguido', 'Often, personally'], ['en_procesos', 'In business processes']) },
          detalle: { label: 'If you do, which tools and for what?' },
        },
      },
      n25: { titulo: 'When you have changed the way you work, how did the team react?', opciones: SEL(['resistencia', 'With resistance'], ['desgano', 'Reluctantly'], ['disposicion', 'Willingly'], ['entusiasmo', 'With enthusiasm']) },
      n26: { titulo: 'What led you to ask for this meeting now?', ayuda: 'A specific event, a problem or an opportunity.' },
      n27: { titulo: 'If this is not solved in the next 6 months, what happens?' },
      n28: { titulo: 'Who else takes part in the decision, and what do they need to see?' },
      n29: {
        titulo: 'Is there a budget set aside this year for technology or improvements? And if the proposal convinces you, how soon could you decide?',
        campos: {
          presupuesto: { label: 'Budget this year', opciones: SEL(['si', 'Yes'], ['no', 'No'], ['depende', 'It depends on the proposal']) },
          plazo: { label: 'Time to decide', opciones: SEL(['dos_semanas', 'Within 2 weeks'], ['uno_dos_meses', 'Between 1 and 2 months'], ['mas_dos_meses', 'More than 2 months']) },
        },
      },
      n30: { titulo: 'How will you know in 6 months that it was a good decision?' },
      n31: { titulo: 'Anything else we should know, or questions for the meeting?', ayuda: 'Optional.' },
    },
  },
};

const mismas = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** Devuelve la lista de problemas (vacía si el diccionario cubre exactamente la estructura). */
export function problemasDeCobertura(estructura, dic) {
  const p = [];
  const opcionesOk = (donde, def, d) => {
    if (!d?.opciones) return p.push(`${donde}: faltan las opciones`);
    if (!mismas(Object.keys(d.opciones), def.opciones)) p.push(`${donde}: las opciones no coinciden con la estructura`);
  };
  for (const s of estructura.secciones) if (!dic.secciones[s.id]?.titulo || !dic.secciones[s.id]?.minutos) p.push(`sección ${s.id}: falta título o minutos`);
  for (const id of Object.keys(dic.secciones)) if (!estructura.secciones.some((s) => s.id === id)) p.push(`sección ${id}: sobra en el diccionario`);
  for (const [id, def] of Object.entries(estructura.preguntas)) {
    const d = dic.preguntas[id];
    if (!d?.titulo) { p.push(`${id}: falta el título`); continue; }
    if (def.tipo === 'seleccion' || def.tipo === 'multiseleccion') opcionesOk(id, def, d);
    if (def.tipo === 'compuesto' || def.tipo === 'repetidor') {
      if (!d.campos) { p.push(`${id}: faltan los campos`); continue; }
      if (!mismas(Object.keys(d.campos), Object.keys(def.campos))) p.push(`${id}: los campos no coinciden con la estructura`);
      for (const [k, c] of Object.entries(def.campos)) {
        if (!d.campos[k]?.label) p.push(`${id}.${k}: falta la etiqueta`);
        else if (c.tipo === 'seleccion' || c.tipo === 'multiseleccion') opcionesOk(`${id}.${k}`, c, d.campos[k]);
      }
    }
  }
  for (const id of Object.keys(dic.preguntas)) if (!estructura.preguntas[id]) p.push(`${id}: sobra en el diccionario`);
  return p;
}

export function verificarCobertura(estructura, dic) {
  const p = problemasDeCobertura(estructura, dic);
  if (p.length) throw new Error(`RADAR_PREVIO_TEXTOS_INCOMPLETOS — ${p.join('; ')}`);
}
