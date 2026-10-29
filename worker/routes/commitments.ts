import { CommitmentService } from '../services/commitment-service';
import { Env } from '../types/env';
import { validateCommitmentBody } from '../middleware/validation';

export function commitRoutes(service: CommitmentService, env: Env) {
  return {
    async POST(request: Request): Promise<Response> {
      try {
        const body = await request.json();
        const validation = validateCommitmentBody(body);

        if (!validation.valid) {
          return Response.json(
            { error: 'Validación fallida', errors: validation.errors },
            { status: 400 }
          );
        }

        const data = validation.data!;
        const input = {
          nombres: data.nombres,
          apellidos: data.apellidos,
          campus: data.campus,
          areaId: data.area,
          areaNombre: data.area,
          textoVersion: data.textoVersion,
          aceptacion: data.aceptacion,
          permisoPublicacion: data.permisoPublicacion,
          clientSubmissionToken: data.idempotency_key,
          origenDemo: false,
        };

        const commitment = await service.register(input);

        return Response.json({
          id: commitment.id,
          nombres: commitment.nombres,
          apellidos: commitment.apellidos,
          campus: commitment.campus,
          areaId: commitment.areaId,
          fechaISO: commitment.fechaISO,
        }, { status: 201 });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado.';
        return Response.json({ error: message }, { status: 400 });
      }
    },
  };
}
