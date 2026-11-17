export interface InterviewMeta {
  id: string;
  title: string;
  status: 'borrador' | 'completada';
  createdAt: string;
  updatedAt: string;
}

export interface CustomQuestion {
  id: string;
  sectionId: string;
  question: string;
  answer: string;
}

export interface InterviewAnswers {
  // 1. Ficha de Identificación
  companyName: string;
  sector: string;
  interviewDate: string;
  interviewTime: string;
  interviewerName: string;
  intervieweeName: string;
  intervieweeRole: string;
  areaName: string;

  // 2. Contexto y Estructura del Área
  areaObjective: string;
  crossAreaCoordination: string;
  teamSize: string;
  teamRoles: string;
  serviceHours: string;
  monthlyVolume: string;
  channels: string[];
  otherChannel: string;

  // 3. Levantamiento del Proceso de Atención
  presaleFlow: string;
  orderTrackingFlow: string;
  trackingProactivity: 'proactivo' | 'reactivo' | 'mixto' | '';
  pqrsReception: string;
  pqrsValidation: string;
  pqrsEscalation: string;
  pqrsClosure: string;
  protocolExistence: 'si_uniforme' | 'si_parcial' | 'no_informal' | '';
  protocolNotes: string;

  // 4. Tiempos, SLA y Flujo de Información
  firstResponseTime: string;
  resolutionTime: string;
  prioritizationCriteria: string;
  internalDependencies: string;
  internalQueryWaitTime: string;

  // 5. Herramientas y Registro de Datos
  toolsUsed: string[];
  otherTools: string;
  channelsIntegrated: 'total' | 'parcial' | 'ninguna' | '';
  customerDataStored: string;
  historyLookupProcess: string;
  currentAutomations: string;

  // 6. Puntos Críticos y Cuellos de Botella
  topContactReasons: string;
  mainBottlenecks: string;
  repetitiveManualTasks: string;
  peakDemandHandling: string;

  // 7. Indicadores (KPIs) y Visión del Proyecto
  kpisMeasured: string[];
  customerPraise: string;
  customerComplaints: string;
  priorityProblemToSolve: string;
  constraintsAndBudget: string;

  // 8. Cierre y Evidencias
  evidenceChecklist: string[];
  interviewerObservations: string;
  standardizationLevel: number; // 1-5
  perceivedMaturity: number; // 1-5

  // Preguntas personalizadas agregadas por el usuario
  customQuestions: CustomQuestion[];
}

export interface InterviewRecord {
  meta: InterviewMeta;
  answers: InterviewAnswers;
}
