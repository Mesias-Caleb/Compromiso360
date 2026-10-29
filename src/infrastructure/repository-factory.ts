import { CommitmentRepository } from '@/domain/repositories/commitment.repository';
import { RemoteCommitmentRepository } from './remote/remote-commitment.repository';
import { commitmentRepository as demoRepository } from './demo/demo-service';

export type RepositoryMode = 'local' | 'remote';

/**
 * Selecciona el modo de persistencia mediante variable de entorno explícita.
 * VITE_REPOSITORY_MODE='local' → LocalStorage (desarrollo, sin backend)
 * VITE_REPOSITORY_MODE='remote' → Cloudflare Workers + D1 (producción)
 */
export function getRepositoryMode(): RepositoryMode {
  const mode = (import.meta.env.VITE_REPOSITORY_MODE as RepositoryMode | undefined) || 'local';
  return mode === 'remote' ? 'remote' : 'local';
}

/**
 * Instancia del repositorio según el modo configurado.
 */
export function getCommitmentRepository(): CommitmentRepository {
  const mode = getRepositoryMode();

  if (mode === 'remote') {
    return new RemoteCommitmentRepository();
  }

  return demoRepository;
}
