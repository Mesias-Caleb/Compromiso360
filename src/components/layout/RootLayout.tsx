import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { DemoBanner } from '../shared/DemoBanner';
import { cn } from '../../lib/utils';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const isMural = location.pathname === '/mural';

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col transition-colors',
        isMural ? 'bg-brand-deep text-white' : 'bg-brand-light text-brand-text',
      )}
    >
      <DemoBanner />
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
