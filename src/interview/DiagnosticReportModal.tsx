import React from 'react';
import { X, Printer, FileText, FileJson, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { InterviewRecord } from './types';
import { calculateCompletion } from './data';

interface DiagnosticReportModalProps {
  record: InterviewRecord | null;
  onClose: () => void;
}

export const DiagnosticReportModal: React.FC<DiagnosticReportModalProps> = ({
  record,
  onClose
}) => {
  if (!record) return null;

  const { answers, meta } = record;
  const completion = calculateCompletion(answers);

  // Derive objective diagnostic findings directly from the user's answers
  const findings: { level: 'alert' | 'warn' | 'ok'; title: string; detail: string }[] = [];

  if (answers.channelsIntegrated === 'ninguna') {
    findings.push({
      level: 'alert',
      title: 'Canales de atención desintegrados',
      detail:
        'Los canales operan de forma aislada. Esto suele generar pérdida de historial, demoras entre plataformas y respuestas duplicadas.'
    });
  } else if (answers.channelsIntegrated === 'parcial') {
    findings.push({
      level: 'warn',
      title: 'Integración parcial de canales',
      detail:
        'Solo parte de los puntos de contacto convergen en un sistema común; conviene unificar los canales restantes.'
    });
  } else if (answers.channelsIntegrated === 'total') {
    findings.push({
      level: 'ok',
      title: 'Canales centralizados',
      detail: 'El equipo cuenta con visibilidad unificada de las conversaciones.'
    });
  }

  if (answers.protocolExistence === 'no_informal') {
    findings.push({
      level: 'alert',
      title: 'Ausencia de protocolos escritos',
      detail:
        'La atención depende del criterio individual de cada agente, lo cual genera inconsistencia en tiempos y soluciones.'
    });
  } else if (answers.protocolExistence === 'si_parcial') {
    findings.push({
      level: 'warn',
      title: 'Protocolos parcialmente estandarizados',
      detail:
        'Existen lineamientos generales, pero falta documentación uniforme y guiones compartidos por el equipo.'
    });
  } else if (answers.protocolExistence === 'si_uniforme') {
    findings.push({
      level: 'ok',
      title: 'Protocolos formalizados y uniformes',
      detail: 'El equipo opera bajo guías claras y replicables.'
    });
  }

  if (
    answers.kpisMeasured.includes('No se mide formalmente actualmente') ||
    answers.kpisMeasured.length === 0
  ) {
    findings.push({
      level: 'alert',
      title: 'Sin medición formal de KPIs',
      detail:
        'Actualmente no se monitorean indicadores formales (CSAT, FRT, FCR), dificultando medir mejoras del proyecto.'
    });
  } else {
    findings.push({
      level: 'ok',
      title: `${answers.kpisMeasured.length} indicador(es) en seguimiento`,
      detail: `Se monitorean: ${answers.kpisMeasured.join(', ')}.`
    });
  }

  if (answers.trackingProactivity === 'reactivo') {
    findings.push({
      level: 'warn',
      title: 'Seguimiento reactivo de pedidos/solicitudes',
      detail:
        'El cliente debe escribir para consultar su estado; implementar notificaciones proactivas reduciría el volumen entrante.'
    });
  }

  const buildMarkdownReport = () => {
    const channelsList = [
      ...answers.channels,
      ...(answers.otherChannel.trim() ? [`Otro: ${answers.otherChannel.trim()}`] : [])
    ];
    const toolsList = [
      ...answers.toolsUsed,
      ...(answers.otherTools.trim() ? [`Otro: ${answers.otherTools.trim()}`] : [])
    ];

    return `# Informe de Entrevista y Diagnóstico de Procesos - Servicio al Cliente

## 1. Ficha de Identificación
- **Empresa:** ${answers.companyName || 'Sin diligenciar'}
- **Sector / Giro:** ${answers.sector || 'Sin diligenciar'}
- **Fecha y hora:** ${answers.interviewDate || '-'} ${answers.interviewTime || ''}
- **Entrevistador(a):** ${answers.interviewerName || 'Sin diligenciar'}
- **Persona entrevistada:** ${answers.intervieweeName || 'Sin diligenciar'} (${answers.intervieweeRole || 'Sin cargo'})
- **Área:** ${answers.areaName || 'Servicio al Cliente'}
- **Completitud del formato:** ${completion.filled}/${completion.total} (${completion.percent}%)

## 2. Contexto y Estructura del Área
- **Objetivo del área:** ${answers.areaObjective || 'Sin diligenciar'}
- **Relación con otras áreas:** ${answers.crossAreaCoordination || 'Sin diligenciar'}
- **Tamaño del equipo:** ${answers.teamSize || 'Sin diligenciar'}
- **Roles:** ${answers.teamRoles || 'Sin diligenciar'}
- **Horarios de atención:** ${answers.serviceHours || 'Sin diligenciar'}
- **Volumen de solicitudes:** ${answers.monthlyVolume || 'Sin diligenciar'}
- **Canales activos:** ${channelsList.length > 0 ? channelsList.join(', ') : 'Ninguno seleccionado'}

## 3. Ciclo de Atención y Procesos
- **Flujo de Preventa / Consultas:** ${answers.presaleFlow || 'Sin diligenciar'}
- **Seguimiento durante compra/servicio (${answers.trackingProactivity || 'sin definir'}):** ${answers.orderTrackingFlow || 'Sin diligenciar'}
- **PQRS - Recepción y registro:** ${answers.pqrsReception || 'Sin diligenciar'}
- **PQRS - Validación:** ${answers.pqrsValidation || 'Sin diligenciar'}
- **PQRS - Escalamiento:** ${answers.pqrsEscalation || 'Sin diligenciar'}
- **PQRS - Resolución y cierre:** ${answers.pqrsClosure || 'Sin diligenciar'}
- **Protocolos / Guiones (${answers.protocolExistence || 'sin definir'}):** ${answers.protocolNotes || 'Sin diligenciar'}

## 4. Tiempos, SLA y Dependencias
- **Tiempo de Primera Respuesta (FRT):** ${answers.firstResponseTime || 'Sin diligenciar'}
- **Tiempo de Solución Definitiva:** ${answers.resolutionTime || 'Sin diligenciar'}
- **Criterios de priorización:** ${answers.prioritizationCriteria || 'Sin diligenciar'}
- **Información requerida de otras áreas:** ${answers.internalDependencies || 'Sin diligenciar'}
- **Tiempo de espera interno:** ${answers.internalQueryWaitTime || 'Sin diligenciar'}

## 5. Herramientas y Registro de Datos
- **Herramientas utilizadas:** ${toolsList.length > 0 ? toolsList.join(', ') : 'Ninguna seleccionada'}
- **Integración de canales:** ${answers.channelsIntegrated || 'Sin definir'}
- **Datos almacenados del cliente:** ${answers.customerDataStored || 'Sin diligenciar'}
- **Consulta de historial:** ${answers.historyLookupProcess || 'Sin diligenciar'}
- **Automatizaciones actuales:** ${answers.currentAutomations || 'Sin diligenciar'}

## 6. Puntos Críticos y Cuellos de Botella
- **Motivos frecuentes de contacto:** ${answers.topContactReasons || 'Sin diligenciar'}
- **Principales cuellos de botella:** ${answers.mainBottlenecks || 'Sin diligenciar'}
- **Tareas manuales repetitivas:** ${answers.repetitiveManualTasks || 'Sin diligenciar'}
- **Manejo de picos o ausencias:** ${answers.peakDemandHandling || 'Sin diligenciar'}

## 7. Indicadores (KPIs) y Visión del Proyecto
- **KPIs medidos:** ${answers.kpisMeasured.length > 0 ? answers.kpisMeasured.join(', ') : 'Ninguno seleccionado'}
- **Lo que más valoran los clientes:** ${answers.customerPraise || 'Sin diligenciar'}
- **Principales críticas de clientes:** ${answers.customerComplaints || 'Sin diligenciar'}
- **Problema prioritario a resolver:** ${answers.priorityProblemToSolve || 'Sin diligenciar'}
- **Restricciones y presupuesto:** ${answers.constraintsAndBudget || 'Sin diligenciar'}

## 8. Cierre, Evidencias y Valoración
- **Valoración estandarización de protocolos:** ${answers.standardizationLevel ? `${answers.standardizationLevel}/5` : 'Sin calificar'}
- **Madurez operativa percibida:** ${answers.perceivedMaturity ? `${answers.perceivedMaturity}/5` : 'Sin calificar'}
- **Evidencias solicitadas:** ${answers.evidenceChecklist.length > 0 ? answers.evidenceChecklist.join(', ') : 'Ninguna marcada'}
- **Observaciones del entrevistador:** ${answers.interviewerObservations || 'Sin observaciones'}
${
  answers.customQuestions && answers.customQuestions.length > 0
    ? `\n## 9. Preguntas Adicionales Registradas\n${answers.customQuestions
        .map(
          (cq, idx) =>
            `- **${idx + 1}. ${cq.question || 'Pregunta sin título'}:** ${cq.answer || 'Sin respuesta'}`
        )
        .join('\n')}`
    : ''
}

---
Generado desde Formato de Entrevista de Servicio al Cliente (${new Date(meta.updatedAt).toLocaleString('es-ES')})
`;
  };

  const handleDownloadText = () => {
    const content = buildMarkdownReport();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (answers.companyName || 'empresa')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `diagnostico-servicio-cliente-${safeName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(record, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (answers.companyName || 'empresa')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `entrevista-${safeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:static print:bg-white print:p-0">
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 shadow-2xl my-auto max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:bg-white">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Informe Ejecutivo de Diagnóstico
            </h2>
            <p className="text-xs text-slate-500">
              {answers.companyName || 'Empresa sin especificar'} · Diligenciado {completion.filled} de {completion.total} campos ({completion.percent}%)
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleDownloadText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-md transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Exportar .MD</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-md transition-colors whitespace-nowrap"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar informe"
              className="p-1.5 text-slate-400 hover:text-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-sm text-slate-700">
          {/* Summary KPI Row (strictly derived from entered fields) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs text-slate-500 block">Completitud</span>
              <span className="text-xl font-semibold font-mono tabular-nums text-slate-900">
                {completion.percent}%
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Canales Activos</span>
              <span className="text-xl font-semibold font-mono tabular-nums text-slate-900">
                {answers.channels.length + (answers.otherChannel.trim() ? 1 : 0)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Estandarización</span>
              <span className="text-xl font-semibold font-mono tabular-nums text-slate-900">
                {answers.standardizationLevel ? `${answers.standardizationLevel}/5` : '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Madurez Operativa</span>
              <span className="text-xl font-semibold font-mono tabular-nums text-slate-900">
                {answers.perceivedMaturity ? `${answers.perceivedMaturity}/5` : '—'}
              </span>
            </div>
          </div>

          {/* Automatic Diagnostic Findings */}
          {findings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Hallazgos Clave del Diagnóstico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {findings.map((f, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-md border text-xs space-y-1 ${
                      f.level === 'alert'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : f.level === 'warn'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      {f.level === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                      {f.level === 'warn' && <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      {f.level === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      <span>{f.title}</span>
                    </div>
                    <p className="opacity-85 leading-relaxed">{f.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Structured Summary */}
          <div className="space-y-6">
            <section className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="font-semibold text-slate-900">01. Ficha y Contexto</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <p><strong>Empresa:</strong> {answers.companyName || '—'}</p>
                <p><strong>Sector:</strong> {answers.sector || '—'}</p>
                <p><strong>Entrevistado:</strong> {answers.intervieweeName || '—'} ({answers.intervieweeRole || '—'})</p>
                <p><strong>Equipo y volumen:</strong> {answers.teamSize || '—'} · {answers.monthlyVolume || '—'}</p>
                <p className="sm:col-span-2"><strong>Canales:</strong> {answers.channels.join(', ') || '—'}</p>
              </div>
            </section>

            <section className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="font-semibold text-slate-900">02. Flujo Operativo y PQRS</h4>
              <div className="space-y-2 text-xs">
                <p><strong>Preventa:</strong> {answers.presaleFlow || '—'}</p>
                <p><strong>Seguimiento de órdenes:</strong> {answers.orderTrackingFlow || '—'}</p>
                <p><strong>Recepción PQRS:</strong> {answers.pqrsReception || '—'}</p>
                <p><strong>Escalamiento y cierre:</strong> {answers.pqrsEscalation || '—'} {answers.pqrsClosure ? ` / ${answers.pqrsClosure}` : ''}</p>
              </div>
            </section>

            <section className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="font-semibold text-slate-900">03. Tiempos, Herramientas y Puntos Críticos</h4>
              <div className="space-y-2 text-xs">
                <p><strong>Tiempos (FRT / Resolución):</strong> {answers.firstResponseTime || '—'} / {answers.resolutionTime || '—'}</p>
                <p><strong>Herramientas actuales:</strong> {answers.toolsUsed.join(', ') || '—'}</p>
                <p><strong>Motivos principales de contacto:</strong> {answers.topContactReasons || '—'}</p>
                <p><strong>Cuellos de botella:</strong> {answers.mainBottlenecks || '—'}</p>
              </div>
            </section>

            <section className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="font-semibold text-slate-900">04. Prioridad del Proyecto y Observaciones</h4>
              <div className="space-y-2 text-xs">
                <p><strong>Problema prioritario a resolver:</strong> {answers.priorityProblemToSolve || '—'}</p>
                <p><strong>Restricciones y presupuesto:</strong> {answers.constraintsAndBudget || '—'}</p>
                <p><strong>Observaciones del entrevistador:</strong> {answers.interviewerObservations || '—'}</p>
              </div>
            </section>

            {answers.customQuestions && answers.customQuestions.length > 0 && (
              <section className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="font-semibold text-slate-900">05. Preguntas Adicionales</h4>
                <div className="space-y-2 text-xs">
                  {answers.customQuestions.map((cq, idx) => (
                    <p key={cq.id}>
                      <strong>{idx + 1}. {cq.question || 'Pregunta sin título'}:</strong>{' '}
                      {cq.answer || '—'}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
