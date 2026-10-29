import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * CeremonyLayout — used exclusively by /mural.
 *
 * Full-screen dark canvas optimised for projection on large screens.
 * No navigation chrome. MuralPage handles its own five ceremonial modes.
 */
export const CeremonyLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-brand-deep text-white flex flex-col overflow-hidden">
      <Outlet />
    </div>
  );
};
