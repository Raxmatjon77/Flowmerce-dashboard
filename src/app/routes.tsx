import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RouteErrorFallback } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Users } from './pages/Users';
import { Orders } from './pages/Orders';
import { Inventory } from './pages/Inventory';
import { Payments } from './pages/Payments';
import { Shipments } from './pages/Shipments';
import { Notifications } from './pages/Notifications';
import { Health } from './pages/Health';
import { Support } from './pages/Support';
import { SupportThread } from './pages/SupportThread';
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
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/',
    element: <Protected><Overview /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/users',
    element: <Protected><Users /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/orders',
    element: <Protected><Orders /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/inventory',
    element: <Protected><Inventory /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/payments',
    element: <Protected><Payments /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/shipments',
    element: <Protected><Shipments /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/notifications',
    element: <Protected><Notifications /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/health',
    element: <Protected><Health /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/support',
    element: <Protected><Support /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/support/:id',
    element: <Protected><SupportThread /></Protected>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <RouteErrorFallback />,
  },
]);
