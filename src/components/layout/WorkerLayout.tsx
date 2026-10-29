import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * WorkerLayout — used exclusively by /compromiso.
 *
 * Intentionally bare: no header, no footer, no nav, no admin links.
 * The page occupies the full viewport as a real mobile-first web page.
 * CommitmentPage handles its own internal layout and safe-area padding.
 */
export const WorkerLayout: React.FC = () => {
  return (
    <div className="min-h-[100dvh] min-h-screen bg-brand-light flex flex-col">
      <Outlet />
    </div>
  );
};
