import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Spinner';
import { ROUTES } from '../utils/constants';

/**
 * PrivateRoute — redirects to /login if user is not authenticated
 * Preserves the intended destination so we can redirect back after login
 */
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Still checking auth state — show loader instead of flashing redirect
  if (loading) return <PageLoader />;

  if (!currentUser) {
    // Save where user was trying to go
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;