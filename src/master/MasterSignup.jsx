import { Navigate } from 'react-router-dom';

/** Signup is disabled — master credentials live in backend/.env */
export default function MasterSignup() {
  return <Navigate to="/gmc-console/login" replace />;
}
