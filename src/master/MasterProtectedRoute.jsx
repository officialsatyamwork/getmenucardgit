import { Navigate, useLocation } from 'react-router-dom';
import { useMasterAuth } from './MasterAuthContext';

export default function MasterProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useMasterAuth();
  const location = useLocation();

  if (loading) {
    return <div className="ma-loading">Loading console…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/gmc-console/login" replace state={{ from: location }} />;
  }

  return children;
}
