import { describe, it, expect, beforeEach } from 'vitest';
import { LocalCommitmentRepository } from '../infrastructure/storage/local-commitment.repository';
import { UNIVERSITY_AREAS } from '../config/areas';

describe('LocalCommitmentRepository', () => {
  let repository: LocalCommitmentRepository;

  beforeEach(async () => {
    localStorage.clear();
    repository = new LocalCommitmentRepository();
    await repository.clearAll();
  });

  it('registers and retrieves a commitment', async () => {
    const commitment = await repository.register({
      nombres: 'Rosa',
      apellidos: 'Mendoza',
      campus: 'LIM',
      areaId: UNIVERSITY_AREAS[0].id,
      areaNombre: UNIVERSITY_AREAS[0].name,
      textoVersion: 'v1.0',
      aceptacion: true,
      permisoPublicacion: true,
    });

    expect(commitment.id).toBeDefined();
    expect(commitment.fechaISO).toBeDefined();
    expect(commitment.nombres).toBe('ROSA');

    const all = await repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(commitment.id);
  });

  it('filters commitments by campus and search term', async () => {
    await repository.register({
      nombres: 'Pedro',
      apellidos: 'Castillo',
      campus: 'LIM',
      areaId: UNIVERSITY_AREAS[0].id,
      areaNombre: UNIVERSITY_AREAS[0].name,
      textoVersion: 'v1.0',
      aceptacion: true,
      permisoPublicacion: true,
    });

    await repository.register({
      nombres: 'Lucía',
      apellidos: 'Flores',
      campus: 'JUL',
      areaId: UNIVERSITY_AREAS[1].id,
      areaNombre: UNIVERSITY_AREAS[1].name,
      textoVersion: 'v1.0',
      aceptacion: true,
      permisoPublicacion: false,
    });

    const limList = await repository.getAll({ campus: 'LIM' });
    expect(limList).toHaveLength(1);
    expect(limList[0].nombres).toBe('PEDRO');

    const searchList = await repository.getAll({ search: 'Lucía' });
    expect(searchList).toHaveLength(1);
    expect(searchList[0].nombres).toBe('Lucía'.trim().toUpperCase().replace(/\s+/g, ' '));

    const consentOnly = await repository.getAll({ onlyConsenting: true });
    expect(consentOnly).toHaveLength(1);
    expect(consentOnly[0].nombres).toBe('PEDRO');
  });

  it('prevents accidental duplicate submission with the same token', async () => {
    const token = 'token-unique-test-123';

    await repository.register({
      nombres: 'Elena',
      apellidos: 'Ríos',
      campus: 'TPP',
      areaId: UNIVERSITY_AREAS[0].id,
      areaNombre: UNIVERSITY_AREAS[0].name,
      textoVersion: 'v1.0',
      aceptacion: true,
      permisoPublicacion: true,
      clientSubmissionToken: token,
    });

    await expect(
      repository.register({
        nombres: 'Elena',
        apellidos: 'Ríos',
        campus: 'TPP',
        areaId: UNIVERSITY_AREAS[0].id,
        areaNombre: UNIVERSITY_AREAS[0].name,
        textoVersion: 'v1.0',
        aceptacion: true,
        permisoPublicacion: true,
        clientSubmissionToken: token,
      }),
    ).rejects.toThrow(/ya fue enviado/);
  });

  it('exports commitments to CSV format', async () => {
    await repository.register({
      nombres: 'Jorge',
      apellidos: 'Díaz',
      campus: 'LIM',
      areaId: UNIVERSITY_AREAS[0].id,
      areaNombre: UNIVERSITY_AREAS[0].name,
      textoVersion: 'v1.0',
      aceptacion: true,
      permisoPublicacion: true,
    });

    const csv = await repository.exportToCSV();
    expect(csv).toContain('ID,Nombres,Apellidos,Campus');
    expect(csv).toContain('JORGE,DÍAZ,LIM');
  });

  it('clears all commitments and resets list', async () => {
    await repository.register({
      nombres: 'Silvia',
      apellidos: 'Navarro',
      campus: 'JUL',
      areaId: UNIVERSITY_AREAS[0].id,
      areaNombre: UNIVERSITY_AREAS[0].name,
      textoVersion: 'v1.0',
      aceptacion: true,
      permisoPublicacion: true,
    });

    expect(await repository.getAll()).toHaveLength(1);

    await repository.clearAll();
    expect(await repository.getAll()).toHaveLength(0);
  });
});

describe('Worker Local Session Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists active session and returns it within 1 day', async () => {
    const { saveActiveWorkerSession, getActiveWorkerSession } = await import(
      '../infrastructure/storage/local-commitment.repository'
    );

    const commitment = {
      id: 'test-123',
      nombres: 'Ana',
      apellidos: 'Torres',
      campus: 'LIM' as const,
      areaId: 'area-1',
      areaNombre: 'Dirección General',
      textoVersion: 'v1.0-2027-2031',
      aceptacion: true,
      permisoPublicacion: true,
      fechaISO: new Date().toISOString(),
      origenDemo: false,
    };

    saveActiveWorkerSession(commitment);

    const active = getActiveWorkerSession();
    expect(active).not.toBeNull();
    expect(active?.nombres).toBe('Ana');
    expect(active?.id).toBe('test-123');
  });

  it('expires and removes session when older than 24 hours (1 day)', async () => {
    const { WORKER_SESSION_KEY, getActiveWorkerSession } = await import(
      '../infrastructure/storage/local-commitment.repository'
    );

    const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    const expiredSession = {
      commitment: {
        id: 'test-expired',
        nombres: 'Pedro',
        apellidos: 'Ramos',
        campus: 'JUL' as const,
        areaId: 'area-1',
        areaNombre: 'Facultad',
        textoVersion: 'v1.0-2027-2031',
        aceptacion: true,
        permisoPublicacion: true,
        fechaISO: new Date(expiredTimestamp).toISOString(),
        origenDemo: false,
      },
      timestamp: expiredTimestamp,
    };

    localStorage.setItem(WORKER_SESSION_KEY, JSON.stringify(expiredSession));

    // When retrieved, it should recognize it is expired, remove it and return null
    const active = getActiveWorkerSession();
    expect(active).toBeNull();
    expect(localStorage.getItem(WORKER_SESSION_KEY)).toBeNull();
  });
});
