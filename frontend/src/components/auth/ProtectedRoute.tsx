import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../../stores/authStore';

interface Props {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/** Protect a route - redirect to home if not authenticated or wrong role */
export const ProtectedRoute: React.FC<Props> = ({ allowedRoles, redirectTo = '/' }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
};
