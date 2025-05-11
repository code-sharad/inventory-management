import { Navigate, Outlet } from "react-router";
import { useUser } from "../contexts/UserContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useUser();

  // If authentication is required and not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user does not have it, redirect
  if (requiredRole && user?.user?.role !== requiredRole) {
    return <Navigate to="/inventory" replace />;
  }

  // If user is authenticated and tries to access login, redirect based on role
  if (!requireAuth && isAuthenticated) {
    if (user?.user?.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/inventory" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
