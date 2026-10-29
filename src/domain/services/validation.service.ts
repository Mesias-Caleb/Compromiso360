import { CampusId } from '../models/campus';
import { CAMPUSES, validateCampusCode } from '../../config/campuses';
import { UNIVERSITY_AREAS } from '../../config/areas';

export interface CodeValidationResult {
  isValid: boolean;
  campusId?: CampusId;
  campusName?: string;
  errorMessage?: string;
}

export interface CommitmentFormData {
  nombres: string;
  apellidos: string;
  campus: CampusId | '';
  areaId: string;
  aceptacion: boolean;
  permisoPublicacion: boolean;
}

export interface FormValidationErrors {
  nombres?: string;
  apellidos?: string;
  campus?: string;
  areaId?: string;
  aceptacion?: string;
  permisoPublicacion?: string;
  general?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationErrors;
}

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

/**
 * Validates the ceremonial campus access code entered by the user.
 */
export function validateAccessCodeInput(code: string): CodeValidationResult {
  const trimmed = (code || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Por favor, ingresa el código mostrado en la pantalla de tu campus.',
    };
  }

  const campus = validateCampusCode(trimmed);
  if (!campus) {
    return {
      isValid: false,
      errorMessage: 'Código no reconocido para este evento. Verifica el código de tu campus.',
    };
  }

  return {
    isValid: true,
    campusId: campus.id,
    campusName: campus.name,
  };
}

/**
 * Validates commitment form fields.
 */
export function validateCommitmentForm(data: Partial<CommitmentFormData>): FormValidationResult {
  const errors: FormValidationErrors = {};

  // Nombres
  const nombres = (data.nombres || '').trim();
  if (!nombres) {
    errors.nombres = 'Ingresa tus nombres completos.';
  } else if (nombres.length < 2) {
    errors.nombres = 'Los nombres deben contener al menos 2 caracteres.';
  } else if (nombres.length > 60) {
    errors.nombres = 'Los nombres no deben exceder 60 caracteres.';
  } else if (!NAME_REGEX.test(nombres)) {
    errors.nombres = 'Los nombres solo deben contener letras, tildes y espacios.';
  }

  // Apellidos
  const apellidos = (data.apellidos || '').trim();
  if (!apellidos) {
    errors.apellidos = 'Ingresa tus apellidos completos.';
  } else if (apellidos.length < 2) {
    errors.apellidos = 'Los apellidos deben contener al menos 2 caracteres.';
  } else if (apellidos.length > 60) {
    errors.apellidos = 'Los apellidos no deben exceder 60 caracteres.';
  } else if (!NAME_REGEX.test(apellidos)) {
    errors.apellidos = 'Los apellidos solo deben contener letras, tildes y espacios.';
  }

  // Campus
  if (!data.campus || !CAMPUSES[data.campus as CampusId]) {
    errors.campus = 'Selecciona o valida un campus institucional válido.';
  }

  // Área
  const areaValid = UNIVERSITY_AREAS.some((a) => a.id === data.areaId);
  if (!data.areaId || !areaValid) {
    errors.areaId = 'Selecciona el área institucional a la que perteneces.';
  }

  // Aceptación solemne (obligatoria)
  if (data.aceptacion !== true) {
    errors.aceptacion = 'Debes aceptar la declaración de compromiso para registrar tu participación.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
