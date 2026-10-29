export type CampusId = 'LIM' | 'JUL' | 'TPP';

export interface Campus {
  id: CampusId;
  name: string;
  city: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  validAccessCodes: string[];
}
