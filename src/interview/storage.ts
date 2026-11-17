import { InterviewRecord } from './types';
import { createNewInterview, normalizeInterviewRecord } from './data';

const STORAGE_KEY = 'servicio_cliente_entrevistas_v1';
const ACTIVE_ID_KEY = 'servicio_cliente_entrevista_activa_v1';
const IDB_NAME = 'servicio_cliente_diagnostico_db';
const IDB_STORE = 'entrevistas';
const IDB_RECORD_KEY = 'records_bundle';

export function loadRecordsSync(): InterviewRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => normalizeInterviewRecord(item));
      }
    }
  } catch {
    // ignore storage errors
  }
  return [createNewInterview('Entrevista Inicial')];
}

export function loadActiveIdSync(records: InterviewRecord[]): string {
  try {
    const savedId = localStorage.getItem(ACTIVE_ID_KEY);
    if (savedId && records.some((r) => r.meta.id === savedId)) {
      return savedId;
    }
  } catch {
    // ignore
  }
  return records[0]?.meta.id || '';
}

export function saveActiveIdSync(id: string): void {
  try {
    localStorage.setItem(ACTIVE_ID_KEY, id);
  } catch {
    // ignore
  }
}

export function saveRecordsSync(records: InterviewRecord[]): boolean {
  let ok = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    ok = true;
  } catch {
    ok = false;
  }

  // Mirror asynchronously into IndexedDB for extra durability
  void writeIndexedDbBackup(records);
  return ok;
}

function openIdb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeIndexedDbBackup(records: InterviewRecord[]): Promise<void> {
  const db = await openIdb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(records, IDB_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  } finally {
    db.close();
  }
}

export async function loadIndexedDbFallback(): Promise<InterviewRecord[] | null> {
  const db = await openIdb();
  if (!db) return null;
  try {
    return await new Promise<InterviewRecord[] | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_RECORD_KEY);
      req.onsuccess = () => {
        const result = req.result;
        if (Array.isArray(result) && result.length > 0) {
          resolve(result.map((item) => normalizeInterviewRecord(item)));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  } finally {
    db.close();
  }
}

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildHtmlDocument(record: InterviewRecord, forWord = false): string {
  const { answers, meta } = record;
  const channelsList = [
    ...answers.channels,
    ...(answers.otherChannel.trim() ? [`Otro: ${answers.otherChannel.trim()}`] : [])
  ];
  const toolsList = [
    ...answers.toolsUsed,
    ...(answers.otherTools.trim() ? [`Otro: ${answers.otherTools.trim()}`] : [])
  ];

  const row = (label: string, val: string) =>
    `<tr>
      <td style="width:34%;padding:8px 10px;border:1px solid #cbd5e1;background:#f8fafc;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 10px;border:1px solid #cbd5e1;vertical-align:top;white-space:pre-wrap;">${escapeHtml(val || '—')}</td>
    </tr>`;

  const embeddedJson = JSON.stringify(record).replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="es"${forWord ? ' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"' : ''}>
<head>
  <meta charset="UTF-8" />
  <title>Entrevista Servicio al Cliente - ${escapeHtml(answers.companyName || meta.title)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; max-width: 900px; margin: 28px auto; padding: 0 20px; line-height: 1.5; font-size: 13px; }
    h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
    h2 { font-size: 15px; margin-top: 22px; margin-bottom: 8px; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 4px; }
    p.meta { color: #475569; font-size: 12px; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>Diagnóstico de Procesos — Servicio al Cliente</h1>
  <p class="meta"><strong>Registro:</strong> ${escapeHtml(meta.title)} · <strong>Estado:</strong> ${meta.status === 'completada' ? 'Completada' : 'En progreso'} · <strong>Actualizado:</strong> ${escapeHtml(new Date(meta.updatedAt).toLocaleString('es-ES'))}</p>

  <h2>01. Ficha de Identificación</h2>
  <table>
    ${row('Empresa', answers.companyName)}
    ${row('Sector / Actividad', answers.sector)}
    ${row('Fecha y hora', `${answers.interviewDate || ''} ${answers.interviewTime || ''}`.trim())}
    ${row('Entrevistado', `${answers.intervieweeName || '—'} (${answers.intervieweeRole || 'Sin cargo'})`)}
    ${row('Área evaluada', answers.areaName)}
    ${row('Entrevistador(a)', answers.interviewerName)}
  </table>

  <h2>02. Contexto y Estructura del Área</h2>
  <table>
    ${row('Objetivo del área', answers.areaObjective)}
    ${row('Relación con otras áreas', answers.crossAreaCoordination)}
    ${row('Tamaño del equipo', answers.teamSize)}
    ${row('Roles del equipo', answers.teamRoles)}
    ${row('Horarios de atención', answers.serviceHours)}
    ${row('Volumen de solicitudes', answers.monthlyVolume)}
    ${row('Canales activos', channelsList.join(', '))}
  </table>

  <h2>03. Ciclo de Atención y PQRS</h2>
  <table>
    ${row('Flujo de preventa', answers.presaleFlow)}
    ${row('Seguimiento de pedidos/servicio', `${answers.trackingProactivity ? `[${answers.trackingProactivity}] ` : ''}${answers.orderTrackingFlow}`)}
    ${row('PQRS - Recepción y registro', answers.pqrsReception)}
    ${row('PQRS - Validación', answers.pqrsValidation)}
    ${row('PQRS - Escalamiento', answers.pqrsEscalation)}
    ${row('PQRS - Resolución y cierre', answers.pqrsClosure)}
    ${row('Protocolos y guiones', `${answers.protocolExistence ? `[${answers.protocolExistence}] ` : ''}${answers.protocolNotes}`)}
  </table>

  <h2>04. Tiempos y Niveles de Servicio (SLA)</h2>
  <table>
    ${row('Primera Respuesta (FRT)', answers.firstResponseTime)}
    ${row('Solución Definitiva', answers.resolutionTime)}
    ${row('Criterios de priorización', answers.prioritizationCriteria)}
    ${row('Consultas internas', answers.internalDependencies)}
    ${row('Tiempo de espera interno', answers.internalQueryWaitTime)}
  </table>

  <h2>05. Herramientas Tecnológicas y Datos</h2>
  <table>
    ${row('Herramientas en uso', toolsList.join(', '))}
    ${row('Integración de canales', answers.channelsIntegrated)}
    ${row('Datos registrados del cliente', answers.customerDataStored)}
    ${row('Consulta de historial', answers.historyLookupProcess)}
    ${row('Automatizaciones actuales', answers.currentAutomations)}
  </table>

  <h2>06. Puntos Críticos y Cuellos de Botella</h2>
  <table>
    ${row('Motivos más frecuentes', answers.topContactReasons)}
    ${row('Cuellos de botella', answers.mainBottlenecks)}
    ${row('Tareas manuales repetitivas', answers.repetitiveManualTasks)}
    ${row('Picos de demanda y ausencias', answers.peakDemandHandling)}
  </table>

  <h2>07. Indicadores (KPIs) y Visión del Proyecto</h2>
  <table>
    ${row('KPIs medidos', answers.kpisMeasured.join(', '))}
    ${row('Fortalezas valoradas', answers.customerPraise)}
    ${row('Críticas frecuentes', answers.customerComplaints)}
    ${row('Problema prioritario a resolver', answers.priorityProblemToSolve)}
    ${row('Restricciones y presupuesto', answers.constraintsAndBudget)}
  </table>

  <h2>08. Cierre, Valoración y Evidencias</h2>
  <table>
    ${row('Estandarización de procesos', answers.standardizationLevel ? `${answers.standardizationLevel} / 5` : '—')}
    ${row('Madurez tecnológica', answers.perceivedMaturity ? `${answers.perceivedMaturity} / 5` : '—')}
    ${row('Evidencias solicitadas', answers.evidenceChecklist.join(', '))}
    ${row('Observaciones finales', answers.interviewerObservations)}
  </table>

  ${
    answers.customQuestions && answers.customQuestions.length > 0
      ? `<h2>09. Preguntas Adicionales</h2>
         <table>${answers.customQuestions
           .map((cq, idx) => row(`${idx + 1}. ${cq.question || 'Pregunta'}`, cq.answer))
           .join('')}</table>`
      : ''
  }

  ${
    !forWord
      ? `<script id="glow-interview-data" type="application/json">${embeddedJson}</script>`
      : ''
  }
</body>
</html>`;
}

export function exportSingleRecordHtml(record: InterviewRecord): void {
  const html = buildHtmlDocument(record, false);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (record.answers.companyName || record.meta.title || 'entrevista')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  a.href = url;
  a.download = `entrevista-${safeName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSingleRecordWord(record: InterviewRecord): void {
  const html = buildHtmlDocument(record, true);
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (record.answers.companyName || record.meta.title || 'entrevista')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  a.href = url;
  a.download = `entrevista-${safeName}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSingleRecordCsv(record: InterviewRecord): void {
  const { answers, meta } = record;
  const rows: [string, string][] = [
    ['Registro', meta.title],
    ['Estado', meta.status],
    ['Empresa', answers.companyName],
    ['Sector', answers.sector],
    ['Fecha', answers.interviewDate],
    ['Hora', answers.interviewTime],
    ['Entrevistado', answers.intervieweeName],
    ['Cargo', answers.intervieweeRole],
    ['Area', answers.areaName],
    ['Entrevistador', answers.interviewerName],
    ['Objetivo del area', answers.areaObjective],
    ['Coordinacion entre areas', answers.crossAreaCoordination],
    ['Tamano equipo', answers.teamSize],
    ['Roles', answers.teamRoles],
    ['Horarios', answers.serviceHours],
    ['Volumen mensual', answers.monthlyVolume],
    ['Canales', [...answers.channels, answers.otherChannel].filter(Boolean).join(' | ')],
    ['Flujo preventa', answers.presaleFlow],
    ['Seguimiento pedidos', `${answers.trackingProactivity} - ${answers.orderTrackingFlow}`],
    ['PQRS Recepcion', answers.pqrsReception],
    ['PQRS Validacion', answers.pqrsValidation],
    ['PQRS Escalamiento', answers.pqrsEscalation],
    ['PQRS Cierre', answers.pqrsClosure],
    ['Protocolos', `${answers.protocolExistence} - ${answers.protocolNotes}`],
    ['Primera respuesta FRT', answers.firstResponseTime],
    ['Solucion definitiva', answers.resolutionTime],
    ['Priorizacion', answers.prioritizationCriteria],
    ['Dependencias internas', answers.internalDependencies],
    ['Espera interna', answers.internalQueryWaitTime],
    ['Herramientas', [...answers.toolsUsed, answers.otherTools].filter(Boolean).join(' | ')],
    ['Integracion canales', answers.channelsIntegrated],
    ['Datos cliente', answers.customerDataStored],
    ['Consulta historial', answers.historyLookupProcess],
    ['Automatizaciones', answers.currentAutomations],
    ['Motivos frecuentes', answers.topContactReasons],
    ['Cuellos de botella', answers.mainBottlenecks],
    ['Tareas repetitivas', answers.repetitiveManualTasks],
    ['Picos de demanda', answers.peakDemandHandling],
    ['KPIs medidos', answers.kpisMeasured.join(' | ')],
    ['Fortalezas', answers.customerPraise],
    ['Criticas', answers.customerComplaints],
    ['Problema prioritario', answers.priorityProblemToSolve],
    ['Restricciones', answers.constraintsAndBudget],
    ['Estandarizacion (1-5)', String(answers.standardizationLevel || '')],
    ['Madurez (1-5)', String(answers.perceivedMaturity || '')],
    ['Evidencias', answers.evidenceChecklist.join(' | ')],
    ['Observaciones', answers.interviewerObservations],
    ...(answers.customQuestions || []).map(
      (cq, idx): [string, string] => [`Pregunta adicional ${idx + 1}: ${cq.question}`, cq.answer]
    )
  ];

  const csvCell = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
  const csvBody = ['"Campo","Respuesta"', ...rows.map(([k, v]) => `${csvCell(k)},${csvCell(v)}`)].join('\r\n');

  const blob = new Blob(['\ufeff', csvBody], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (answers.companyName || meta.title || 'entrevista')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  a.href = url;
  a.download = `entrevista-${safeName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportRecordsToJsonFile(records: InterviewRecord[]): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    records
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respaldo-entrevistas-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedRecords(fileContent: string): InterviewRecord[] {
  const trimmed = fileContent.trim();
  let jsonText = trimmed;

  // Allow opening .html files exported from this platform
  if (trimmed.startsWith('<')) {
    const match = trimmed.match(
      /<script[^>]*id=["']glow-interview-data["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (!match || !match[1]) {
      throw new Error(
        'Este archivo HTML no contiene datos editables de entrevista. Usa un archivo .json o .html generado desde esta plataforma.'
      );
    }
    jsonText = match[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      'No se pudo leer el archivo. Selecciona un archivo .json o .html generado desde esta aplicación.'
    );
  }

  let rawList: Partial<InterviewRecord>[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed as Partial<InterviewRecord>[];
  } else if (
    parsed &&
    typeof parsed === 'object' &&
    'records' in parsed &&
    Array.isArray((parsed as { records: unknown }).records)
  ) {
    rawList = (parsed as { records: Partial<InterviewRecord>[] }).records;
  } else if (parsed && typeof parsed === 'object' && 'answers' in parsed) {
    rawList = [parsed as Partial<InterviewRecord>];
  } else {
    throw new Error('La estructura del archivo no corresponde a una entrevista válida.');
  }

  const normalized = rawList.map((item) => normalizeInterviewRecord(item));
  if (normalized.length === 0) {
    throw new Error('El archivo no contiene entrevistas válidas.');
  }
  return normalized;
}
