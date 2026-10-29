import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAdminSession } from '../auth/admin-api';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Protects administrative routes.
 * Verifies a real admin session against the Worker backend.
 * If no valid admin session exists, redirects to /login and preserves the
 * original destination so the user is sent back after authentication.
 */
export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAdminSession().then(setAuthenticated);
  }, []);

  // While checking, show nothing (no flash of admin content)
  if (authenticated === null) {
    return null;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
