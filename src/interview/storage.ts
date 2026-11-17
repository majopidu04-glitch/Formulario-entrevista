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

export function parseImportedRecords(jsonText: string): InterviewRecord[] {
  const parsed = JSON.parse(jsonText);

  // Supports array, { records: [...] }, or single InterviewRecord
  let rawList: Partial<InterviewRecord>[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (parsed && Array.isArray(parsed.records)) {
    rawList = parsed.records;
  } else if (parsed && parsed.answers) {
    rawList = [parsed];
  } else {
    throw new Error('Formato de archivo JSON no reconocido.');
  }

  const normalized = rawList.map((item) => normalizeInterviewRecord(item));
  if (normalized.length === 0) {
    throw new Error('El archivo no contiene entrevistas válidas.');
  }
  return normalized;
}
