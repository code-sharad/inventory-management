
import { Navigate, Outlet } from "react-router";
import { useUser } from "../contexts/UserContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated } = useUser();

  if (requireAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect to home if authentication is not required but user is authenticated
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
