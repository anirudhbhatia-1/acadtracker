import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import './index.css';

// Lazy load all page components for optimal bundle splitting (§6.3)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CourseSelection = lazy(() => import('./pages/CourseSelection'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Grades = lazy(() => import('./pages/Grades'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Predictor = lazy(() => import('./pages/Predictor'));
const Resources = lazy(() => import('./pages/Resources'));
const ScheduleSetup = lazy(() => import('./pages/ScheduleSetup'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CourseManager = lazy(() => import('./pages/CourseManager'));
const StudentDirectory = lazy(() => import('./pages/StudentDirectory'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const AdminAcademicCalendar = lazy(() => import('./pages/admin/AdminAcademicCalendar'));

const PageLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-ink dark:border-chalk-teal border-t-transparent animate-spin" />
      <span className="text-xs font-semibold text-text-muted">Loading space...</span>
    </div>
  </div>
);

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          success: {
            duration: 4000, // 4s auto-dismiss per design.md §6.6
            iconTheme: {
              primary: 'var(--status-safe)',
              secondary: '#fff',
            },
          },
          error: {
            duration: Infinity, // persistent-until-dismissed per design.md §6.6
            iconTheme: {
              primary: 'var(--status-critical)',
              secondary: '#fff',
            },
          },
        }}
      />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (Authenticated users) */}
          <Route element={<ProtectedRoute />}>
            {/* Onboarding is full-screen without sidebar per design.md §7.2 */}
            <Route path="/onboarding" element={<CourseSelection />} />
            
            {/* Main App Shell layout per design.md §5 */}
            <Route element={<AppLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/attendance" element={<Attendance />} />
              <Route path="/student/grades" element={<Grades />} />
              <Route path="/student/tasks" element={<Tasks />} />
              <Route path="/student/predictor" element={<Predictor />} />
              <Route path="/student/resources" element={<Resources />} />
              <Route path="/student/schedule" element={<ScheduleSetup />} />
            </Route>
          </Route>

          {/* Admin routes inside AppLayout */}
          <Route element={<AdminRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<CourseManager />} />
              <Route path="/admin/students" element={<StudentDirectory />} />
              <Route path="/admin/students/:id" element={<StudentProfile />} />
              <Route path="/admin/academic-calendar" element={<AdminAcademicCalendar />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
