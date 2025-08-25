
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

/**
 * Component that protects routes requiring authentication
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // If still initializing, show loading indicator
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState fullScreen={true} />
      </div>
    );
  }

  // If authentication is required but user is not authenticated,
  // redirect to login page and save the attempted location
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route is only for non-authenticated users (like login page) but user is authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Return children if all conditions are satisfied
  return <>{children}</>;
};

export default ProtectedRoute;
