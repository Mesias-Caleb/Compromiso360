import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { AdminLayout } from '../../components/layout/AdminLayout';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { CeremonyLayout } from '../../components/layout/CeremonyLayout';

// Guards
import { AdminRouteGuard } from '../../guards/AdminRouteGuard';

// Pages
import { AccessCodePage } from '../../features/access/AccessCodePage';
import { CommitmentPage } from '../../features/commitment/CommitmentPage';
import { MuralPage } from '../../features/mural/MuralPage';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { LoginPage } from '../../features/login/LoginPage';

export const router = createBrowserRouter([
  // ─── Public login (no layout wrapper) ───────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ─── Worker flow: /compromiso — no admin chrome ──────────────────────────────
  {
    path: '/compromiso',
    element: <WorkerLayout />,
    children: [
      {
        index: true,
        element: <CommitmentPage />,
      },
    ],
  },

  // ─── Ceremony projection: /mural — full-screen dark canvas ──────────────────
  {
    path: '/mural',
    element: <CeremonyLayout />,
    children: [
      {
        index: true,
        element: <MuralPage />,
      },
    ],
  },

  // ─── Admin area: requires authenticated session ──────────────────────────────
  {
    path: '/',
    element: (
      <AdminRouteGuard>
        <AdminLayout />
      </AdminRouteGuard>
    ),
    children: [
      {
        index: true,
        element: <AccessCodePage />,
      },
      {
        path: 'admin',
        element: <DashboardPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
