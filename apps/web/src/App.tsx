import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './lib/AppContext';
import type { Role } from './lib/types';
import { dashboardPathFor } from './lib/roles';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import DashboardPage from './pages/DashboardPage';
import ProviderPage from './pages/ProviderPage';
import AdminPage from './pages/AdminPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AuthPage from './pages/AuthPage';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import BookingDrawer from './components/BookingDrawer';
import Toast from './components/Toast';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useApp();
  const location = useLocation();
  if (initializing) return <div className="route-loading">Loading your workspace…</div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}

function RoleGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useApp();
  if (!user) return null;
  if (!roles.includes(user.role)) return <Navigate to={dashboardPathFor(user.role)} replace />;
  return children;
}

function WorkspaceHome() {
  const { user } = useApp();
  return user ? <Navigate to={dashboardPathFor(user.role)} replace /> : null;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage />} />
        </Route>
        <Route path="app" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index element={<WorkspaceHome />} />
          <Route path="customer" element={<RoleGate roles={['customer']}><DashboardPage /></RoleGate>} />
          <Route path="appointments" element={<RoleGate roles={['customer']}><AppointmentsPage /></RoleGate>} />
          <Route path="provider" element={<RoleGate roles={['provider']}><ProviderPage /></RoleGate>} />
          <Route path="admin" element={<RoleGate roles={['admin']}><AdminPage /></RoleGate>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BookingDrawer />
      <Toast />
    </AppProvider>
  );
}
