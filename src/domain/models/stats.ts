import { CampusId } from './campus';

export interface CampusStats {
  campus: CampusId;
  name: string;
  count: number;
  target: number;
  percentage: number;
}

export interface AreaStats {
  areaId: string;
  areaNombre: string;
  count: number;
}

export interface EventStats {
  total: number;
  targetTotal: number;
  overallPercentage: number;
  byCampus: Record<CampusId, CampusStats>;
  byArea: AreaStats[];
  consentCount: number;
  consentPercentage: number;
  lastUpdatedISO: string;
}
