const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
}

export async function checkAdminSession(): Promise<boolean> {
  const response = await apiFetch('/api/auth/session');
  if (response.ok) {
    const data = await response.json().catch(() => ({}));
    return Boolean(data.authenticated);
  }
  return false;
}

export async function adminLogin(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (response.ok) {
    return { ok: true };
  }
  const data = await response.json().catch(() => ({ error: 'Error de autenticación.' }));
  return { ok: false, error: data.error || 'Error de autenticación.' };
}

export async function adminLogout(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' });
}
