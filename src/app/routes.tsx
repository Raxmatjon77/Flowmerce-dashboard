import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Users } from './pages/Users';
import { Orders } from './pages/Orders';
import { Inventory } from './pages/Inventory';
import { Payments } from './pages/Payments';
import { Shipments } from './pages/Shipments';
import { Notifications } from './pages/Notifications';
import { Health } from './pages/Health';
import { NotFound } from './pages/NotFound';

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Protected><Overview /></Protected>,
  },
  {
    path: '/users',
    element: <Protected><Users /></Protected>,
  },
  {
    path: '/orders',
    element: <Protected><Orders /></Protected>,
  },
  {
    path: '/inventory',
    element: <Protected><Inventory /></Protected>,
  },
  {
    path: '/payments',
    element: <Protected><Payments /></Protected>,
  },
  {
    path: '/shipments',
    element: <Protected><Shipments /></Protected>,
  },
  {
    path: '/notifications',
    element: <Protected><Notifications /></Protected>,
  },
  {
    path: '/health',
    element: <Protected><Health /></Protected>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
