import { Campus, CampusId } from '../domain/models/campus';

export const CAMPUSES: Record<CampusId, Campus> = {
  LIM: {
    id: 'LIM',
    name: 'Campus Lima',
    city: 'Lima',
    color: '#0284c7', // Sky blue
    badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    badgeText: 'text-sky-400',
    validAccessCodes: ['LIM'],
  },
  JUL: {
    id: 'JUL',
    name: 'Campus Juliaca',
    city: 'Juliaca',
    color: '#059669', // Emerald
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    badgeText: 'text-emerald-400',
    validAccessCodes: ['JUL'],
  },
  TPP: {
    id: 'TPP',
    name: 'Campus Tarapoto',
    city: 'Tarapoto',
    color: '#d97706', // Warm Amber
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    badgeText: 'text-amber-400',
    validAccessCodes: ['TPP'],
  },
};

export const CAMPUS_LIST = Object.values(CAMPUSES);

/**
 * Validates a campus code and returns the matching Campus if valid.
 * Codes are normalized (trimmed of accidental spaces, converted to uppercase).
 */
export function validateCampusCode(rawCode: string): Campus | null {
  if (!rawCode) return null;
  const normalized = rawCode.trim().toUpperCase();

  for (const campus of CAMPUS_LIST) {
    if (campus.validAccessCodes.some((code) => code.toUpperCase() === normalized)) {
      return campus;
    }
  }

  return null;
}

export function getCampusById(id: string): Campus | undefined {
  return CAMPUSES[id as CampusId];
}
