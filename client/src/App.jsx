import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseSelection from './pages/CourseSelection';
import StudentDashboard from './pages/StudentDashboard';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Tasks from './pages/Tasks';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import './index.css';

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
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
          },
        }}
      />
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes (Authenticated users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<CourseSelection />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<Attendance />} />
          <Route path="/student/grades" element={<Grades />} />
          <Route path="/student/tasks" element={<Tasks />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
