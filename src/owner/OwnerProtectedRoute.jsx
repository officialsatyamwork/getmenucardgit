import { Navigate, useLocation } from 'react-router-dom';
import { useOwnerAuth } from './OwnerAuthContext';

export default function OwnerProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useOwnerAuth();
  const location = useLocation();

  if (loading) {
    return <div className="oa-loading">Loading</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
