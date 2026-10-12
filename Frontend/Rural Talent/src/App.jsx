import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Employer Pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import CreateTaskPage from './pages/employer/CreateTaskPage';
import TaskDetailsPage from './pages/employer/TaskDetailsPage';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerExecutionPage from './pages/worker/WorkerExecutionPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerManagementPage from './pages/admin/WorkerManagementPage';
import QAManagementPage from './pages/admin/QAManagementPage';
import TaskAllocationPage from './pages/admin/TaskAllocationPage';
import PaymentsPage from './pages/admin/PaymentsPage';

// Common
import ProfilePage from './pages/common/ProfilePage';

// Helper Root Redirector
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'EMPLOYER') return <Navigate to="/employer/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/worker/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Common */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* EMPLOYER ROUTES */}
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/tasks"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/create-task"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                  <CreateTaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/tasks/:id"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                  <TaskDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* WORKER ROUTES */}
            <Route
              path="/worker/dashboard"
              element={
                <ProtectedRoute allowedRoles={['WORKER', 'ADMIN']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/assignments"
              element={
                <ProtectedRoute allowedRoles={['WORKER', 'ADMIN']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={['WORKER', 'ADMIN']}>
                  <WorkerExecutionPage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TaskAllocationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/workers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <WorkerManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/qa"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <QAManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
