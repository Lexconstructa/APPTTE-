/* ==========================================================================
   Datos del Caso, Agentes y Estructuras de la Simulación "LexConstructa"
   ========================================================================== */

const LEX_DATA = {
  caso: {
    titulo: "Expte. MP-4822/2026: Lindero Calle Sucre 1420 c/ Fideicomiso Altos del Parque s/ Daños y Perjuicios por Excavación",
    ubicacion: "Calle Sucre 1420 / 1424, Comuna 13",
    fechaIncidente: "18 de Noviembre de 2026 - 06:45 hs",
    obraDemandada: {
      nombre: "Torre Residencial Altos del Parque",
      tipo: "Edificio de Vivienda Colectiva (PB + 10 Pisos + 2 Subsuelos de Cocheras)",
      superficie: "4.850 m² cubiertos",
      estadoObra: "Excavación de segundo subsuelo concluida al 80%. Hormigonado de tabiques de submuración parcial (boca de ataque tramos 2 y 4 pendientes).",
      empresaConstructora: "Constructora del Plata S.A.",
      direccionObra: "Arq. Mariano Benítez (Matr. CPAU 18.442)",
      calculistaEstructural: "Ing. Esteban Valenzuela"
    },
    inmuebleAfectado: {
      propietario: "Familia Rossi (Propietarios residentes)",
      tipo: "Vivienda Unifamiliar de 2 plantas (Antigüedad estimada: 45 años, mampostería portante de ladrillos comunes)",
      danosPrincipales: [
        "Fisuras diagonales a 45° en muro medianero compartido (espesor 0.30 m) con abertura de hasta 14 mm en planta baja.",
        "Descuadre y trabado total de aberturas (puerta principal de acceso y ventanal corredizo del estar).",
        "Hundimiento diferencial de solados de 3.5 cm en sector este colindante a la excavación.",
        "Ruptura de acometida de gas natural domiciliaria por asentamiento, con precintado por parte de la distribuidora."
      ]
    },
    marcoLegal: [
      { norma: "CCCN Art. 1273 / 1274", concepto: "Responsabilidad concurrente del constructor, director de obra y proyectista por ruina total o parcial." },
      { norma: "CCCN Art. 1757 / 1758", concepto: "Responsabilidad objetiva por riesgo o vicio de las cosas e intervenciones peligrosas (excavaciones profundas)." },
      { norma: "CCCN Art. 1986 / 1987", concepto: "Régimen de condominio y conservación de muros medianeros." },
      { norma: "Ley Nacional 26.589", concepto: "Instancia prejudicial obligatoria de mediación civil para evitar el litigio ordinario." },
      { norma: "Código de Edificación Local", concepto: "Obligación de apuntalamiento continuo, aviso previo fehaciente de submuración y seguro de responsabilidad civil a linderos." }
    ],
    fotosEvidencia: [
      { id: "evid-1", titulo: "Grieta en Muro Medianero (Planta Baja)", tipo: "Patología Estructural", severidad: "Crítica", detalle: "Fisura en cizallamiento de 12-14 mm con desprendimiento de revoque grueso." },
      { id: "evid-2", titulo: "Trinchera de Excavación sin Entibar", tipo: "Falla de Proceso Constructivo", severidad: "Grave", detalle: "Banquina de tierra expuesta a 4.20 m de profundidad sin apuntalamiento ni hormigonado alternado." },
      { id: "evid-3", titulo: "Hundimiento de Pavimento Interior", tipo: "Asentamiento Diferencial", severidad: "Media-Alta", detalle: "Separación del zócalo de 32 mm en el living-comedor del inmueble lindero." }
    ]
  },

  fases: [
    { id: 1, nombre: "Apertura & Planteo", duracionMin: 30, rangoMin: "0 - 30 min", descripcion: "Análisis del caso pericial, lectura de fotos técnicas y detección de responsabilidades preliminares." },
    { id: 2, nombre: "Marco Teórico & Píldoras", duracionMin: 30, rangoMin: "30 - 60 min", descripcion: "Consultas normativas del CCCN y técnicas de submuración y apuntalamiento." },
    { id: 3, nombre: "Organización de Equipos", duracionMin: 10, rangoMin: "60 - 70 min", descripcion: "Asunción de roles dentro de los 4 grupos (técnico, letrado y fáctico)." },
    { id: 4, nombre: "Laboratorio Documental", duracionMin: 40, rangoMin: "70 - 110 min", descripcion: "Redacción y validación de Carta Documento intimatoria e Informe Pericial de Daños." },
    { id: 5, nombre: "Sala de Mediación", duracionMin: 40, rangoMin: "110 - 150 min", descripcion: "Audiencia prejudicial cara a cara, control del taxímetro de obra y tensión negocial." },
    { id: 6, nombre: "Evaluación & Cierre", duracionMin: 30, rangoMin: "150 - 180 min", descripcion: "Firma de actas (acuerdo o fracaso), rúbrica por desempeño y balance deontológico." }
  ],

  grupos: [
    {
      id: "G1",
      nombre: "Equipo Vecinos A (Grupo 1)",
      postura: "Parte Reclamante / Damnificados",
      color: "border-sky-500",
      bgBadge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      roles: [
        { rol: "Arquitecto Perito de Parte", estudiante: "Estudiante 1", tarea: "Cuantificación técnica de daños, relevamiento de fisuras y presupuesto de reparación integral." },
        { rol: "Abogado Patrocinante Principal", estudiante: "Estudiante 2", tarea: "Redacción de Carta Documento, encuadre en CCCN Arts. 1273/1757 y estrategia cautelar." },
        { rol: "Damnificado Directo (Fáctico)", estudiante: "Estudiante 3", tarea: "Defensa del resguardo familiar, gastos de hospedaje urgente y daño moral." },
        { rol: "Abogado Negociador Adjunto", estudiante: "Estudiante 4", tarea: "Manejo de pretensiones en audiencia, concesiones y análisis del costo de litigio." },
        { rol: "Asistente Técnico Documental", estudiante: "Estudiante 5", tarea: "Recopilación de pruebas fotográficas, facturas de apuntalamiento de urgencia y actas notariales." }
      ],
      pretensionInicial: 38500000,
      limiteMinimoAceptable: 26000000
    },
    {
      id: "G2",
      nombre: "Equipo Constructora A (Grupo 2)",
      postura: "Parte Reclamada / Empresa & D.O.",
      color: "border-amber-500",
      bgBadge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      roles: [
        { rol: "Director de Obra (Arquitecto)", estudiante: "Estudiante 6", tarea: "Defensa del plan de excavación, prueba de vicios de humedad preexistentes en la medianera." },
        { rol: "Asesor Letrado Corporativo", estudiante: "Estudiante 7", tarea: "Contestación de Carta Documento, rechazo de responsabilidad objetiva pura y oferta prejudicial." },
        { rol: "Gerente del Fideicomiso / Desarrollador", estudiante: "Estudiante 8", tarea: "Cálculo del taxímetro de obra paralizada y presupuesto máximo indemnizatorio." },
        { rol: "Ingeniero Especialista en Suelos", estudiante: "Estudiante 9", tarea: "Propuesta de inyección de resinas y apuntalamiento telescópico sin paralizar la torre." },
        { rol: "Coordinador de Seguros y Fianzas", estudiante: "Estudiante 10", tarea: "Activación de póliza de Todo Riesgo Construcción y límite de franquicia." }
      ],
      ofertaInicial: 12000000,
      limiteMaximoOferta: 29000000
    },
    {
      id: "G3",
      nombre: "Equipo Vecinos B (Grupo 3)",
      postura: "Parte Reclamante / Damnificados",
      color: "border-sky-500",
      bgBadge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      roles: [
        { rol: "Arquitecto Perito de Parte", estudiante: "Estudiante 11", tarea: "Relevamiento de grietas en primer piso e inclinación de muro divisorio." },
        { rol: "Abogado Patrocinante Principal", estudiante: "Estudiante 12", tarea: "Planteo de medida cautelar de paralización total bajo apercibimiento penal." },
        { rol: "Damnificado Directo (Fáctico)", estudiante: "Estudiante 13", tarea: "Exigencia de relocalización inmediata en apart hotel para 4 personas." },
        { rol: "Abogado Negociador Adjunto", estudiante: "Estudiante 14", tarea: "Estrategia de mediación para lograr restitución in integrum en plazo perentorio." },
        { rol: "Asistente Técnico Documental", estudiante: "Estudiante 15", tarea: "Revisión de planos de archivo del catastro municipal." }
      ],
      pretensionInicial: 42000000,
      limiteMinimoAceptable: 28000000
    },
    {
      id: "G4",
      nombre: "Equipo Constructora B (Grupo 4)",
      postura: "Parte Reclamada / Empresa & D.O.",
      color: "border-amber-500",
      bgBadge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      roles: [
        { rol: "Director de Obra (Arquitecto)", estudiante: "Estudiante 16", tarea: "Demostración de adecuación técnica al plan de excavación por troneras." },
        { rol: "Asesor Letrado Corporativo", estudiante: "Estudiante 17", tarea: "Alegación de culpa de la víctima por falta de mantenimiento en revoques centenarios." },
        { rol: "Gerente del Fideicomiso / Desarrollador", estudiante: "Estudiante 18", tarea: "Defensa del cronograma financiero y cálculo de penalidades por demora en entregas." },
        { rol: "Ingeniero Especialista en Suelos", estudiante: "Estudiante 19", tarea: "Plan de recalce de cimientos de la casa vecina a cargo de la constructora." },
        { rol: "Coordinador de Seguros y Fianzas", estudiante: "Estudiante 20", tarea: "Negociación con liquidadores de siniestros de la compañía aseguradora." }
      ],
      ofertaInicial: 14000000,
      limiteMaximoOferta: 31000000
    }
  ],

  agentesIA: [
    {
      id: "pedagogo",
      nombre: "Agente Pedagogo / Andamiador",
      alias: "Cognitive Scaffolder",
      icono: "GraduationCap",
      color: "border-blue-500 bg-blue-950/40 text-blue-400",
      tag: "Transposición Didáctica & Conceptos",
      especialidad: "Traduce terminología jurídica densa a lógica arquitectónica y formula preguntas socráticas sin regalar respuestas directas.",
      intervenciones: [
        {
          nivel: "Nivel 1: Pista Conceptual",
          trigger: "Consulta sobre daños",
          dialogo: "¿Qué diferencia técnica y jurídica existe entre el daño emergente directo (la pared rajada y el puntal) y el lucro cesante si el lindero ejerciera una profesión en su hogar?"
        },
        {
          nivel: "Nivel 2: Conexión Normativa",
          trigger: "Responsabilidad del constructor",
          dialogo: "Revisen el Art. 1757 del CCCN. Al tratarse de una excavación profunda, la responsabilidad es objetiva. No discutan si hubo 'mala fe', sino la relación causal directa entre la vibración/descalce y la fisura."
        },
        {
          nivel: "Nivel 3: Modelado Técnico",
          trigger: "Borrador de Carta Documento",
          dialogo: "Sugerencia de vocabulario: eviten decir 'arreglen la casa urgente'; empleen 'intimamos al afianzamiento estructural preventivo e indemnización integral bajo apercibimiento de solicitar medida de no innovar'."
        }
      ]
    },
    {
      id: "disenador",
      nombre: "Agente Diseñador Didáctico",
      alias: "Instructional & Technical Architect",
      icono: "FileCheck2",
      color: "border-slate-400 bg-slate-900/60 text-slate-300",
      tag: "Estructuración Documental & Rúbricas",
      especialidad: "Verifica la estructura formal de cartas documento, informes técnicos de daños e impone listas de cotejo de validez profesional.",
      intervenciones: [
        {
          nivel: "Checklist de Carta Documento",
          trigger: "Revisión intimación",
          dialogo: "Validación formal: Asegúrate de consignar (1) Lugar y fecha cierta, (2) Calidad de remitente y personería, (3) Plazo de intimación perentorio (ej. 48 hs), (4) Domicilio constituido y (5) Apercibimiento procesal."
        },
        {
          nivel: "Checklist de Informe Pericial",
          trigger: "Revisión técnica",
          dialogo: "Estructura requerida: 1. Carátula y Objeto del peritaje; 2. Antecedentes del inmueble; 3. Inspección Ocular y Descripción de Patologías; 4. Nexo Causal con la Excavación; 5. Propuesta de Reparación y Presupuesto Detallado."
        }
      ]
    },
    {
      id: "gamificador",
      nombre: "Agente Gamificador / Dinamizador",
      alias: "Simulation Driver & Crisis Engine",
      icono: "Flame",
      color: "border-orange-500 bg-orange-950/40 text-orange-400",
      tag: "Presión Temporal & Cartas de Crisis",
      especialidad: "Mantiene la adrenalina y tensión del entorno real: gestiona el taxímetro de costo por minuto de obra paralizada y dispara eventos disruptivos.",
      intervenciones: [
        {
          nivel: "Taxímetro de Obra",
          trigger: "Minutos de Audiencia",
          dialogo: "¡Atención Constructora! La paralización de la grúa y los sueldos de cuadrilla están consumiendo $15.000 por minuto transcurrido. Cada retraso en el acuerdo licua su margen de ganancia."
        },
        {
          nivel: "Barra de Tensión Negocial",
          trigger: "Diferencia de ofertas",
          dialogo: "La brecha entre la pretensión de Vecinos ($38M) y la oferta de Constructora ($12M) está en el 68%. Si no aproximan posiciones en los próximos 10 minutos, la mediación se declara FRACASADA y van a juicio de 4 años."
        }
      ]
    }
  ],

  cartasCrisis: [
    {
      id: "crisis-1",
      minutoTrigger: 75,
      codigo: "CRISIS-METEO-01",
      titulo: "Alerta Naranja: Lluvias Torrenciales Inminentes",
      severidad: "Urgencia Extrema",
      color: "border-red-500 bg-red-950/40 text-red-300",
      impacto: "Riesgo crítico de descalce de suelo no consolidado en la base del muro medianero dentro de las próximas 12 horas.",
      descripcion: "El Servicio Meteorológico emite alerta por tormentas severas con caída de más de 80 mm de agua. Si la banquina de tierra no se hormigona o entiba inmediatamente, el empuje hidrostático puede ocasionar el colapso del muro de la casa lindera.",
      opcionesDocente: [
        "Inyectar a Grupos Vecinos (Exigir apuntalamiento inmediato en 2 horas).",
        "Inyectar a Grupos Constructora (Autorizar hormigonado urgente de emergencia o asumir costo de ruina total)."
      ],
      consecuenciaEconomica: "+ $6.500.000 en trabajos de emergencia de bombeo y apuntalamiento."
    },
    {
      id: "crisis-2",
      minutoTrigger: 110,
      codigo: "CRISIS-DGFYCO-02",
      titulo: "Inspección de Guardia de Auxilio Municipal",
      severidad: "Riesgo Legal / Cese de Actividad",
      color: "border-amber-500 bg-amber-950/40 text-amber-300",
      impacto: "Clausura preventiva de la vereda lindera e intimación de desalojo a la familia damnificada.",
      descripcion: "Inspectores de la Dirección General de Fiscalización y Control de Obras labran acta con orden de clausura inmediata del tramo de acera y recomiendan a los vecinos autoevacuarse por riesgo de desprendimiento de cornisa.",
      opcionesDocente: [
        "Subir exigencia de indemnización por alquiler inmediato de emergencia.",
        "Generar multa contravencional a la constructora de $4.200.000 si no colocan bandeja de protección aérea."
      ],
      consecuenciaEconomica: "+ $1.800.000 por gastos de mudanza y guarda-muebles de urgencia."
    },
    {
      id: "crisis-3",
      minutoTrigger: 135,
      codigo: "CRISIS-MEDIA-03",
      titulo: "Cobertura Mediática y Escrache en Redes",
      severidad: "Riesgo Reputacional / Comercial",
      color: "border-orange-500 bg-orange-950/40 text-orange-300",
      impacto: "Vecinos difunden video de las grietas en TikTok y noticiero barrial; compradores de pozo exigen explicaciones.",
      descripcion: "Un video que muestra la puerta trabada y el zócalo desprendido se vuelve viral localmente. Tres compradores de unidades en pozo amenazan con rescindir boleto de compraventa si no se garantiza la estabilidad estructural.",
      opcionesDocente: [
        "Constructora debe ofrecer cláusula de confidencialidad en el acuerdo de mediación.",
        "Vecinos ganan poder de negociación testimonial ante la opinión pública."
      ],
      consecuenciaEconomica: "Riesgo de rescisión de boletos por USD 280.000."
    }
  ],

  rubricaEvaluacion: [
    {
      criterio: "Rigor Técnico Arquitectónico",
      peso: "25%",
      descripcion: "Precisión en la descripción de patologías (asentamiento diferencial vs. tracción), diagnóstico de submuración y viabilidad de las soluciones de ingeniería.",
      niveles: [
        { valor: 1, etiqueta: "Insuficiente", desc: "Confunde términos estructurales y no identifica la causa del descalce." },
        { valor: 2, etiqueta: "En Desarrollo", desc: "Identifica fisuras pero la propuesta de apuntalamiento es deficiente." },
        { valor: 3, etiqueta: "Competente", desc: "Aplica correctamente conceptos de CCCN y submuración por troneras alternadas." },
        { valor: 4, etiqueta: "Distinguido", desc: "Análisis pericial impecable con cotización constructiva detallada y medidas preventivas." }
      ]
    },
    {
      criterio: "Fundamentación Jurídica y Procesal",
      peso: "25%",
      descripcion: "Encuadre en Arts. 1273, 1757 y 1986 del CCCN; validez formal de la Carta Documento y manejo de la Ley 26.589 de Mediación.",
      niveles: [
        { valor: 1, etiqueta: "Insuficiente", desc: "Errores sustanciales en la intimación y reclamos legalmente improcedentes." },
        { valor: 2, etiqueta: "En Desarrollo", desc: "Cita artículos de memoria sin articular la relación de causalidad." },
        { valor: 3, etiqueta: "Competente", desc: "Estructura procesal sólida con plazos perentorios y personería acreditada." },
        { valor: 4, etiqueta: "Distinguido", desc: "Estrategia litigiosa y prejudicial balanceada con reservas precisas de derechos." }
      ]
    },
    {
      criterio: "Habilidades de Negociación Profesional",
      peso: "30%",
      descripcion: "Capacidad para conciliar intereses opuestos, administración del taxímetro de obra, flexibilidad y redacción de cláusulas de acuerdo duraderas.",
      niveles: [
        { valor: 1, etiqueta: "Insuficiente", desc: "Postura intransigente que conduce inevitablemente al fracaso de la mediación." },
        { valor: 2, etiqueta: "En Desarrollo", desc: "Negocia únicamente sobre dinero sin ofrecer soluciones técnicas compensatorias." },
        { valor: 3, etiqueta: "Competente", desc: "Maneja zonas de posible acuerdo (ZOPA) y pacta garantías de obra." },
        { valor: 4, etiqueta: "Distinguido", desc: "Liderazgo en la sala, solución 'ganar-ganar', cronograma vinculante de obras y acta sin fisuras legales." }
      ]
    },
    {
      criterio: "Interdisciplinariedad y Trabajo en Equipo",
      peso: "20%",
      descripcion: "Articulación armónica entre el perfil del arquitecto y el abogado; cumplimiento ético y deontológico universitario.",
      niveles: [
        { valor: 1, etiqueta: "Insuficiente", desc: "Monopolio de un solo estudiante; descoordinación manifiesta en la audiencia." },
        { valor: 2, etiqueta: "En Desarrollo", desc: "División de tareas sin diálogo real entre la postura técnica y la letrada." },
        { valor: 3, etiqueta: "Competente", desc: "Distribución equitativa y complementaria de intervenciones profesionales." },
        { valor: 4, etiqueta: "Distinguido", desc: "Sinergia profesional universitaria ejemplar con respeto irrestricto de las normas deontológicas." }
      ]
    }
  ]
};
