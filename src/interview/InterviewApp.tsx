import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  Plus,
  Trash2,
  ClipboardList,
  Sparkles,
  Check,
  Printer,
  Menu,
  X,
  RotateCcw,
  Save,
  FolderOpen,
  Edit3
} from 'lucide-react';
import { InterviewAnswers, InterviewRecord, CustomQuestion } from './types';
import {
  INTERVIEW_SECTIONS,
  CHANNEL_OPTIONS,
  TOOL_OPTIONS,
  KPI_OPTIONS,
  EVIDENCE_OPTIONS,
  createNewInterview,
  createSampleInterview,
  calculateCompletion
} from './data';
import {
  loadRecordsSync,
  loadActiveIdSync,
  saveActiveIdSync,
  saveRecordsSync,
  loadIndexedDbFallback
} from './storage';
import { DiagnosticReportModal } from './DiagnosticReportModal';
import { SavedRecordsPanel } from './SavedRecordsPanel';

interface InterviewAppProps {
  onOpenStore?: () => void;
}

export const InterviewApp: React.FC<InterviewAppProps> = ({ onOpenStore }) => {
  const [records, setRecords] = useState<InterviewRecord[]>(() => loadRecordsSync());
  const [activeId, setActiveId] = useState<string>(() => {
    const initial = loadRecordsSync();
    return loadActiveIdSync(initial);
  });

  const [viewMode, setViewMode] = useState<'form' | 'records'>('form');
  const [activeSection, setActiveSection] = useState<string>(INTERVIEW_SECTIONS[0].id);
  const [reportRecord, setReportRecord] = useState<InterviewRecord | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [hasUnsavedTouch, setHasUnsavedTouch] = useState<boolean>(false);

  const activeRecord = records.find((r) => r.meta.id === activeId) || records[0];
  const answers = activeRecord.answers;
  const completion = calculateCompletion(answers);

  // Hydrate from IndexedDB fallback if localStorage only had a fresh blank record
  useEffect(() => {
    let mounted = true;
    const isFreshDefault =
      records.length === 1 &&
      records[0].meta.title === 'Entrevista Inicial' &&
      calculateCompletion(records[0].answers).filled === 0;

    if (isFreshDefault) {
      void loadIndexedDbFallback().then((idbRecords) => {
        if (!mounted || !idbRecords || idbRecords.length === 0) return;
        setRecords(idbRecords);
        saveRecordsSync(idbRecords);
        const restoredId = loadActiveIdSync(idbRecords);
        setActiveId(restoredId);
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Keep activeId synced in storage
  useEffect(() => {
    if (activeRecord?.meta.id) {
      saveActiveIdSync(activeRecord.meta.id);
    }
  }, [activeRecord?.meta.id]);

  // Helper to commit records synchronously
  const commitRecords = useCallback(
    (updater: (prev: InterviewRecord[]) => InterviewRecord[], showBanner = false) => {
      setRecords((prev) => {
        const next = updater(prev);
        saveRecordsSync(next);
        return next;
      });
      const nowLabel = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setLastSavedTime(nowLabel);
      if (showBanner) {
        setHasUnsavedTouch(false);
        setSaveFeedback(`Información guardada correctamente (${nowLabel})`);
        setTimeout(() => setSaveFeedback(null), 3500);
      }
    },
    []
  );

  const updateAnswer = <K extends keyof InterviewAnswers>(
    field: K,
    value: InterviewAnswers[K]
  ) => {
    setHasUnsavedTouch(true);
    commitRecords((prev) =>
      prev.map((rec) => {
        if (rec.meta.id !== activeRecord.meta.id) return rec;
        const updatedAnswers = { ...rec.answers, [field]: value };
        const shouldAutoTitle =
          field === 'companyName' &&
          typeof value === 'string' &&
          value.trim().length > 0 &&
          (rec.meta.title.startsWith('Entrevista') ||
            rec.meta.title === rec.answers.companyName);
        return {
          meta: {
            ...rec.meta,
            title: shouldAutoTitle ? value.trim() : rec.meta.title,
            updatedAt: new Date().toISOString()
          },
          answers: updatedAnswers
        };
      })
    );
  };

  const updateMetaTitle = (title: string) => {
    setHasUnsavedTouch(true);
    commitRecords((prev) =>
      prev.map((rec) =>
        rec.meta.id === activeRecord.meta.id
          ? {
              ...rec,
              meta: {
                ...rec.meta,
                title,
                updatedAt: new Date().toISOString()
              }
            }
          : rec
      )
    );
  };

  const updateStatus = (status: 'borrador' | 'completada') => {
    commitRecords(
      (prev) =>
        prev.map((rec) =>
          rec.meta.id === activeRecord.meta.id
            ? {
                ...rec,
                meta: {
                  ...rec.meta,
                  status,
                  updatedAt: new Date().toISOString()
                }
              }
            : rec
        ),
      true
    );
  };

  const handleExplicitSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    commitRecords(
      (prev) =>
        prev.map((rec) =>
          rec.meta.id === activeRecord.meta.id
            ? {
                ...rec,
                meta: {
                  ...rec.meta,
                  title:
                    rec.meta.title.trim() ||
                    rec.answers.companyName.trim() ||
                    'Entrevista sin título',
                  updatedAt: new Date().toISOString()
                }
              }
            : rec
        ),
      true
    );
  };

  const toggleArrayValue = (
    field: 'channels' | 'toolsUsed' | 'kpisMeasured' | 'evidenceChecklist',
    option: string
  ) => {
    const current = answers[field];
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    updateAnswer(field, next);
  };

  const handleAddCustomQuestion = () => {
    const newQ: CustomQuestion = {
      id: `cq-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sectionId: 'cierre',
      question: '',
      answer: ''
    };
    updateAnswer('customQuestions', [...answers.customQuestions, newQ]);
  };

  const handleUpdateCustomQuestion = (
    id: string,
    field: 'question' | 'answer',
    value: string
  ) => {
    const next = answers.customQuestions.map((cq) =>
      cq.id === id ? { ...cq, [field]: value } : cq
    );
    updateAnswer('customQuestions', next);
  };

  const handleDeleteCustomQuestion = (id: string) => {
    const next = answers.customQuestions.filter((cq) => cq.id !== id);
    updateAnswer('customQuestions', next);
  };

  const handleCreateNew = () => {
    const fresh = createNewInterview(`Entrevista #${records.length + 1}`);
    commitRecords((prev) => [fresh, ...prev], true);
    setActiveId(fresh.meta.id);
    saveActiveIdSync(fresh.meta.id);
    setViewMode('form');
    setActiveSection('identificacion');
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSample = () => {
    const existingSample = records.find((r) => r.meta.id.startsWith('sample-glow-'));
    if (existingSample) {
      setActiveId(existingSample.meta.id);
      saveActiveIdSync(existingSample.meta.id);
    } else {
      const sample = createSampleInterview();
      commitRecords((prev) => [sample, ...prev], true);
      setActiveId(sample.meta.id);
      saveActiveIdSync(sample.meta.id);
    }
    setViewMode('form');
    setMobileNavOpen(false);
  };

  const handleDuplicateRecord = (id: string) => {
    const source = records.find((r) => r.meta.id === id);
    if (!source) return;
    const now = new Date().toISOString();
    const copy: InterviewRecord = {
      meta: {
        id: `ent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `${source.meta.title} (Copia)`,
        status: 'borrador',
        createdAt: now,
        updatedAt: now
      },
      answers: JSON.parse(JSON.stringify(source.answers))
    };
    commitRecords((prev) => [copy, ...prev], true);
    setActiveId(copy.meta.id);
    saveActiveIdSync(copy.meta.id);
  };

  const handleDeleteRecord = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (records.length === 1) {
      const fresh = createNewInterview('Entrevista Inicial');
      commitRecords(() => [fresh]);
      setActiveId(fresh.meta.id);
      saveActiveIdSync(fresh.meta.id);
      return;
    }
    const remaining = records.filter((r) => r.meta.id !== id);
    commitRecords(() => remaining);
    if (activeId === id && remaining[0]) {
      setActiveId(remaining[0].meta.id);
      saveActiveIdSync(remaining[0].meta.id);
    }
  };

  const handleImportRecords = (imported: InterviewRecord[]) => {
    commitRecords((prev) => {
      const existingMap = new Map(prev.map((r) => [r.meta.id, r]));
      for (const item of imported) {
        existingMap.set(item.meta.id, item);
      }
      return Array.from(existingMap.values());
    }, true);
    if (imported[0]) {
      setActiveId(imported[0].meta.id);
      saveActiveIdSync(imported[0].meta.id);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setViewMode('form');
    setActiveSection(sectionId);
    setMobileNavOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`sec-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand / Workspace Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Alternar índice"
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <a
              href="#sec-identificacion"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('identificacion');
              }}
              className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
            >
              <ClipboardList className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Diagnóstico Servicio al Cliente</span>
            </a>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => setViewMode('form')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'form' ? 'text-teal-700 font-semibold' : ''
              }`}
            >
              Formulario
            </button>
            <button
              onClick={() => setViewMode('records')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'records' ? 'text-teal-700 font-semibold' : ''
              }`}
            >
              Registros ({records.length})
            </button>
            <button
              onClick={() => scrollToSection('procesos')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Procesos
            </button>
            <button
              onClick={() => scrollToSection('herramientas')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Tecnología
            </button>
            <button
              onClick={() => scrollToSection('dolores')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Puntos Críticos
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setReportRecord(activeRecord)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Ver Informe</span>
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Mode & Active Record Control Bar */}
      <div className="bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Mode Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Diligenciar / Modificar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('records')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'records'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Registros Guardados ({records.length})</span>
            </button>
          </div>

          {/* Active Record Title + Explicit Save Button */}
          {viewMode === 'form' && (
            <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
              <div className="flex items-center gap-2">
                <label htmlFor="active-title" className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
                  Registro activo:
                </label>
                <input
                  id="active-title"
                  type="text"
                  value={activeRecord.meta.title}
                  onChange={(e) => updateMetaTitle(e.target.value)}
                  placeholder="Nombre del registro..."
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-teal-700 w-44 sm:w-56"
                />
              </div>

              <select
                value={activeRecord.meta.status}
                onChange={(e) =>
                  updateStatus(e.target.value as 'borrador' | 'completada')
                }
                aria-label="Estado del registro"
                className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:border-teal-700"
              >
                <option value="borrador">En progreso</option>
                <option value="completada">Completada</option>
              </select>

              <button
                type="button"
                onClick={() => handleExplicitSave()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Confirmation Banner */}
      {saveFeedback && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs print:hidden">
          <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-white stroke-[3]" />
          </span>
          <span className="font-medium">{saveFeedback}</span>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'records' ? (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SavedRecordsPanel
            records={records}
            activeId={activeRecord.meta.id}
            onEditRecord={(id) => {
              setActiveId(id);
              saveActiveIdSync(id);
              setViewMode('form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewReport={(rec) => setReportRecord(rec)}
            onDuplicateRecord={handleDuplicateRecord}
            onDeleteRecord={(id) => handleDeleteRecord(id)}
            onCreateNew={handleCreateNew}
            onImportRecords={handleImportRecords}
          />
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Progress, Sections, Saved Interviews */}
          <aside
            className={`${
              mobileNavOpen ? 'block' : 'hidden'
            } lg:block lg:col-span-3 lg:sticky lg:top-24 space-y-6 print:hidden`}
          >
            {/* Progress Summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Avance del Diligenciamiento</span>
                <span className="font-mono tabular-nums font-semibold text-teal-700">
                  {completion.percent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-700 transition-all duration-300"
                  style={{ width: `${completion.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono tabular-nums">
                  {completion.filled} / {completion.total} campos
                </span>
                <span>
                  {lastSavedTime ? `Guardado ${lastSavedTime}` : 'Almacenado local'}
                </span>
              </div>
            </div>

            {/* Section Index */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Secciones del Formato
              </div>
              {INTERVIEW_SECTIONS.map((sec) => {
                const isCurrent = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-md text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        isCurrent ? 'text-teal-300' : 'text-slate-400'
                      }`}
                    >
                      {sec.number}
                    </span>
                    <span className="truncate">{sec.shortTitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Saved Interviews Manager */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Sesiones Guardadas
                </span>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {records.map((rec) => {
                  const isSelected = rec.meta.id === activeRecord.meta.id;
                  const recComp = calculateCompletion(rec.answers);
                  return (
                    <div
                      key={rec.meta.id}
                      onClick={() => {
                        setActiveId(rec.meta.id);
                        saveActiveIdSync(rec.meta.id);
                        setMobileNavOpen(false);
                      }}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs cursor-pointer border transition-colors ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium'
                          : 'border-transparent hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate">{rec.meta.title || 'Sin título'}</p>
                        <p className="text-[10px] font-mono tabular-nums text-slate-400">
                          {recComp.percent}% completado
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteRecord(rec.meta.id, e)}
                        aria-label="Eliminar entrevista"
                        className="p-1 text-slate-400 hover:text-rose-600 opacity-70 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleLoadSample}
                className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>Cargar Ejemplo Diligenciado</span>
              </button>
            </div>
          </aside>

          {/* Main Interactive Form Sheet */}
          <form
            onSubmit={handleExplicitSave}
            className="lg:col-span-9 space-y-8"
          >
            {/* Intro Banner */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="text-xs text-teal-700 font-medium flex items-center gap-2">
                  <span>Instrumento de Levantamiento de Procesos</span>
                  <span aria-hidden="true">·</span>
                  <span>Enfoque Servicio al Cliente</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
                  Formato de Entrevista y Diagnóstico Empresarial
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Diligencia o modifica cualquier respuesta en los 8 bloques. Cada cambio queda almacenado automáticamente en tu navegador y puedes respaldar tus registros en JSON o PDF.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 print:hidden">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nueva Entrevista</span>
                </button>
              </div>
            </div>

            {/* SECTION 01: Ficha de Identificación */}
            <section
              id="sec-identificacion"
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-medium text-teal-700">01. Ficha Técnica</span>
                <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                  Identificación de la Empresa y Participantes
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Registra los datos generales de la organización y quién suministra la información.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Nombre de la empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Distribuidora Nova / Glow Beauty"
                    value={answers.companyName}
                    onChange={(e) => updateAnswer('companyName', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Sector o actividad económica
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Retail, Salud, Tecnología, Belleza..."
                    value={answers.sector}
                    onChange={(e) => updateAnswer('sector', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Fecha de entrevista
                  </label>
                  <input
                    type="date"
                    value={answers.interviewDate}
                    onChange={(e) => updateAnswer('interviewDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    value={answers.interviewTime}
                    onChange={(e) => updateAnswer('interviewTime', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Persona entrevistada
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre completo del entrevistado"
                    value={answers.intervieweeName}
                    onChange={(e) => updateAnswer('intervieweeName', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Cargo / Rol en la empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Jefe de Servicio al Cliente / Asesor"
                    value={answers.intervieweeRole}
                    onChange={(e) => updateAnswer('intervieweeRole', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Área evaluada
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Atención al Cliente / Postventa"
                    value={answers.areaName}
                    onChange={(e) => updateAnswer('areaName', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Entrevistador(a) / Responsable del proyecto
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={answers.interviewerName}
                    onChange={(e) => updateAnswer('interviewerName', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 02: Contexto y Estructura del Área */}
            <section
              id="sec-contexto"
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-medium text-teal-700">02. Estructura</span>
                <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                  Contexto y Estructura del Área
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Comprende el propósito del área, su equipo humano, demanda y puntos de contacto.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    1. ¿Cuál es el objetivo principal del área de Servicio al Cliente dentro de la empresa?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe la misión o responsabilidad principal del área..."
                    value={answers.areaObjective}
                    onChange={(e) => updateAnswer('areaObjective', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    2. ¿Cómo interactúa el área con otros departamentos (Ventas, Logística, Facturación, Soporte Técnico)?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Explica de qué áreas dependen para resolver casos..."
                    value={answers.crossAreaCoordination}
                    onChange={(e) => updateAnswer('crossAreaCoordination', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      3. Número de personas en el equipo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 5 asesores y 1 supervisor"
                      value={answers.teamSize}
                      onChange={(e) => updateAnswer('teamSize', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      4. Volumen aproximado de solicitudes (diario o mensual)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 45 casos al día / 1,100 al mes"
                      value={answers.monthlyVolume}
                      onChange={(e) => updateAnswer('monthlyVolume', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      5. Horarios de atención al público
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Lunes a viernes 8:00 am - 6:00 pm"
                      value={answers.serviceHours}
                      onChange={(e) => updateAnswer('serviceHours', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      6. Roles y responsabilidades dentro del equipo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Primer nivel (chats) y segundo nivel (reclamos)"
                      value={answers.teamRoles}
                      onChange={(e) => updateAnswer('teamRoles', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-2">
                    7. Canales por los que se comunican los clientes actualmente:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CHANNEL_OPTIONS.map((opt) => {
                      const checked = answers.channels.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleArrayValue('channels', opt)}
                            className="accent-teal-700 w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="Otro canal adicional (opcional)..."
                    value={answers.otherChannel}
                    onChange={(e) => updateAnswer('otherChannel', e.target.value)}
                    className="mt-2.5 w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 03: Ciclo de Atención y Procesos */}
            <section
              id="sec-procesos"
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-medium text-teal-700">03. Flujos Operativos</span>
                <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                  Levantamiento del Proceso de Atención (Paso a Paso)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Detalla cómo fluye una solicitud desde el primer contacto hasta su cierre y verificación.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    8. Preventa y consultas iniciales: ¿Qué pasos sigue el agente cuando un cliente pregunta por productos, precios o disponibilidad?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe el paso a paso desde la recepción hasta el envío de la información..."
                    value={answers.presaleFlow}
                    onChange={(e) => updateAnswer('presaleFlow', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700">
                    9. Seguimiento durante la compra o prestación del servicio:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'proactivo', label: 'Proactivo (la empresa avisa cada avance)' },
                      { id: 'reactivo', label: 'Reactivo (solo si el cliente pregunta)' },
                      { id: 'mixto', label: 'Mixto (avisos parciales)' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          updateAnswer(
                            'trackingProactivity',
                            opt.id as InterviewAnswers['trackingProactivity']
                          )
                        }
                        className={`px-3 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
                          answers.trackingProactivity === opt.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Explica cómo se informa al cliente sobre el estado de su pedido, envío o solicitud..."
                    value={answers.orderTrackingFlow}
                    onChange={(e) => updateAnswer('orderTrackingFlow', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    10. Gestión de Postventa, Quejas, Reclamos y Devoluciones (PQRS)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        a) Recepción y registro (¿dónde queda documentado?)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ej: Se anota en hoja de Excel con fecha y motivo..."
                        value={answers.pqrsReception}
                        onChange={(e) => updateAnswer('pqrsReception', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        b) Validación (¿qué datos o evidencias se exigen?)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ej: Factura, número de orden, fotografía del daño..."
                        value={answers.pqrsValidation}
                        onChange={(e) => updateAnswer('pqrsValidation', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        c) Escalamiento (¿cuándo y a quién se escala?)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ej: Reembolsos o fallas graves pasan al coordinador..."
                        value={answers.pqrsEscalation}
                        onChange={(e) => updateAnswer('pqrsEscalation', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        d) Resolución y cierre (¿cómo se confirma satisfacción?)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ej: Se envía reposición y se confirma recepción por chat..."
                        value={answers.pqrsClosure}
                        onChange={(e) => updateAnswer('pqrsClosure', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-medium text-slate-700">
                    11. ¿Existen guiones, manuales o políticas escritas de atención?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'si_uniforme', label: 'Sí, documentados y aplicados por todos' },
                      { id: 'si_parcial', label: 'Parcialmente (cada agente adapta su respuesta)' },
                      { id: 'no_informal', label: 'No existen protocolos escritos' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          updateAnswer(
                            'protocolExistence',
                            opt.id as InterviewAnswers['protocolExistence']
                          )
                        }
                        className={`px-3 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
                          answers.protocolExistence === opt.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Notas sobre políticas actuales (garantías, tiempos máximos, compensaciones)..."
                    value={answers.protocolNotes}
                    onChange={(e) => updateAnswer('protocolNotes', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 04: Tiempos y SLA */}
            <section
              id="sec-tiempos"
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-medium text-teal-700">04. Tiempos y Niveles de Servicio</span>
                <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                  Tiempos de Respuesta (SLA) y Flujo de Información
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evalúa la agilidad actual del servicio y los tiempos de espera internos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    12. Tiempo promedio de Primera Respuesta (FRT)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 30 min en WhatsApp / 4 h en correo"
                    value={answers.firstResponseTime}
                    onChange={(e) => updateAnswer('firstResponseTime', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    13. Tiempo promedio hasta la Solución Definitiva
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 24 a 48 horas hábiles"
                    value={answers.resolutionTime}
                    onChange={(e) => updateAnswer('resolutionTime', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    14. ¿Cómo se priorizan los casos cuando hay alta demanda?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Por orden de llegada, urgencia del reclamo, clientes VIP..."
                    value={answers.prioritizationCriteria}
                    onChange={(e) => updateAnswer('prioritizationCriteria', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    15. Información que dependen consultar a otras áreas
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Estado de envío en bodega, conciliación de pagos..."
                    value={answers.internalDependencies}
                    onChange={(e) => updateAnswer('internalDependencies', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    16. Tiempo de espera para recibir esa respuesta interna
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Entre 2 y 6 horas"
                    value={answers.internalQueryWaitTime}
                    onChange={(e) => updateAnswer('internalQueryWaitTime', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 05: Herramientas y Registro */}
            <section
              id="sec-herramientas"
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-medium text-teal-700">05. Tecnología y Datos</span>
                <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                  Herramientas Tecnológicas y Registro de Información
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Identifica los sistemas en uso, trazabilidad del historial y grado de centralización.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-2">
                    17. Herramientas utilizadas actualmente para atender y registrar casos:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TOOL_OPTIONS.map((opt) => {
                      const checked = answers.toolsUsed.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleArrayValue('toolsUsed', opt)}
                            className="accent-teal-700 w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="Otra herramienta o plataforma específica..."
                    value={answers.otherTools}
                    onChange={(e) => updateAnswer('otherTools', e.target.value)}
                    className="mt-2.5 w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700">
                    18. ¿Los canales están integrados en una sola bandeja/sistema?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'total', label: 'Sí, todos integrados' },
                      { id: 'parcial', label: 'Parcialmente integrados' },
                      { id: 'ninguna', label: 'No, cada canal se atiende por separado' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          updateAnswer(
                            'channelsIntegrated',
                            opt.id as InterviewAnswers['channelsIntegrated']
                          )
                        }
                        className={`px-3 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
                          answers.channelsIntegrated === opt.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      19. Datos del cliente que se registran por contacto
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Nombre, teléfono, correo, número de pedido, motivo..."
                      value={answers.customerDataStored}
                      onChange={(e) => updateAnswer('customerDataStored', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      20. ¿Cómo consultan el historial si el cliente vuelve a escribir?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Buscando en el chat o filtrando una hoja de cálculo..."
                      value={answers.historyLookupProcess}
                      onChange={(e) => updateAnswer('historyLookupProcess', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    21. Automatizaciones actuales (mensajes de bienvenida, respuestas rápidas, bots, encuestas)
                  </label>
                  <input
                    type="text"
                    placeholder="Describe qué está automatizado hoy o si todo es manual..."
                    value={answers.currentAutomations}
                    onChange={(e) => updateAnswer('currentAutomations', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 06: Puntos Críticos */}
            <section
              id="sec-dolores"
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-medium text-teal-700">06. Puntos de Dolor</span>
                <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                  Puntos Críticos, Errores Frecuentes y Cuellos de Botella
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Detecta los problemas que más afectan la experiencia del cliente y la carga del equipo.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    22. ¿Cuáles son los 3 a 5 motivos más frecuentes por los que contactan o reclaman los clientes?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Lista los motivos principales en orden de frecuencia..."
                    value={answers.topContactReasons}
                    onChange={(e) => updateAnswer('topContactReasons', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    23. ¿En qué parte del proceso se generan más retrasos, reprocesos o confusiones internas?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe los principales cuellos de botella operativos..."
                    value={answers.mainBottlenecks}
                    onChange={(e) => updateAnswer('mainBottlenecks', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      24. Tareas manuales o repetitivas que consumen más tiempo
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ej: Copiar datos de pedidos a Excel, responder dudas repetidas..."
                      value={answers.repetitiveManualTasks}
                      onChange={(e) => updateAnswer('repetitiveManualTasks', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      25. ¿Qué ocurre en picos de demanda o ausencias de personal?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ej: Se acumulan chats sin responder o se pierden mensajes..."
                      value={answers.peakDemandHandling}
                      onChange={(e) => updateAnswer('peakDemandHandling', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 07: Indicadores y Visión */}
            <section
              id="sec-indicadores"
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-medium text-teal-700">07. Métricas y Alcance</span>
                <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                  Indicadores (KPIs) y Visión del Proyecto
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Alinea el alcance del proyecto con las prioridades y restricciones reales del negocio.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-2">
                    26. ¿Qué indicadores de servicio al cliente miden actualmente?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {KPI_OPTIONS.map((opt) => {
                      const checked = answers.kpisMeasured.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleArrayValue('kpisMeasured', opt)}
                            className="accent-teal-700 w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      27. ¿Qué es lo que más valoran hoy los clientes del servicio?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Fortalezas percibidas por los clientes..."
                      value={answers.customerPraise}
                      onChange={(e) => updateAnswer('customerPraise', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      28. ¿Qué es lo que más critican actualmente?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Debilidades o quejas recurrentes..."
                      value={answers.customerComplaints}
                      onChange={(e) => updateAnswer('customerComplaints', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    29. Si este proyecto resolviera un solo problema clave, ¿cuál tendría mayor impacto?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Objetivo prioritario esperado para el proyecto de servicio al cliente..."
                    value={answers.priorityProblemToSolve}
                    onChange={(e) => updateAnswer('priorityProblemToSolve', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    30. Restricciones técnicas, operativas o presupuestarias a considerar
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Capacidad del equipo, presupuesto disponible, políticas de datos..."
                    value={answers.constraintsAndBudget}
                    onChange={(e) => updateAnswer('constraintsAndBudget', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 08: Cierre, Preguntas Adicionales y Guardado */}
            <section
              id="sec-cierre"
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-medium text-teal-700">08. Cierre de Sesión</span>
                <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                  Valoración Diagnóstica y Documentación de Respaldo
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Registra tu apreciación como entrevistador, agrega preguntas adicionales si la empresa lo requiere y guarda tus cambios.
                </p>
              </div>

              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="block text-xs font-medium text-slate-700">
                      Nivel de estandarización de procesos (1 = Muy bajo, 5 = Óptimo)
                    </span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => updateAnswer('standardizationLevel', num)}
                          className={`w-10 h-10 rounded-md font-mono text-sm font-semibold border transition-colors cursor-pointer ${
                            answers.standardizationLevel === num
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-xs font-medium text-slate-700">
                      Madurez tecnológica y de seguimiento (1 = Manual, 5 = Integrado)
                    </span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => updateAnswer('perceivedMaturity', num)}
                          className={`w-10 h-10 rounded-md font-mono text-sm font-semibold border transition-colors cursor-pointer ${
                            answers.perceivedMaturity === num
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-2">
                    Evidencias y documentos solicitados / recibidos:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {EVIDENCE_OPTIONS.map((opt) => {
                      const checked = answers.evidenceChecklist.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleArrayValue('evidenceChecklist', opt)}
                            className="accent-teal-700 w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Observaciones adicionales y hallazgos del entrevistador
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Conclusiones inmediatas, lenguaje no verbal, ejemplos mostrados durante la entrevista..."
                    value={answers.interviewerObservations}
                    onChange={(e) => updateAnswer('interviewerObservations', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                  />
                </div>

                {/* Custom Questions Block */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Preguntas Adicionales Personalizadas
                      </h3>
                      <p className="text-xs text-slate-500">
                        Agrega o modifica preguntas específicas que surjan durante la entrevista.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomQuestion}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Pregunta</span>
                    </button>
                  </div>

                  {answers.customQuestions.length > 0 && (
                    <div className="space-y-4">
                      {answers.customQuestions.map((cq, index) => (
                        <div
                          key={cq.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-mono font-semibold text-slate-500">
                              Pregunta adicional #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomQuestion(cq.id)}
                              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Quitar</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Escribe el enunciado de la pregunta..."
                            value={cq.question}
                            onChange={(e) =>
                              handleUpdateCustomQuestion(cq.id, 'question', e.target.value)
                            }
                            className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                          />
                          <textarea
                            rows={2}
                            placeholder="Escribe la respuesta del entrevistado..."
                            value={cq.answer}
                            onChange={(e) =>
                              handleUpdateCustomQuestion(cq.id, 'answer', e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-teal-700"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {hasUnsavedTouch
                        ? 'Cambios sincronizados localmente. Pulsa Guardar Cambios para confirmar.'
                        : lastSavedTime
                        ? `Último guardado confirmado a las ${lastSavedTime}.`
                        : 'Almacenamiento local activo.'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportRecord(activeRecord)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Generar Informe</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>
      )}

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Formato de Entrevista y Diagnóstico de Procesos · Servicio al Cliente</span>
          {onOpenStore && (
            <button
              onClick={onOpenStore}
              className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Ir a Tienda Glow Beauty
            </button>
          )}
        </div>
      </footer>

      {/* Executive Diagnostic Report Modal */}
      {reportRecord && (
        <DiagnosticReportModal
          record={reportRecord}
          onClose={() => setReportRecord(null)}
        />
      )}
    </div>
  );
};
