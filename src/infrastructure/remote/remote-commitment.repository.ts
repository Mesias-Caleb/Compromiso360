import {
  Commitment,
  CreateCommitmentInput,
  CommitmentFilters,
} from '../../domain/models/commitment';
import { EventStats } from '../../domain/models/stats';
import { CommitmentRepository } from '../../domain/repositories/commitment.repository';
import { OFFICIAL_EVENT_CONFIG } from '../../config/event';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const REQUEST_TIMEOUT_MS = 15000;

function toCommitment(row: Record<string, unknown>): Commitment {
  return {
    id: String(row.id),
    nombres: String(row.first_name || row.nombres || ''),
    apellidos: String(row.last_name || row.apellidos || ''),
    campus: String(row.campus) as 'LIM' | 'JUL' | 'TPP',
    areaId: String(row.area || row.areaId || ''),
    areaNombre: String(row.area_name || row.areaNombre || ''),
    textoVersion: String(row.texto_version || row.textoVersion || OFFICIAL_EVENT_CONFIG.officialStatementVersion),
    aceptacion: Boolean(row.accepted ?? row.aceptacion ?? false),
    permisoPublicacion: Boolean(row.publish_permission ?? row.permisoPublicacion ?? false),
    fechaISO: String(row.created_at ?? row.fechaISO ?? new Date().toISOString()),
    origenDemo: false,
  };
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } finally {
    clearTimeout(timeout);
  }
}

export class RemoteCommitmentRepository implements CommitmentRepository {
  async register(input: CreateCommitmentInput): Promise<Commitment> {
    const body = {
      nombres: input.nombres,
      apellidos: input.apellidos,
      campus: input.campus,
      area: input.areaId,
      aceptacion: input.aceptacion,
      permisoPublicacion: input.permisoPublicacion,
      idempotency_key: input.clientSubmissionToken || `remote_${crypto.randomUUID()}`,
      textoVersion: input.textoVersion,
    };

    const result = await fetchJson<{ id: string; nombres: string; apellidos: string; campus: string; areaId: string; fechaISO: string }>(
      '/api/commitments',
      { method: 'POST', body: JSON.stringify(body) }
    );

    return {
      id: result.id,
      nombres: result.nombres,
      apellidos: result.apellidos,
      campus: result.campus as 'LIM' | 'JUL' | 'TPP',
      areaId: result.areaId,
      areaNombre: input.areaNombre,
      textoVersion: input.textoVersion || OFFICIAL_EVENT_CONFIG.officialStatementVersion,
      aceptacion: input.aceptacion,
      permisoPublicacion: input.permisoPublicacion,
      fechaISO: result.fechaISO,
      origenDemo: false,
      clientSubmissionToken: input.clientSubmissionToken,
    };
  }

  async getAll(filters?: CommitmentFilters): Promise<Commitment[]> {
    const params = new URLSearchParams();
    if (filters?.campus) params.set('campus', filters.campus);
    if (filters?.areaId) params.set('areaId', filters.areaId);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.onlyConsenting) params.set('onlyConsenting', 'true');
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);

    const query = params.toString();
    const path = `/api/admin/commitments${query ? `?${query}` : ''}`;

    const list = await fetchJson<Record<string, unknown>[]>(path);
    return list.map(toCommitment);
  }

  async getById(id: string): Promise<Commitment | null> {
    const list = await this.getAll();
    const item = list.find((c) => c.id === id);
    return item || null;
  }

  async getStats(): Promise<EventStats> {
    const stats = await fetchJson<EventStats>('/api/admin/stats');
    return stats;
  }

  async getRecent(limit = 20): Promise<Commitment[]> {
    const list = await this.getAll({ limit });
    return list;
  }

  async getRecentConsenting(limit?: number): Promise<Commitment[]> {
    const list = await this.getAll({ onlyConsenting: true, limit });
    return list;
  }

  async exportToCSV(filters?: CommitmentFilters): Promise<string> {
    const params = new URLSearchParams();
    if (filters?.campus) params.set('campus', filters.campus);
    if (filters?.areaId) params.set('areaId', filters.areaId);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.onlyConsenting) params.set('onlyConsenting', 'true');

    const query = params.toString();
    const path = `/api/admin/export${query ? `?${query}` : ''}`;

    const csv = await fetchJson<string>(path);
    return typeof csv === 'string' ? csv : String(csv);
  }

  async clearAll(): Promise<void> {
    // Endpoint de limpieza no expuesto públicamente por seguridad.
    // En modo remoto, la limpieza se hace desde el panel con autenticación.
    throw new Error('clearAll no disponible en modo remoto.');
  }

  async seedDemo(_records?: Commitment[]): Promise<number> {
    throw new Error('seedDemo no disponible en modo remoto.');
  }

  subscribe(_listener: () => void): () => void {
    // El repositorio remoto usa polling desde el frontend para detectar cambios.
    return () => {};
  }
}
