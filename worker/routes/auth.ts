import { Env } from '../types/env';
import { setSessionCookie, clearSessionCookie } from '../middleware/auth';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

export function authRoutes(env: Env) {
  return {
    async POST(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === '/api/auth/login') {
        return handleLogin(request, env);
      }

      if (path === '/api/auth/logout') {
        return handleLogout(request);
      }

      return Response.json({ error: 'No encontrado' }, { status: 404 });
    },

    async GET(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === '/api/auth/session') {
        const cookieHeader = request.headers.get('cookie');
        const auth = await requireAdminSessionSafe(env, cookieHeader);
        return Response.json({ authenticated: auth.authorized }, { status: auth.authorized ? 200 : 401 });
      }

      return Response.json({ error: 'No encontrado' }, { status: 404 });
    },
  };
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const isSecure = request.url.startsWith('https://');

  if (!env.ADMIN_PASSWORD_HASH || !env.ADMIN_PASSWORD_SALT) {
    return Response.json(
      { error: 'Autenticación administrativa no configurada. Falta ADMIN_PASSWORD_HASH o ADMIN_PASSWORD_SALT.' },
      { status: 503 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Cuerpo de solicitud inválido.' }, { status: 400 });
  }

  const username = String(body.username ?? '').trim();
  const password = String(body.password ?? '');

  if (!username || !password) {
    return Response.json({ error: 'Usuario y contraseña son requeridos.' }, { status: 400 });
  }

  // Verificar contraseña usando Web Crypto PBKDF2
  const isValid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH, env.ADMIN_PASSWORD_SALT);

  if (!isValid) {
    return Response.json({ error: 'Credenciales inválidas.' }, { status: 401 });
  }

  // Crear token de sesión
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  try {
    await env.DB
      .prepare(
        `INSERT INTO admin_sessions (id, token_hash, expires_at, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(token, token, expiresAt.toISOString(), new Date().toISOString())
      .run();
  } catch {
    return Response.json({ error: 'No se pudo crear sesión.' }, { status: 500 });
  }

  const response = Response.json({ ok: true, username });
  response.headers.set('Set-Cookie', setSessionCookie(token, expiresAt, isSecure));
  return response;
}

function handleLogout(request: Request): Response {
  const isSecure = request.url.startsWith('https://');
  const response = Response.json({ ok: true });
  response.headers.set('Set-Cookie', clearSessionCookie(isSecure));
  return response;
}

async function requireAdminSessionSafe(env: Env, cookieHeader: string | null) {
  const token = cookieHeader?.match(/(?:^|;\s*)pei_admin_session=([^;]+)/)?.[1];
  if (!token) return { authorized: false };

  try {
    const session = await env.DB
      .prepare('SELECT * FROM admin_sessions WHERE token_hash = ? AND expires_at > ?')
      .bind(token, new Date().toISOString())
      .first();

    return { authorized: !!session };
  } catch {
    return { authorized: false };
  }
}

async function verifyPassword(
  password: string,
  hashB64: string,
  saltB64: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = base64ToBytes(saltB64);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const derivedHash = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));

    return derivedHash === hashB64;
  } catch {
    return false;
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  return Uint8Array.from(bin, (m) => m.charCodeAt(0));
}
