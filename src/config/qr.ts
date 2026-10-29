const FORBIDDEN_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];
const FORBIDDEN_PATHS = ['/', '/login', '/admin'];

/**
 * Returns the validated public commitment URL, or null if not yet configured.
 * Reads VITE_PUBLIC_COMMITMENT_URL dynamically on each call.
 *
 * Resolution order:
 *  1. Explicit VITE_PUBLIC_COMMITMENT_URL env var (production or LAN IP for dev).
 *  2. Fallback: current origin + /compromiso (only valid for same-device testing).
 *  3. Production without config → pending state (null).
 */
export function getCommitmentUrl(): string | null {
  const rawEnv = import.meta.env.VITE_PUBLIC_COMMITMENT_URL as string | undefined;

  // 1. Use explicit env var if provided and non-empty.
  if (rawEnv && rawEnv.trim().length > 0) {
    const trimmed = rawEnv.trim();
    const url = trimmed.endsWith('/compromiso') ? trimmed : `${trimmed}/compromiso`;

    // Safety: reject localhost, 127.0.0.1, and forbidden paths
    try {
      const parsed = new URL(url);
      if (FORBIDDEN_HOSTS.includes(parsed.hostname)) {
        return null;
      }
      if (FORBIDDEN_PATHS.includes(parsed.pathname)) {
        return null;
      }
    } catch {
      return null;
    }

    return url;
  }

  // 2. Fallback: use current origin + /compromiso.
  // Warning: localhost/127.0.0.1 will NOT be scannable from other devices.
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, host } = window.location;
    const hostname = host.split(':')[0];
    if (!FORBIDDEN_HOSTS.includes(hostname)) {
      return `${protocol}//${host}/compromiso`;
    }
  }

  // 3. No valid URL available.
  return null;
}

/**
 * True when a valid public URL is ready to embed in a QR code.
 */
export function isQrConfigured(): boolean {
  return getCommitmentUrl() !== null;
}

/**
 * Returns a human-readable note about the QR target for verification.
 * Helps confirm the QR points to the correct environment.
 */
export function getQrTargetNote(): string | null {
  const url = getCommitmentUrl();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const isProduction = parsed.hostname.includes('workers.dev') || parsed.hostname.includes('.com');
    return isProduction
      ? `Producción: ${url}`
      : `Desarrollo (LAN): ${url} — compártelo con celulares en la misma red`;
  } catch {
    return url;
  }
}
