import { Commitment, CreateCommitmentInput, CommitmentFilters } from '../../domain/models/commitment';
import { EventStats } from '../../domain/models/stats';
import { CommitmentRepository } from '../../domain/repositories/commitment.repository';
import { calculateEventStats } from '../../domain/services/stats.service';
import { UNIVERSITY_AREAS } from '../../config/areas';
import { OFFICIAL_EVENT_CONFIG } from '../../config/event';

const STORAGE_KEY = 'pei_commitments_records_v1';
const SUBMISSION_TOKENS_KEY = 'pei_commitments_submission_tokens_v1';
const BROADCAST_CHANNEL_NAME = 'pei_commitments_channel';
export const WORKER_SESSION_KEY = 'pei_active_worker_commitment';
export const WORKER_SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export interface SavedWorkerSession {
  commitment: Commitment;
  timestamp: number;
}

export function getActiveWorkerSession(): Commitment | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(WORKER_SESSION_KEY);
    if (!raw) return null;
    const session: SavedWorkerSession = JSON.parse(raw);
    if (Date.now() - session.timestamp < WORKER_SESSION_EXPIRY_MS) {
      return session.commitment;
    }
    // Expired: clean it up
    window.localStorage.removeItem(WORKER_SESSION_KEY);
    return null;
  } catch {
    return null;
  }
}

export function saveActiveWorkerSession(commitment: Commitment): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const session: SavedWorkerSession = {
      commitment,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(WORKER_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearActiveWorkerSession(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(WORKER_SESSION_KEY);
  } catch {
    // Ignore
  }
}

export class LocalCommitmentRepository implements CommitmentRepository {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();
  private memoryFallback: Commitment[] = [];
  private isStorageAvailable: boolean;

  constructor() {
    this.isStorageAvailable = this.checkStorageAvailable();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = () => {
          this.notifyListeners();
        };
      } catch {
        this.channel = null;
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.notifyListeners();
        }
      });
    }
  }

  private checkStorageAvailable(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getStoredList(): Commitment[] {
    if (!this.isStorageAvailable) {
      return [...this.memoryFallback];
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Commitment[];
    } catch (err) {
      console.error('[LocalCommitmentRepository] Error leyendo localStorage:', err);
      return [];
    }
  }

  private saveList(list: Commitment[]): void {
    if (!this.isStorageAvailable) {
      this.memoryFallback = [...list];
      this.notifyListeners();
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      this.notifyListeners();
      if (this.channel) {
        this.channel.postMessage({ type: 'COMMITMENT_UPDATED', timestamp: Date.now() });
      }
    } catch (err) {
      console.error('[LocalCommitmentRepository] Error guardando en localStorage:', err);
      throw new Error('No se pudo guardar el registro localmente por límite de almacenamiento.');
    }
  }

  private isTokenUsed(token: string): boolean {
    if (!token) return false;
    if (!this.isStorageAvailable) return false;
    try {
      const raw = window.localStorage.getItem(SUBMISSION_TOKENS_KEY);
      if (!raw) return false;
      const tokens: string[] = JSON.parse(raw);
      return tokens.includes(token);
    } catch {
      return false;
    }
  }

  private markTokenUsed(token: string): void {
    if (!token || !this.isStorageAvailable) return;
    try {
      const raw = window.localStorage.getItem(SUBMISSION_TOKENS_KEY);
      const tokens: string[] = raw ? JSON.parse(raw) : [];
      if (!tokens.includes(token)) {
        tokens.push(token);
        // keep only last 50 tokens
        if (tokens.length > 50) tokens.shift();
        window.localStorage.setItem(SUBMISSION_TOKENS_KEY, JSON.stringify(tokens));
      }
    } catch {
      // ignore
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('[LocalCommitmentRepository] Error en listener:', err);
      }
    });
  }

  async register(input: CreateCommitmentInput): Promise<Commitment> {
    if (input.clientSubmissionToken && this.isTokenUsed(input.clientSubmissionToken)) {
      throw new Error('Este registro ya fue enviado desde esta sesión para evitar duplicados.');
    }

    const area = UNIVERSITY_AREAS.find((a) => a.id === input.areaId);
    const areaNombre = area ? area.name : input.areaNombre || 'Área no especificada';

    const normalizedNombres = input.nombres.trim().toUpperCase().replace(/\s+/g, ' ');
    const normalizedApellidos = input.apellidos.trim().toUpperCase().replace(/\s+/g, ' ');

    const newCommitment: Commitment = {
      id: crypto.randomUUID ? crypto.randomUUID() : `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      nombres: normalizedNombres,
      apellidos: normalizedApellidos,
      campus: input.campus,
      areaId: input.areaId,
      areaNombre,
      textoVersion: input.textoVersion || OFFICIAL_EVENT_CONFIG.officialStatementVersion,
      aceptacion: input.aceptacion,
      permisoPublicacion: Boolean(input.permisoPublicacion),
      fechaISO: new Date().toISOString(),
      origenDemo: input.origenDemo ?? false,
      clientSubmissionToken: input.clientSubmissionToken,
    };

    const current = this.getStoredList();
    // Add to beginning of list (newest first)
    const updated = [newCommitment, ...current];
    this.saveList(updated);

    if (input.clientSubmissionToken) {
      this.markTokenUsed(input.clientSubmissionToken);
    }

    return newCommitment;
  }

  async getAll(filters?: CommitmentFilters): Promise<Commitment[]> {
    const list = this.getStoredList();
    if (!filters) return list;

    return list.filter((item) => {
      if (filters.campus && item.campus !== filters.campus) return false;
      if (filters.areaId && item.areaId !== filters.areaId) return false;
      if (filters.onlyConsenting && !item.permisoPublicacion) return false;
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const fullName = `${item.nombres} ${item.apellidos}`.toLowerCase();
        const area = item.areaNombre.toLowerCase();
        if (!fullName.includes(query) && !area.includes(query)) return false;
      }
      return true;
    });
  }

  async getById(id: string): Promise<Commitment | null> {
    const list = this.getStoredList();
    return list.find((c) => c.id === id) || null;
  }

  async getRecent(limit = 20): Promise<Commitment[]> {
    const list = this.getStoredList();
    return list.slice(0, limit);
  }

  async getRecentConsenting(limit?: number): Promise<Commitment[]> {
    const list = this.getStoredList().filter((c) => c.permisoPublicacion);
    return limit ? list.slice(0, limit) : list;
  }

  async getStats(): Promise<EventStats> {
    const list = this.getStoredList();
    return calculateEventStats(list);
  }

  async exportToCSV(filters?: CommitmentFilters): Promise<string> {
    const list = await this.getAll(filters);

    const headers = [
      'ID',
      'Nombres',
      'Apellidos',
      'Campus',
      'Área ID',
      'Área Nombre',
      'Versión Compromiso',
      'Aceptación',
      'Consentimiento Mural',
      'Fecha Registro (ISO)',
      'Origen Demostración',
    ];

    const escapeCSV = (val: unknown): string => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = list.map((c) =>
      [
        c.id,
        c.nombres,
        c.apellidos,
        c.campus,
        c.areaId,
        c.areaNombre,
        c.textoVersion,
        c.aceptacion ? 'SÍ' : 'NO',
        c.permisoPublicacion ? 'SÍ' : 'NO',
        c.fechaISO,
        c.origenDemo ? 'DEMO' : 'LOCAL',
      ]
        .map(escapeCSV)
        .join(','),
    );

    return [headers.join(','), ...rows].join('\r\n');
  }

  async clearAll(): Promise<void> {
    if (this.isStorageAvailable) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(SUBMISSION_TOKENS_KEY);
      clearActiveWorkerSession();
    }
    this.memoryFallback = [];
    this.notifyListeners();
    if (this.channel) {
      this.channel.postMessage({ type: 'COMMITMENTS_CLEARED', timestamp: Date.now() });
    }
  }

  async seedDemo(records?: Commitment[]): Promise<number> {
    const seedData = records || [];
    this.saveList(seedData);
    return seedData.length;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
