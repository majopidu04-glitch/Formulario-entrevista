import { InterviewAnswers, InterviewRecord } from './types';

export interface InterviewSectionDef {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
}

export const INTERVIEW_SECTIONS: InterviewSectionDef[] = [
  {
    id: 'identificacion',
    number: '01',
    title: 'Ficha de Identificación',
    shortTitle: 'Identificación',
    description: 'Datos generales de la empresa, fecha y participantes de la sesión.'
  },
  {
    id: 'contexto',
    number: '02',
    title: 'Contexto y Estructura del Área',
    shortTitle: 'Contexto y Equipo',
    description: 'Misión del área, tamaño del equipo, horarios, volumen mensual y canales activos.'
  },
  {
    id: 'procesos',
    number: '03',
    title: 'Ciclo de Atención y Procesos',
    shortTitle: 'Procesos y PQRS',
    description: 'Flujo paso a paso en preventa, seguimiento de pedidos y gestión de PQRS.'
  },
  {
    id: 'tiempos',
    number: '04',
    title: 'Tiempos, SLA y Escalamiento',
    shortTitle: 'Tiempos y SLA',
    description: 'Tiempos de primera respuesta, resolución, priorización y consultas internas.'
  },
  {
    id: 'herramientas',
    number: '05',
    title: 'Herramientas y Registro de Datos',
    shortTitle: 'Tecnología',
    description: 'Sistemas usados, integración de canales, historial de clientes y automatizaciones.'
  },
  {
    id: 'dolores',
    number: '06',
    title: 'Puntos Críticos y Cuellos de Botella',
    shortTitle: 'Puntos Críticos',
    description: 'Motivos frecuentes de contacto, reprocesos, tareas manuales y picos de demanda.'
  },
  {
    id: 'indicadores',
    number: '07',
    title: 'Indicadores (KPIs) y Visión del Proyecto',
    shortTitle: 'KPIs y Visión',
    description: 'Métricas actuales, percepción del cliente y problema prioritario a resolver.'
  },
  {
    id: 'cierre',
    number: '08',
    title: 'Cierre y Documentación de Respaldo',
    shortTitle: 'Cierre y Evidencias',
    description: 'Evidencias solicitadas, valoración diagnóstica y notas finales del entrevistador.'
  }
];

export const CHANNEL_OPTIONS = [
  'Presencial / Punto de venta',
  'Teléfono / Call Center',
  'WhatsApp / Mensajería instantánea',
  'Correo electrónico',
  'Redes sociales (Instagram, Facebook, TikTok)',
  'Chat web / Formulario en sitio web'
];

export const TOOL_OPTIONS = [
  'Excel / Google Sheets',
  'WhatsApp Business (un dispositivo)',
  'WhatsApp Multiagente / API',
  'Correo tradicional (Gmail / Outlook)',
  'CRM (HubSpot, Zendesk, Salesforce, Zoho)',
  'ERP / Sistema de facturación e inventario'
];

export const KPI_OPTIONS = [
  'Nivel de Satisfacción del Cliente (CSAT)',
  'Net Promoter Score (NPS)',
  'Tiempo de Primera Respuesta (FRT)',
  'Tiempo Promedio de Resolución (ART)',
  'Resolución en el Primer Contacto (FCR)',
  'Tasa de quejas, cambios o devoluciones',
  'No se mide formalmente actualmente'
];

export const EVIDENCE_OPTIONS = [
  'Organigrama del área de servicio al cliente',
  'Políticas de cambios, garantías, envíos o devoluciones',
  'Plantillas de respuesta o guiones de atención actuales',
  'Registro o estadística de motivos de contacto del último mes'
];

export function createEmptyAnswers(): InterviewAnswers {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return {
    companyName: '',
    sector: '',
    interviewDate: dateStr,
    interviewTime: '09:00',
    interviewerName: '',
    intervieweeName: '',
    intervieweeRole: '',
    areaName: 'Servicio al Cliente',

    areaObjective: '',
    crossAreaCoordination: '',
    teamSize: '',
    teamRoles: '',
    serviceHours: '',
    monthlyVolume: '',
    channels: [],
    otherChannel: '',

    presaleFlow: '',
    orderTrackingFlow: '',
    trackingProactivity: '',
    pqrsReception: '',
    pqrsValidation: '',
    pqrsEscalation: '',
    pqrsClosure: '',
    protocolExistence: '',
    protocolNotes: '',

    firstResponseTime: '',
    resolutionTime: '',
    prioritizationCriteria: '',
    internalDependencies: '',
    internalQueryWaitTime: '',

    toolsUsed: [],
    otherTools: '',
    channelsIntegrated: '',
    customerDataStored: '',
    historyLookupProcess: '',
    currentAutomations: '',

    topContactReasons: '',
    mainBottlenecks: '',
    repetitiveManualTasks: '',
    peakDemandHandling: '',

    kpisMeasured: [],
    customerPraise: '',
    customerComplaints: '',
    priorityProblemToSolve: '',
    constraintsAndBudget: '',

    evidenceChecklist: [],
    interviewerObservations: '',
    standardizationLevel: 0,
    perceivedMaturity: 0,
    customQuestions: []
  };
}

export function createNewInterview(title = 'Nueva Entrevista'): InterviewRecord {
  const now = new Date().toISOString();
  return {
    meta: {
      id: `ent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      status: 'borrador',
      createdAt: now,
      updatedAt: now
    },
    answers: createEmptyAnswers()
  };
}

export function normalizeInterviewRecord(raw: Partial<InterviewRecord>): InterviewRecord {
  const base = createNewInterview();
  const rawMeta = (raw.meta || {}) as Partial<InterviewRecord['meta']>;
  const rawAnswers = (raw.answers || {}) as Partial<InterviewAnswers>;

  return {
    meta: {
      id: rawMeta.id || base.meta.id,
      title: rawMeta.title || rawAnswers.companyName || base.meta.title,
      status: rawMeta.status === 'completada' ? 'completada' : 'borrador',
      createdAt: rawMeta.createdAt || base.meta.createdAt,
      updatedAt: rawMeta.updatedAt || base.meta.updatedAt
    },
    answers: {
      ...base.answers,
      ...rawAnswers,
      channels: Array.isArray(rawAnswers.channels) ? rawAnswers.channels : [],
      toolsUsed: Array.isArray(rawAnswers.toolsUsed) ? rawAnswers.toolsUsed : [],
      kpisMeasured: Array.isArray(rawAnswers.kpisMeasured) ? rawAnswers.kpisMeasured : [],
      evidenceChecklist: Array.isArray(rawAnswers.evidenceChecklist)
        ? rawAnswers.evidenceChecklist
        : [],
      customQuestions: Array.isArray(rawAnswers.customQuestions)
        ? rawAnswers.customQuestions
        : []
    }
  };
}

export function createSampleInterview(): InterviewRecord {
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];
  return {
    meta: {
      id: `sample-glow-${Date.now()}`,
      title: 'Ejemplo · Glow Beauty',
      status: 'completada',
      createdAt: now,
      updatedAt: now
    },
    answers: {
      companyName: 'Glow Beauty Cosméticos S.A.',
      sector: 'Comercio electrónico / Cosmética y cuidado personal',
      interviewDate: dateStr,
      interviewTime: '10:30',
      interviewerName: 'Equipo de Consultoría',
      intervieweeName: 'Laura Martínez',
      intervieweeRole: 'Coordinadora de Experiencia y Servicio al Cliente',
      areaName: 'Experiencia del Cliente (CX)',

      areaObjective:
        'Acompañar al cliente en la elección de tonos, garantizar entregas puntuales y resolver garantías o cambios con enfoque cercano.',
      crossAreaCoordination:
        'Coordinación diaria con Bodega/Logística para guías de envío, Ventas para asesoría de catálogo y Contabilidad para reembolsos.',
      teamSize: '4 personas',
      teamRoles: '1 Coordinadora de CX y 3 Asesoras de atención multicanal.',
      serviceHours: 'Lunes a sábado de 8:00 a 19:00',
      monthlyVolume: '1,250 solicitudes mensuales aprox.',
      channels: [
        'WhatsApp / Mensajería instantánea',
        'Correo electrónico',
        'Redes sociales (Instagram, Facebook, TikTok)',
        'Chat web / Formulario en sitio web'
      ],
      otherChannel: '',

      presaleFlow:
        'La clienta escribe por Instagram o WhatsApp pidiendo recomendación de tono. La asesora solicita foto con luz natural, consulta disponibilidad en tienda web y envía enlace directo del producto.',
      orderTrackingFlow:
        'Se envía correo automático al despachar, pero si hay retraso de transportadora la clienta suele escribir preguntando por su guía.',
      trackingProactivity: 'mixto',
      pqrsReception:
        'Se recibe el caso por WhatsApp o correo y se anota manualmente en una hoja de cálculo compartida con fecha y número de orden.',
      pqrsValidation:
        'Se solicita foto del producto recibido, número de pedido y video corto si hubo daño en transporte.',
      pqrsEscalation:
        'Reembolsos superiores a $40 USD o fallas reiteradas de transportadora se escalan a la Coordinadora y Contabilidad.',
      pqrsClosure:
        'Se envía nuevo producto o nota crédito y se pregunta por WhatsApp si el paquete llegó conforme.',
      protocolExistence: 'si_parcial',
      protocolNotes:
        'Existen políticas de garantía en la web, pero cada asesora redacta las respuestas de forma distinta sin un manual unificado.',

      firstResponseTime: '45 min en WhatsApp / 6 horas en correo e Instagram',
      resolutionTime: '24 a 72 horas hábiles según respuesta de bodega',
      prioritizationCriteria: 'Primero reclamos de pedidos pagados no entregados, luego orden de llegada.',
      internalDependencies: 'Estado real de despacho en bodega y confirmación de abono en pasarela/contabilidad.',
      internalQueryWaitTime: 'Entre 2 y 5 horas mientras logística revisa el manifiesto de la transportadora.',

      toolsUsed: [
        'Excel / Google Sheets',
        'WhatsApp Business (un dispositivo)',
        'Correo tradicional (Gmail / Outlook)'
      ],
      otherTools: 'Mensajería nativa de Instagram (Meta Business Suite)',
      channelsIntegrated: 'ninguna',
      customerDataStored: 'Nombre, teléfono, número de orden y motivo resumido en Excel.',
      historyLookupProcess:
        'Buscando por nombre o número en el historial de WhatsApp o filtrando manualmente el Excel mensual.',
      currentAutomations: 'Solo mensaje de ausencia fuera de horario en WhatsApp Business.',

      topContactReasons:
        '1) Consulta de estado de envío y número de guía (38%).\n2) Asesoría para elegir tono de base o labial (29%).\n3) Solicitud de cambio por tono equivocado o empaque averiado (18%).',
      mainBottlenecks:
        'No tener visibilidad inmediata del estado del envío sin preguntar a bodega; y que los mensajes de Instagram y WhatsApp se responden en pantallas separadas.',
      repetitiveManualTasks:
        'Copiar y pegar números de guía, registrar reclamos en Excel y responder preguntas frecuentes sobre envíos gratis y tiempos.',
      peakDemandHandling:
        'En lanzamientos o quincenas se acumulan hasta 120 chats sin leer y algunas consultas de Instagram tardan más de 24 horas.',

      kpisMeasured: [
        'Tiempo de Primera Respuesta (FRT)',
        'Tasa de quejas, cambios o devoluciones'
      ],
      customerPraise: 'La amabilidad del trato personalizado y la calidad de los empaques.',
      customerComplaints: 'Demora en respuestas por Instagram y falta de actualización proactiva de guías de envío.',
      priorityProblemToSolve:
        'Centralizar los canales de atención en un solo flujo con trazabilidad de pedidos y respuestas ágiles para reducir tiempos a menos de 15 minutos.',
      constraintsAndBudget:
        'Presupuesto moderado; se requiere una solución intuitiva que el equipo actual de 4 personas pueda operar sin soporte técnico permanente.',

      evidenceChecklist: [
        'Políticas de cambios, garantías, envíos o devoluciones',
        'Registro o estadística de motivos de contacto del último mes'
      ],
      interviewerObservations:
        'Excelente disposición del equipo. La oportunidad principal está en unificar canales, estandarizar guiones PQRS e integrar el seguimiento de órdenes.',
      standardizationLevel: 2,
      perceivedMaturity: 3,
      customQuestions: []
    }
  };
}

export function calculateCompletion(answers: InterviewAnswers): {
  filled: number;
  total: number;
  percent: number;
} {
  const stringFields: (keyof InterviewAnswers)[] = [
    'companyName',
    'sector',
    'interviewerName',
    'intervieweeName',
    'intervieweeRole',
    'areaObjective',
    'teamSize',
    'serviceHours',
    'monthlyVolume',
    'presaleFlow',
    'orderTrackingFlow',
    'trackingProactivity',
    'pqrsReception',
    'pqrsValidation',
    'pqrsEscalation',
    'pqrsClosure',
    'protocolExistence',
    'firstResponseTime',
    'resolutionTime',
    'prioritizationCriteria',
    'channelsIntegrated',
    'customerDataStored',
    'topContactReasons',
    'mainBottlenecks',
    'repetitiveManualTasks',
    'priorityProblemToSolve'
  ];

  const arrayFields: (keyof InterviewAnswers)[] = [
    'channels',
    'toolsUsed',
    'kpisMeasured'
  ];

  let filled = 0;
  const total = stringFields.length + arrayFields.length;

  for (const key of stringFields) {
    const val = answers[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      filled++;
    }
  }

  for (const key of arrayFields) {
    const val = answers[key];
    if (Array.isArray(val) && val.length > 0) {
      filled++;
    }
  }

  return {
    filled,
    total,
    percent: Math.round((filled / total) * 100)
  };
}
