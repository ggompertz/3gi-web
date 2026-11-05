// Textos del formulario «Preparación del Radar». Una entrada por pregunta y por opción de src/data/radar-previo/*.json;
// `verificarCobertura` hace fallar el build si falta o sobra alguna. Nomenclatura pública únicamente (Radar, Test ERA).
// El inglés se agrega en el bloque C6 como `en`, con el glosario de marca; hoy solo existe `es`.

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
      revision_resumen: 'Respondiste {n} de {total} preguntas y dejaste {nose} marcadas como «No sé / lo vemos en la reunión».',
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
