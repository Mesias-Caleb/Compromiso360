import { Commitment } from '../models/commitment';
import { EventStats, CampusStats, AreaStats } from '../models/stats';
import { CampusId } from '../models/campus';
import { CAMPUSES } from '../../config/campuses';
import { CAMPUS_TARGETS, OFFICIAL_EVENT_CONFIG } from '../../config/event';
import { UNIVERSITY_AREAS } from '../../config/areas';

export function calculateEventStats(commitments: Commitment[]): EventStats {
  const total = commitments.length;
  const targetTotal = OFFICIAL_EVENT_CONFIG.totalTargetParticipants;
  const overallPercentage = targetTotal > 0 ? Math.min(100, Math.round((total / targetTotal) * 100)) : 0;

  const campusCounts: Record<CampusId, number> = {
    LIM: 0,
    JUL: 0,
    TPP: 0,
  };

  const areaMap: Record<string, number> = {};
  let consentCount = 0;

  for (const c of commitments) {
    if (campusCounts[c.campus] !== undefined) {
      campusCounts[c.campus]++;
    }
    areaMap[c.areaId] = (areaMap[c.areaId] || 0) + 1;
    if (c.permisoPublicacion) {
      consentCount++;
    }
  }

  const byCampus: Record<CampusId, CampusStats> = {
    LIM: {
      campus: 'LIM',
      name: CAMPUSES.LIM.name,
      count: campusCounts.LIM,
      target: CAMPUS_TARGETS.LIM,
      percentage: Math.min(100, Math.round((campusCounts.LIM / CAMPUS_TARGETS.LIM) * 100)),
    },
    JUL: {
      campus: 'JUL',
      name: CAMPUSES.JUL.name,
      count: campusCounts.JUL,
      target: CAMPUS_TARGETS.JUL,
      percentage: Math.min(100, Math.round((campusCounts.JUL / CAMPUS_TARGETS.JUL) * 100)),
    },
    TPP: {
      campus: 'TPP',
      name: CAMPUSES.TPP.name,
      count: campusCounts.TPP,
      target: CAMPUS_TARGETS.TPP,
      percentage: Math.min(100, Math.round((campusCounts.TPP / CAMPUS_TARGETS.TPP) * 100)),
    },
  };

  const byArea: AreaStats[] = Object.entries(areaMap)
    .filter(([, count]) => count > 0)
    .map(([areaId, count]) => {
      const area = UNIVERSITY_AREAS.find((a) => a.id === areaId);
      return {
        areaId,
        areaNombre: area ? area.name : areaId,
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const consentPercentage = total > 0 ? Math.round((consentCount / total) * 100) : 0;

  return {
    total,
    targetTotal,
    overallPercentage,
    byCampus,
    byArea,
    consentCount,
    consentPercentage,
    lastUpdatedISO: new Date().toISOString(),
  };
}
