import { Env } from './types/env';
import { D1CommitmentRepository } from './repositories/d1-commitment-repository';
import { CommitmentService } from './services/commitment-service';
import { commitRoutes } from './routes/commitments';
import { publicRoutes } from './routes/public';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── API: Públicos ──
    if (path.startsWith('/api/commitments')) {
      const service = new CommitmentService(new D1CommitmentRepository(env.DB));
      return await commitRoutes(service, env).POST(request);
    }

    // ── API: Público stats ──
    if (path.startsWith('/api/public')) {
      const service = new CommitmentService(new D1CommitmentRepository(env.DB));
      return await publicRoutes(service).GET(request);
    }

    // ── API: Admin ──
    if (path.startsWith('/api/admin')) {
      const service = new CommitmentService(new D1CommitmentRepository(env.DB));
      return await adminRoutes(service, env).GET(request);
    }

    // ── API: Auth ──
    if (path.startsWith('/api/auth')) {
      return await authRoutes(env)[request.method as keyof ReturnType<typeof authRoutes>]?.(request) ??
        Response.json({ error: 'Método no permitido' }, { status: 405 });
    }

    // ── SPA fallback: servir frontend (assets desplegados con wrangler) ──
    // En desarrollo local, el frontend se sirve por Vite en puerto 3000.
    // En producción, wrangler sirve los assets desde la carpeta dist/.
    return env.ASSETS?.fetch(request) ?? Response.json({ error: 'No encontrado' }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
