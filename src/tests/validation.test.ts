import { describe, it, expect } from 'vitest';
import {
  validateAccessCodeInput,
  validateCommitmentForm,
} from '../domain/services/validation.service';
import { UNIVERSITY_AREAS } from '../config/areas';

describe('Campus Access Code Validation', () => {
  it('accepts valid code for Lima', () => {
    const result = validateAccessCodeInput('LIM');
    expect(result.isValid).toBe(true);
    expect(result.campusId).toBe('LIM');
  });

  it('accepts valid code with lowercase and accidental whitespace', () => {
    const result = validateAccessCodeInput('  jul  ');
    expect(result.isValid).toBe(true);
    expect(result.campusId).toBe('JUL');
  });

  it('accepts valid code for Tarapoto', () => {
    const result = validateAccessCodeInput('TPP');
    expect(result.isValid).toBe(true);
    expect(result.campusId).toBe('TPP');
  });

  it('rejects empty or whitespace-only code', () => {
    const result = validateAccessCodeInput('   ');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeDefined();
  });

  it('rejects unrecognized code', () => {
    const result = validateAccessCodeInput('XYZ');
    expect(result.isValid).toBe(false);
    expect(result.campusId).toBeUndefined();
  });
});

describe('Commitment Form Validation', () => {
  const validArea = UNIVERSITY_AREAS[0].id;

  it('validates a complete and correct form submission', () => {
    const result = validateCommitmentForm({
      nombres: 'María Teresa',
      apellidos: 'Vargas Llosa',
      campus: 'LIM',
      areaId: validArea,
      aceptacion: true,
      permisoPublicacion: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('fails when solemn acceptance checkbox is false', () => {
    const result = validateCommitmentForm({
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Gómez',
      campus: 'JUL',
      areaId: validArea,
      aceptacion: false,
      permisoPublicacion: true,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.aceptacion).toBeDefined();
  });

  it('fails when names are too short or empty', () => {
    const result = validateCommitmentForm({
      nombres: 'A',
      apellidos: 'García',
      campus: 'TPP',
      areaId: validArea,
      aceptacion: true,
      permisoPublicacion: false,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.nombres).toBeDefined();
  });

  it('fails when area is not from the valid catalog', () => {
    const result = validateCommitmentForm({
      nombres: 'Ana María',
      apellidos: 'Fernández',
      campus: 'LIM',
      areaId: 'area-inexistente',
      aceptacion: true,
      permisoPublicacion: true,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.areaId).toBeDefined();
  });
});
