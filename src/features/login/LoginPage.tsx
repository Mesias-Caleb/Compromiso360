import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { InstitutionalLogo } from '../../components/shared/InstitutionalLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { OFFICIAL_EVENT_CONFIG } from '../../config/event';

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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // After login, go to the page that was originally requested (default: /)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Ingresa tu usuario.');
      return;
    }
    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'Usuario o contraseña incorrectos.');
      }
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] min-h-screen bg-brand-light flex flex-col items-center justify-center px-4 py-10"
      style={{
        paddingTop: 'env(safe-area-inset-top, 2.5rem)',
        paddingBottom: 'env(safe-area-inset-bottom, 2.5rem)',
      }}
    >
      {/* Card */}
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header strip */}
        <div className="bg-brand-deep px-6 py-6 flex flex-col items-center text-center gap-3">
          <InstitutionalLogo variant="light" size="md" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-brand-gold tracking-widest uppercase">
              {OFFICIAL_EVENT_CONFIG.motto}
            </p>
            <p className="text-[11px] text-slate-300">
              Consola administrativa · {OFFICIAL_EVENT_CONFIG.eventName}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-7 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Usuario */}
            <div className="space-y-1.5">
              <label htmlFor="login-username" className="text-xs font-semibold text-brand-text">
                Usuario
              </label>
              <Input
                id="login-username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="admin"
                className="h-11"
                error={Boolean(error)}
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-brand-text">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  error={Boolean(error)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}

            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full font-bold min-h-[44px]"
            >
              {isLoading ? 'Verificando...' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>

        {/* Footer strip */}
        <div className="px-6 pb-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Solo para uso del equipo organizador</span>
        </div>
      </div>

      <p className="mt-6 text-[11px] text-slate-400 text-center max-w-xs">
        Los trabajadores acceden directamente a través del código QR proyectado en su sede,
        sin necesidad de este formulario.
      </p>
    </div>
  );
};
