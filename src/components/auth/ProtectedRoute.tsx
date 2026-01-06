import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "admin" | "vendor" | "buyer" | "super_admin";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: AppRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, loading, roles, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super admin bypasses all role restrictions
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user has any of the required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => roles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
