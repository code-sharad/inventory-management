import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: User['role'] | User['role'][];
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  requireEmailVerification = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while determining auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated and tries to access auth pages (login, register)
  if (!requireAuth && isAuthenticated) {
    // Redirect based on role
    if (user?.role === 'admin') {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/inventory" replace />;
    }
  }

  // If email verification is required and user's email is not verified
  if (requireEmailVerification && user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // If a specific role is required
  if (requiredRole && user) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user's actual role
      if (user.role === 'admin') {
        return <Navigate to="/" replace />;
      } else {
        return <Navigate to="/inventory" replace />;
      }
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
