import React from 'react';
import { useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();

  // Hide on full ceremonial mural projection
  if (location.pathname === '/mural') {
    return null;
  }

  return null;
};
