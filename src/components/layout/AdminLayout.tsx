import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  QrCode,
  Compass,
  LayoutGrid,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InstitutionalLogo } from '../shared/InstitutionalLogo';
import { DemoBanner } from '../shared/DemoBanner';
import { Footer } from '../shared/Footer';
import { checkAdminSession, adminLogout } from '../../auth/admin-api';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const navLinks = [
    { to: '/', label: 'Control del evento', icon: QrCode },
    { to: '/mural', label: 'Mural en Vivo', icon: Compass, newTab: true },
    { to: '/admin', label: 'Administración', icon: LayoutGrid },
  ];

  useEffect(() => {
    checkAdminSession().then((ok) => {
      setAuthenticated(ok);
      if (!ok) {
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    setAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const handleOpenWorkerPreview = () => {
    window.open('/compromiso', '_blank', 'noopener,noreferrer');
  };

  const handleOpenMural = () => {
    window.open('/mural', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-light text-brand-text">
      <DemoBanner />

      <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <InstitutionalLogo variant="dark" size="md" />
          </Link>

          {/* Admin Nav */}
          <nav className="flex items-center gap-1" aria-label="Navegación administrativa">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              const handleClick = link.newTab
                ? (e: React.MouseEvent) => { e.preventDefault(); handleOpenMural(); }
                : undefined;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleClick}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all',
                    isActive && !link.newTab
                      ? 'bg-brand-deep text-white shadow-sm'
                      : 'text-brand-muted hover:text-brand-text hover:bg-slate-100',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4',
                      isActive && !link.newTab ? 'text-brand-gold' : 'text-brand-muted',
                    )}
                  />
                  <span className="hidden sm:inline">{link.label}</span>
                  {link.newTab && <ExternalLink className="w-3 h-3 opacity-50" />}
                </Link>
              );
            })}

            {/* Preview worker view */}
            <button
              type="button"
              onClick={handleOpenWorkerPreview}
              title="Abrir vista previa del formulario del trabajador en pestaña nueva"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all text-brand-muted hover:text-brand-text hover:bg-slate-100"
            >
              <ExternalLink className="w-4 h-4 text-brand-muted" />
              <span className="hidden sm:inline">Vista previa</span>
            </button>

            {/* Divider */}
            <span className="w-px h-6 bg-slate-200 mx-1" />

            {/* Session info + logout */}
            <div className="flex items-center gap-2">
              {authenticated && (
                <span className="hidden md:inline text-[11px] text-brand-muted font-medium">
                  Administrador
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión administrativa"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
