import { CampusId } from './campus';

export interface Commitment {
  id: string; // UUID
  nombres: string;
  apellidos: string;
  campus: CampusId;
  areaId: string;
  areaNombre: string;
  textoVersion: string; // e.g. "v1.0-2026-2030"
  aceptacion: boolean; // Must be true to register
  permisoPublicacion: boolean; // Permission to show name on public mural
  fechaISO: string; // ISO 8601 string
  origenDemo: boolean; // Flag to distinguish demo data vs local session submissions
  clientSubmissionToken?: string; // Token to prevent accidental double submission from same browser session
}

export type CreateCommitmentInput = Omit<Commitment, 'id' | 'fechaISO' | 'origenDemo'> & {
  origenDemo?: boolean;
};

export interface CommitmentFilters {
  campus?: CampusId;
  areaId?: string;
  search?: string;
  onlyConsenting?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
}
