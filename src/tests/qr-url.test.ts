import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCommitmentUrl, isQrConfigured } from '../config/qr';

const ENV_KEY = 'VITE_PUBLIC_COMMITMENT_URL';

function setEnv(value: string | undefined) {
  const env = import.meta.env as Record<string, unknown>;
  if (value === undefined) {
    delete env[ENV_KEY];
  } else {
    env[ENV_KEY] = value;
  }
}

describe('QR commitment URL configuration', () => {
  beforeEach(() => {
    setEnv(undefined);
  });

  afterEach(() => {
    setEnv(undefined);
  });

  it('returns null when VITE_PUBLIC_COMMITMENT_URL is not defined', () => {
    expect(getCommitmentUrl()).toBeNull();
    expect(isQrConfigured()).toBe(false);
  });

  it('returns the configured URL when it ends with /compromiso', () => {
    setEnv('https://f1znfqmm-3000.brs.devtunnels.ms/compromiso');
    const url = getCommitmentUrl();
    expect(url).toBe('https://f1znfqmm-3000.brs.devtunnels.ms/compromiso');
    expect(isQrConfigured()).toBe(true);
  });

  it('appends /compromiso when missing', () => {
    setEnv('https://f1znfqmm-3000.brs.devtunnels.ms');
    const url = getCommitmentUrl();
    expect(url).toBe('https://f1znfqmm-3000.brs.devtunnels.ms/compromiso');
  });

  it('rejects localhost URLs (returns null in non-dev)', () => {
    // En entorno de prueba no es DEV, por lo que localhost debe ser rechazado
    setEnv('http://localhost:3000/compromiso');
    expect(getCommitmentUrl()).toBeNull();
    expect(isQrConfigured()).toBe(false);
  });

  it('rejects 127.0.0.1 URLs', () => {
    setEnv('http://127.0.0.1:3000/compromiso');
    expect(getCommitmentUrl()).toBeNull();
    expect(isQrConfigured()).toBe(false);
  });

  it('returns configured URL for valid production domain', () => {
    setEnv('https://pei-compromiso.example.com/compromiso');
    const url = getCommitmentUrl();
    expect(url).toBe('https://pei-compromiso.example.com/compromiso');
    expect(isQrConfigured()).toBe(true);
  });
});
