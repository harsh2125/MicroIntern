import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Spinner';
import { ROUTES } from '../utils/constants';

/**
 * RoleRoute — only allows users with a specific role
 * e.g. <RoleRoute role="company"> wraps company-only pages
 * Redirects to home if user has wrong role
 */
function RoleRoute({ children, role }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <PageLoader />;

  // Not logged in at all
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Logged in but wrong role
  if (userProfile?.role !== role) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
}

export default RoleRoute;