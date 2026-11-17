import React, { useRef, useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Copy,
  Trash2,
  FileCheck2,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { InterviewRecord } from './types';
import { calculateCompletion } from './data';
import { exportRecordsToJsonFile, parseImportedRecords } from './storage';

interface SavedRecordsPanelProps {
  records: InterviewRecord[];
  activeId: string;
  onEditRecord: (id: string) => void;
  onViewReport: (record: InterviewRecord) => void;
  onDuplicateRecord: (id: string) => void;
  onDeleteRecord: (id: string) => void;
  onCreateNew: () => void;
  onImportRecords: (imported: InterviewRecord[]) => void;
}

export const SavedRecordsPanel: React.FC<SavedRecordsPanelProps> = ({
  records,
  activeId,
  onEditRecord,
  onViewReport,
  onDuplicateRecord,
  onDeleteRecord,
  onCreateNew,
  onImportRecords
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecords = records.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return (
      rec.meta.title.toLowerCase().includes(q) ||
      rec.answers.companyName.toLowerCase().includes(q) ||
      rec.answers.intervieweeName.toLowerCase().includes(q) ||
      rec.answers.sector.toLowerCase().includes(q)
    );
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseImportedRecords(text);
      onImportRecords(imported);
      setImportSuccess(`Se importaron ${imported.length} registro(s) correctamente.`);
      setTimeout(() => setImportSuccess(null), 4000);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'No se pudo leer el archivo JSON.'
      );
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Backup Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Entrevistas Almacenadas ({records.length})
          </h2>
          <p className="text-xs text-slate-500">
            Selecciona cualquier entrevista para modificar sus respuestas, ver su informe o descargar un respaldo completo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.html,.htm,application/json,text/html"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Abrir Archivo (.json / .html)</span>
          </button>

          <button
            type="button"
            onClick={() => exportRecordsToJsonFile(records)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Respaldo .JSON</span>
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Entrevista</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {importError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{importError}</span>
        </div>
      )}

      {importSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Search & Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por empresa, entrevistado o sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {filteredRecords.length} resultado(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Registro / Empresa</th>
                <th className="py-3 px-4 font-semibold">Entrevistado</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Avance</th>
                <th className="py-3 px-4 font-semibold">Última Modificación</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => {
                const comp = calculateCompletion(rec.answers);
                const isCurrent = rec.meta.id === activeId;
                return (
                  <tr
                    key={rec.meta.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrent ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {rec.meta.title || 'Sin título'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {rec.answers.companyName || 'Empresa sin especificar'}
                        {rec.answers.sector ? ` · ${rec.answers.sector}` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{rec.answers.intervieweeName || '—'}</div>
                      <div className="text-[11px] text-slate-400">
                        {rec.answers.intervieweeRole || ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {rec.meta.status === 'completada' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>En progreso</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {comp.percent}%
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums text-[11px] text-slate-500">
                      {new Date(rec.meta.updatedAt).toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditRecord(rec.meta.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-teal-800 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Modificar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onViewReport(rec)}
                          title="Ver informe"
                          className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDuplicateRecord(rec.meta.id)}
                          title="Duplicar registro"
                          className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteRecord(rec.meta.id)}
                          title="Eliminar registro"
                          className="p-1.5 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No se encontraron registros que coincidan con "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
