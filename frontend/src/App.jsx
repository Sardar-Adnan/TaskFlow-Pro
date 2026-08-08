import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PMDashboard from './pages/manager/PMDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import NotFoundPage from './components/NotFoundPage';

import UserManagement from './pages/admin/UserManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import ProjectDetail from './pages/admin/ProjectDetail';

import PMProjects from './pages/manager/PMProjects';
import PMProjectDetail from './pages/manager/PMProjectDetail';
import PMTasks from './pages/manager/PMTasks';

import MemberTasks from './pages/member/MemberTasks';

import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage from './pages/shared/ProfilePage';
import SearchPage from './pages/shared/SearchPage';

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
        <Route path="users" element={<UserManagement />} />
        <Route path="projects" element={<ProjectManagement />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
      </Route>

      {/* Protected PM Routes */}
      <Route path="/manager" element={<ProtectedRoute allowedRoles={['pm']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PMDashboard />} />
        <Route path="projects" element={<PMProjects />} />
        <Route path="projects/:id" element={<PMProjectDetail />} />
        <Route path="tasks" element={<PMTasks />} />
      </Route>

      {/* Protected Member Routes */}
      <Route path="/member" element={<ProtectedRoute allowedRoles={['member']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<MemberDashboard />} />
        <Route path="tasks" element={<MemberTasks />} />
      </Route>

      {/* Shared Protected Routes under a separate layout or within dashboards? */}
      {/* We'll use a wrapper route for shared stuff, reusing DashboardLayout if they have a role */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
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
