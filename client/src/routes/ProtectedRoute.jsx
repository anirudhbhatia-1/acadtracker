import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading your academic space...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If student is not yet onboarded, force them to onboarding unless they are already on the onboarding page
  if (user && user.role === 'STUDENT' && !user.isOnboarded) {
    if (location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // If student is already onboarded and tries to access /onboarding again, send them to dashboard
  if (user && user.isOnboarded && location.pathname === '/onboarding') {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
