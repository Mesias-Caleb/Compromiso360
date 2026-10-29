import { CommitmentService } from '../services/commitment-service';
import { Env } from '../types/env';
import { requireAdminSession } from '../middleware/auth';

export function adminRoutes(service: CommitmentService, env: Env) {
  return {
    async GET(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname;
      const cookieHeader = request.headers.get('cookie');

      // Autenticación requerida para todos los endpoints admin
      const auth = await requireAdminSession(env, cookieHeader);
      if (!auth.authorized) {
        return Response.json({ error: auth.message }, { status: auth.status ?? 401 });
      }

      if (path === '/api/admin/stats') {
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

      if (path === '/api/admin/commitments') {
        const campus = url.searchParams.get('campus') || undefined;
        const areaId = url.searchParams.get('areaId') || undefined;
        const search = url.searchParams.get('search') || undefined;
        const onlyConsenting = url.searchParams.get('onlyConsenting') === 'true';
        const startDate = url.searchParams.get('startDate') || undefined;
        const endDate = url.searchParams.get('endDate') || undefined;
        const limit = Math.min(
          Math.max(parseInt(url.searchParams.get('limit') || '100', 10), 1),
          500
        );

        const list = await service.list({
          campus: campus as 'LIM' | 'JUL' | 'TPP' | undefined,
          areaId,
          search,
          onlyConsenting,
          startDate,
          endDate,
          limit,
        });

        return Response.json(list);
      }

      if (path === '/api/admin/export') {
        const campus = url.searchParams.get('campus') || undefined;
        const areaId = url.searchParams.get('areaId') || undefined;
        const search = url.searchParams.get('search') || undefined;
        const onlyConsenting = url.searchParams.get('onlyConsenting') === 'true';

        const csv = await service.exportCSV({
          campus: campus as 'LIM' | 'JUL' | 'TPP' | undefined,
          areaId,
          search,
          onlyConsenting,
        });

        return new Response(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv;charset=utf-8',
            'Content-Disposition': 'attachment; filename="peí_compromisos.csv"',
          },
        });
      }

      return Response.json({ error: 'No encontrado' }, { status: 404 });
    },
  };
}
