import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PMDashboard from './pages/manager/PMDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import NotFoundPage from './components/NotFoundPage';

// Placeholder components
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <h2 className="text-2xl font-semibold text-surface-400">{title} - Coming Soon</h2>
  </div>
);

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null; // Let the ProtectedRoute or main handle initial loading spinner

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<PlaceholderPage title="Users Management" />} />
        <Route path="projects" element={<PlaceholderPage title="All Projects" />} />
      </Route>

      {/* Protected PM Routes */}
      <Route path="/manager" element={<ProtectedRoute allowedRoles={['pm']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PMDashboard />} />
        <Route path="projects" element={<PlaceholderPage title="My Projects" />} />
        <Route path="tasks" element={<PlaceholderPage title="Project Tasks" />} />
      </Route>

      {/* Protected Member Routes */}
      <Route path="/member" element={<ProtectedRoute allowedRoles={['member']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<MemberDashboard />} />
        <Route path="tasks" element={<PlaceholderPage title="My Tasks" />} />
      </Route>

      {/* Shared Protected Routes under a separate layout or within dashboards? */}
      {/* We'll use a wrapper route for shared stuff, reusing DashboardLayout if they have a role */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile Settings" />} />
      </Route>

      {/* Root Redirect */}
      <Route path="/" element={
        !isAuthenticated ? <Navigate to="/login" replace /> :
        user?.role === 'admin' ? <Navigate to="/admin" replace /> :
        user?.role === 'pm' ? <Navigate to="/manager" replace /> :
        <Navigate to="/member" replace />
      } />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
