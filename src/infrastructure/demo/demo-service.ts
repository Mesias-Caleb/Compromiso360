import { LocalCommitmentRepository } from '../storage/local-commitment.repository';
import { CommitmentRepository } from '../../domain/repositories/commitment.repository';
import { RemoteCommitmentRepository } from '../remote/remote-commitment.repository';
import { MOCK_COMMITMENTS } from './mock-commitments';

let repository: CommitmentRepository | null = null;

/**
 * Resuelve el repositorio activo según la variable de entorno explícita.
 * VITE_REPOSITORY_MODE='remote' → Cloudflare Workers + D1
 * Cualquier otro valor → LocalStorage (desarrollo)
 */
function resolveRepository(): CommitmentRepository {
  const mode = (import.meta.env.VITE_REPOSITORY_MODE as string | undefined) || 'local';
  if (mode === 'remote') {
    return new RemoteCommitmentRepository();
  }
  return new LocalCommitmentRepository();
}

/**
 * Devuelve la instancia del repositorio según el modo configurado.
 */
export function getCommitmentRepository(): CommitmentRepository {
  if (!repository) {
    repository = resolveRepository();
  }
  return repository;
}

/**
 * Proxy retrocompatible: delega todas las llamadas al repositorio activo
 * (local o remoto) sin que los consumidores necesiten cambiar sus importaciones.
 */
export const commitmentRepository: CommitmentRepository = new Proxy(
  {} as CommitmentRepository,
  {
    get(_, prop: keyof CommitmentRepository) {
      const repo = getCommitmentRepository();
      const method = repo[prop];
      return method.bind(repo);
    },
  }
);

/**
 * Seeds demo data into the active repository (only meaningful in local mode).
 */
export async function seedDemoData(): Promise<number> {
  return await getCommitmentRepository().seedDemo(MOCK_COMMITMENTS);
}

/**
 * Clears all data from the active repository.
 */
export async function clearDemoData(): Promise<void> {
  await getCommitmentRepository().clearAll();
}

(window as unknown as { __PEI_DEMO__?: object }).__PEI_DEMO__ = {
  seed: seedDemoData,
  clear: clearDemoData,
  repository: getCommitmentRepository(),
};
