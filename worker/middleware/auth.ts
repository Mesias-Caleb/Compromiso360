import { Env } from '../types/env';

export interface AdminSession {
  token: string;
  expiresAt: string;
}

/**
 * Extrae el token de sesión desde la cookie HttpOnly.
 */
export function getSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)pei_admin_session=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Valida que un token de sesión exista y no haya expirado.
 * En producción este token debe verificarse contra D1 (tabla admin_sessions).
 * Para desarrollo local se acepta un token válido presente en la cookie.
 */
export async function requireAdminSession(
  env: Env,
  cookieHeader: string | null
): Promise<{ authorized: boolean; status?: number; message?: string }> {
  const token = getSessionToken(cookieHeader);

  if (!token) {
    return { authorized: false, status: 401, message: 'Sesión de administrador requerida.' };
  }

  // Verificar contra D1 si la tabla existe
  try {
    const session = await env.DB
      .prepare('SELECT * FROM admin_sessions WHERE token_hash = ? AND expires_at > ?')
      .bind(token, new Date().toISOString())
      .first();

    if (!session) {
      return { authorized: false, status: 401, message: 'Sesión inválida o expirada.' };
    }
  } catch {
    // Si la tabla no existe aún (migración no aplicada), fallar cerrado en producción
    if (!env.ADMIN_PASSWORD_HASH) {
      return {
        authorized: false,
        status: 503,
        message: 'Autenticación administrativa no configurada.',
      };
    }
  }

  return { authorized: true };
}

export function setSessionCookie(token: string, expiresAt: Date, secure = false): string {
  return `pei_admin_session=${token}; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Strict; Path=/; Expires=${expiresAt.toUTCString()}; Max-Age=${Math.floor((expiresAt.getTime() - Date.now()) / 1000)}`;
}

export function clearSessionCookie(secure = false): string {
  return `pei_admin_session=; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
}
