import {
  Commitment,
  CreateCommitmentInput,
  CommitmentFilters,
} from '../../src/domain/models/commitment';
import { EventStats } from '../../src/domain/models/stats';
import { CommitmentRepository } from '../../src/domain/repositories/commitment.repository';
import { UNIVERSITY_AREAS } from '../../src/config/areas';
import { OFFICIAL_EVENT_CONFIG } from '../../src/config/event';
import { calculateEventStats } from '../../src/domain/services/stats.service';

const VALID_CAMPUSES = ['LIM', 'JUL', 'TPP'];
const MAX_BODY_BYTES = 64 * 1024; // 64 KB

function commitmentFromRow(row: Record<string, unknown>): Commitment {
  return {
    id: String(row.id),
    nombres: String(row.first_name),
    apellidos: String(row.last_name),
    campus: String(row.campus) as 'LIM' | 'JUL' | 'TPP',
    areaId: String(row.area),
    areaNombre: String(row.area_name),
    textoVersion: String(row.texto_version),
    aceptacion: Number(row.accepted) === 1,
    permisoPublicacion: Number(row.publish_permission) === 1,
    fechaISO: String(row.created_at),
    origenDemo: false,
  };
}

export class D1CommitmentRepository implements CommitmentRepository {
  constructor(private db: D1Database) {}

  async register(input: CreateCommitmentInput): Promise<Commitment> {
    // Validación de campus
    if (!VALID_CAMPUSES.includes(input.campus)) {
      throw new Error(`Campus inválido: ${input.campus}`);
    }

    // Validación de área
    const area = UNIVERSITY_AREAS.find((a) => a.id === input.areaId);
    if (!area) {
      throw new Error(`Área no autorizada: ${input.areaId}`);
    }
    const areaNombre = area.name;

    // Normalización de nombres
    const normalizedNombres = input.nombres.trim().toUpperCase().replace(/\s+/g, ' ');
    const normalizedApellidos = input.apellidos.trim().toUpperCase().replace(/\s+/g, ' ');

    if (!normalizedNombres || !normalizedApellidos) {
      throw new Error('Nombres y apellidos son obligatorios.');
    }

    // Idempotencia: si ya existe una clave, retornar el existente sin duplicar
    if (input.clientSubmissionToken) {
      const existing = await this.db
        .prepare('SELECT id FROM commitments WHERE idempotency_key = ?')
        .bind(input.clientSubmissionToken)
        .first<{ id: string }>();

      if (existing) {
        const full = await this.getById(existing.id);
        if (full) return full;
        throw new Error('Registro existente no se pudo recuperar.');
      }
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const idempotencyKey = input.clientSubmissionToken || `idempotent_${id}`;

    await this.db
      .prepare(
        `INSERT INTO commitments (
          id, first_name, last_name, campus, area, area_name,
          texto_version, accepted, publish_permission, created_at, idempotency_key
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        normalizedNombres,
        normalizedApellidos,
        input.campus,
        input.areaId,
        areaNombre,
        input.textoVersion || OFFICIAL_EVENT_CONFIG.officialStatementVersion,
        input.aceptacion ? 1 : 0,
        input.permisoPublicacion ? 1 : 0,
        now,
        idempotencyKey
      )
      .run();

    return {
      id,
      nombres: normalizedNombres,
      apellidos: normalizedApellidos,
      campus: input.campus,
      areaId: input.areaId,
      areaNombre,
      textoVersion: input.textoVersion || OFFICIAL_EVENT_CONFIG.officialStatementVersion,
      aceptacion: input.aceptacion,
      permisoPublicacion: input.permisoPublicacion,
      fechaISO: now,
      origenDemo: input.origenDemo ?? false,
      clientSubmissionToken: input.clientSubmissionToken,
    };
  }

  async getAll(filters?: CommitmentFilters): Promise<Commitment[]> {
    let sql = `SELECT * FROM commitments`;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (filters?.campus) {
      conditions.push(`campus = ?`);
      params.push(filters.campus);
    }
    if (filters?.areaId) {
      conditions.push(`area = ?`);
      params.push(filters.areaId);
    }
    if (filters?.onlyConsenting) {
      conditions.push(`publish_permission = 1`);
    }
    if (filters?.startDate) {
      conditions.push(`created_at >= ?`);
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      conditions.push(`created_at <= ?`);
      params.push(filters.endDate);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Búsqueda por nombre (insensible a mayúsculas)
    if (filters?.search && filters.search.trim()) {
      const query = `%${filters.search.trim().toLowerCase()}%`;
      conditions.push(`LOWER(first_name || ' ' || last_name) LIKE ?`);
      params.push(query);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      sql += ` LIMIT ?`;
      params.push(filters.limit);
    }

    const result = await this.db.prepare(sql).bind(...params).all<Record<string, unknown>>();
    const list = (result.results || []).map(commitmentFromRow);

    // Filtro de búsqueda en aplicación (D1 LIKE puede variar)
    const filtered = filters?.search && filters.search.trim()
      ? list.filter((c) =>
          `${c.nombres} ${c.apellidos}`.toLowerCase().includes(filters.search!.trim().toLowerCase())
        )
      : list;

    return filtered;
  }

  async getById(id: string): Promise<Commitment | null> {
    const result = await this.db
      .prepare('SELECT * FROM commitments WHERE id = ?')
      .bind(id)
      .first<Record<string, unknown>>();

    if (!result) return null;
    return commitmentFromRow(result);
  }

  async getStats(): Promise<EventStats> {
    const list = await this.getAll();
    return calculateEventStats(list);
  }

  async getRecent(limit = 20): Promise<Commitment[]> {
    const result = await this.db
      .prepare('SELECT * FROM commitments ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all<Record<string, unknown>>();

    return (result.results || []).map(commitmentFromRow);
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
      ].map(escapeCSV).join(','),
    );

    return [headers.join(','), ...rows].join('\r\n');
  }

  async clearAll(): Promise<void> {
    await this.db.prepare('DELETE FROM commitments').run();
  }

  async seedDemo(records?: Commitment[]): Promise<number> {
    const seedData = records || [];
    for (const c of seedData) {
      await this.db
        .prepare(
          `INSERT OR REPLACE INTO commitments (
            id, first_name, last_name, campus, area, area_name,
            texto_version, accepted, publish_permission, created_at, idempotency_key
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          c.id,
          c.nombres,
          c.apellidos,
          c.campus,
          c.areaId,
          c.areaNombre,
          c.textoVersion,
          c.aceptacion ? 1 : 0,
          c.permisoPublicacion ? 1 : 0,
          c.fechaISO,
          `demo_${c.id}`
        )
        .run();
    }
    return seedData.length;
  }

  subscribe(listener: () => void): () => void {
    // D1 no tiene notificación en tiempo real nativa en este contexto.
    // El frontend usa polling para detectar cambios.
    return () => {};
  }
}
