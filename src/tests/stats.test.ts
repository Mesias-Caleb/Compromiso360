import { describe, it, expect } from 'vitest';
import { calculateEventStats } from '../domain/services/stats.service';
import { Commitment } from '../domain/models/commitment';

describe('calculateEventStats', () => {
  it('correctly calculates metrics for commitments across campuses', () => {
    const commitments: Commitment[] = [
      {
        id: '1',
        nombres: 'A',
        apellidos: 'B',
        campus: 'LIM',
        areaId: 'acad-fac-ing',
        areaNombre: 'Facultad de Ingeniería',
        textoVersion: 'v1.0',
        aceptacion: true,
        permisoPublicacion: true,
        fechaISO: '2026-10-23T10:00:00Z',
        origenDemo: false,
      },
      {
        id: '2',
        nombres: 'C',
        apellidos: 'D',
        campus: 'JUL',
        areaId: 'acad-fac-ing',
        areaNombre: 'Facultad de Ingeniería',
        textoVersion: 'v1.0',
        aceptacion: true,
        permisoPublicacion: false,
        fechaISO: '2026-10-23T10:05:00Z',
        origenDemo: false,
      },
    ];

    const stats = calculateEventStats(commitments);
    expect(stats.total).toBe(2);
    expect(stats.byCampus.LIM.count).toBe(1);
    expect(stats.byCampus.JUL.count).toBe(1);
    expect(stats.byCampus.TPP.count).toBe(0);
    expect(stats.consentCount).toBe(1);
    expect(stats.consentPercentage).toBe(50);
  });
});
