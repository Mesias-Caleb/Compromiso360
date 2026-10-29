import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QrCode, Compass, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';
import { InstitutionalLogo } from './InstitutionalLogo';

export const Header: React.FC = () => {
  const location = useLocation();

  // On the ceremonial mural page, the projection provides its own ceremonial header
  if (location.pathname === '/mural') {
    return null;
  }

  const navLinks = [
    { to: '/', label: 'Inicio', icon: QrCode },
    { to: '/mural', label: 'Mural en Vivo', icon: Compass },
    { to: '/admin', label: 'Administración', icon: LayoutGrid },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white shadow-subtle">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <InstitutionalLogo
            variant="dark"
            size="md"
          />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-brand-deep text-white shadow-sm'
                    : 'text-brand-muted hover:text-brand-text hover:bg-slate-100',
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-brand-gold' : 'text-brand-muted')} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
