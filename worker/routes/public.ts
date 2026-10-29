import { CommitmentService } from '../services/commitment-service';
import { Env } from '../types/env';

export function publicRoutes(service: CommitmentService) {
  return {
    async GET(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === '/api/public/stats') {
        const stats = await service.getStats();
        return Response.json({
          total: stats.total,
          targetTotal: stats.targetTotal,
          overallPercentage: stats.overallPercentage,
          byCampus: stats.byCampus,
          byArea: stats.byArea,
          consentCount: stats.consentCount,
          consentPercentage: stats.consentPercentage,
          lastUpdatedISO: stats.lastUpdatedISO,
        });
      }

      if (path === '/api/public/recent') {
        const limit = Math.min(
          Math.max(parseInt(url.searchParams.get('limit') || '10', 10), 1),
          50
        );
        const list = await service.getRecent(limit);
        // Filtrar solo los que tienen permiso de publicación para el mural público
        const publicList = list.filter((c) => c.permisoPublicacion);
        return Response.json(publicList);
      }

      return Response.json({ error: 'No encontrado' }, { status: 404 });
    },
  };
}
