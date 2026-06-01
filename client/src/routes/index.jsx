import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import DashboardLayout from '@/layouts/DashboardLayout';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Dashboard from '@/pages/dashboard/Dashboard';
import Inquiries from '@/pages/inquiries/Inquiries';
import Bookings from '@/pages/bookings/Bookings';
import Services from '@/pages/services/Services';
import Packages from '@/pages/packages/Packages';
import Gallery from '@/pages/gallery/Gallery';
import Analytics from '@/pages/analytics/Analytics';
import Notifications from '@/pages/notifications/Notifications';
import Settings from '@/pages/settings/Settings';
import NotFound from '@/pages/NotFound';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Auth Route wrapper (redirect if already logged in)
function AuthRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Router configuration
const router = createBrowserRouter([
  // Auth routes
  {
    path: '/login',
    element: (
      <AuthRoute>
        <Login />
      </AuthRoute>
    )
  },
  {
    path: '/signup',
    element: (
      <AuthRoute>
        <Signup />
      </AuthRoute>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <AuthRoute>
        <ForgotPassword />
      </AuthRoute>
    )
  },

  // Protected routes with layout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'inquiries', element: <Inquiries /> },
      { path: 'inquiries/:id', element: <Inquiries /> },
      { path: 'bookings', element: <Bookings /> },
      { path: 'services', element: <Services /> },
      { path: 'packages', element: <Packages /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'settings', element: <Settings /> }
    ]
  },

  // 404
  { path: '/404', element: <NotFound /> },

  // Fallback
  { path: '*', element: <Navigate to="/404" replace /> }
]);

export default function Router() {
  return <RouterProvider router={router} />;
}