import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RemoteCommitmentRepository } from '../infrastructure/remote/remote-commitment.repository';

const mockFetch = vi.fn() as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RemoteCommitmentRepository', () => {
  it('registers a commitment and returns the server response', async () => {
    const repo = new RemoteCommitmentRepository();
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'cmt-123',
          nombres: 'JUAN',
          apellidos: 'PÉREZ',
          campus: 'LIM',
          areaId: 'acad-fac-ing',
          fechaISO: '2027-01-15T10:00:00Z',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await repo.register({
      nombres: 'Juan',
      apellidos: 'Pérez',
      campus: 'LIM',
      areaId: 'acad-fac-ing',
      areaNombre: 'Facultad de Ingeniería',
      textoVersion: 'v1.0-2027-2031',
      aceptacion: true,
      permisoPublicacion: true,
      clientSubmissionToken: 'token-abc',
    });

    expect(result.id).toBe('cmt-123');
    expect(result.nombres).toBe('JUAN');
    expect(result.campus).toBe('LIM');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('/api/commitments');
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(callBody.idempotency_key).toBe('token-abc');
  });

  it('rethrows error when registration fails', async () => {
    const repo = new RemoteCommitmentRepository();
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Campus inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(
      repo.register({
        nombres: 'Juan',
        apellidos: 'Pérez',
        campus: 'LIM' as const,
        areaId: 'acad-fac-ing',
        areaNombre: 'X',
        textoVersion: 'v1.0',
        aceptacion: true,
        permisoPublicacion: true,
      })
    ).rejects.toThrow(/Error 400/);
  });

  it('getAll returns mapped commitments', async () => {
    const repo = new RemoteCommitmentRepository();
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: '1',
            first_name: 'ANA',
            last_name: 'TORRES',
            campus: 'JUL',
            area: 'acad-fac-salud',
            area_name: 'Facultad de Ciencias de la Salud',
            texto_version: 'v1.0-2027-2031',
            accepted: 1,
            publish_permission: 1,
            created_at: '2027-01-15T10:00:00Z',
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const list = await repo.getAll();
    expect(list).toHaveLength(1);
    expect(list[0].nombres).toBe('ANA');
    expect(list[0].apellidos).toBe('TORRES');
    expect(list[0].campus).toBe('JUL');
    expect(list[0].aceptacion).toBe(true);
    expect(list[0].permisoPublicacion).toBe(true);
  });

  it('getStats returns server stats', async () => {
    const repo = new RemoteCommitmentRepository();
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          total: 10,
          targetTotal: 1550,
          overallPercentage: 1,
          byCampus: { LIM: { count: 5 }, JUL: { count: 3 }, TPP: { count: 2 } },
          byArea: [],
          consentCount: 8,
          consentPercentage: 80,
          lastUpdatedISO: '2027-01-15T10:00:00Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const stats = await repo.getStats();
    expect(stats.total).toBe(10);
    expect(stats.byCampus.LIM.count).toBe(5);
  });

  it('clearAll throws in remote mode', async () => {
    const repo = new RemoteCommitmentRepository();
    await expect(repo.clearAll()).rejects.toThrow(/no disponible en modo remoto/);
  });

  it('seedDemo throws in remote mode', async () => {
    const repo = new RemoteCommitmentRepository();
    await expect(repo.seedDemo()).rejects.toThrow(/no disponible en modo remoto/);
  });
});
