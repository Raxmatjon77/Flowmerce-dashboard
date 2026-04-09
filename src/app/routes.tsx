import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './pages/Overview';
import { Users } from './pages/Users';
import { Orders } from './pages/Orders';
import { Inventory } from './pages/Inventory';
import { Payments } from './pages/Payments';
import { Shipments } from './pages/Shipments';
import { Notifications } from './pages/Notifications';
import { Health } from './pages/Health';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout><Overview /></DashboardLayout>,
  },
  {
    path: '/users',
    element: <DashboardLayout><Users /></DashboardLayout>,
  },
  {
    path: '/orders',
    element: <DashboardLayout><Orders /></DashboardLayout>,
  },
  {
    path: '/inventory',
    element: <DashboardLayout><Inventory /></DashboardLayout>,
  },
  {
    path: '/payments',
    element: <DashboardLayout><Payments /></DashboardLayout>,
  },
  {
    path: '/shipments',
    element: <DashboardLayout><Shipments /></DashboardLayout>,
  },
  {
    path: '/notifications',
    element: <DashboardLayout><Notifications /></DashboardLayout>,
  },
  {
    path: '/health',
    element: <DashboardLayout><Health /></DashboardLayout>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);