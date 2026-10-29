export interface CommitmentInput {
  nombres: string;
  apellidos: string;
  campus: string;
  area: string;
  aceptacion: boolean;
  permisoPublicacion?: boolean;
  idempotency_key?: string;
  textoVersion?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

const VALID_CAMPUSES = ['LIM', 'JUL', 'TPP'];
const MAX_NAME_LENGTH = 60;
const MIN_NAME_LENGTH = 2;
const MAX_BODY_BYTES = 64 * 1024;

export function validateCommitmentBody(body: unknown): {
  valid: boolean;
  data?: CommitmentInput;
  errors?: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Cuerpo de solicitud inválido.' }] };
  }

  const b = body as Record<string, unknown>;

  const nombres = String(b.nombres ?? '').trim();
  if (!nombres) {
    errors.push({ field: 'nombres', message: 'Nombres son obligatorios.' });
  } else if (nombres.length < MIN_NAME_LENGTH) {
    errors.push({ field: 'nombres', message: `Nombres deben tener al menos ${MIN_NAME_LENGTH} caracteres.` });
  } else if (nombres.length > MAX_NAME_LENGTH) {
    errors.push({ field: 'nombres', message: `Nombres no deben exceder ${MAX_NAME_LENGTH} caracteres.` });
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(nombres)) {
    errors.push({ field: 'nombres', message: 'Nombres solo deben contener letras, tildes y espacios.' });
  }

  const apellidos = String(b.apellidos ?? '').trim();
  if (!apellidos) {
    errors.push({ field: 'apellidos', message: 'Apellidos son obligatorios.' });
  } else if (apellidos.length < MIN_NAME_LENGTH) {
    errors.push({ field: 'apellidos', message: `Apellidos deben tener al menos ${MIN_NAME_LENGTH} caracteres.` });
  } else if (apellidos.length > MAX_NAME_LENGTH) {
    errors.push({ field: 'apellidos', message: `Apellidos no deben exceder ${MAX_NAME_LENGTH} caracteres.` });
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(apellidos)) {
    errors.push({ field: 'apellidos', message: 'Apellidos solo deben contener letras, tildes y espacios.' });
  }

  const campus = String(b.campus ?? '').trim().toUpperCase();
  if (!VALID_CAMPUSES.includes(campus)) {
    errors.push({ field: 'campus', message: 'Campus debe ser LIM, JUL o TPP.' });
  }

  const area = String(b.area ?? '').trim();
  if (!area) {
    errors.push({ field: 'area', message: 'Área es obligatoria.' });
  }

  const aceptacion = b.aceptacion === true || b.aceptacion === 'true';
  if (!aceptacion) {
    errors.push({ field: 'aceptacion', message: 'Debe aceptar el compromiso institucional.' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      nombres,
      apellidos,
      campus: campus as 'LIM' | 'JUL' | 'TPP',
      area,
      aceptacion: true,
      permisoPublicacion: b.permisoPublicacion === true || b.permisoPublicacion === 'true',
      idempotency_key: String(b.idempotency_key ?? crypto.randomUUID()),
      textoVersion: String(b.textoVersion ?? 'v1.0-2027-2031'),
    },
  };
}
