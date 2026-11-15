import { Routes, Route, Navigate } from 'react-router-dom';
import { MasterAuthProvider } from './MasterAuthContext';
import MasterLogin from './MasterLogin';
import MasterSignup from './MasterSignup';
import MasterProtectedRoute from './MasterProtectedRoute';
import MasterDashboard from './MasterDashboard';

export default function MasterConsole() {
  return (
    <MasterAuthProvider>
      <Routes>
        <Route path="login" element={<MasterLogin />} />
        <Route path="signup" element={<MasterSignup />} />
        <Route
          index
          element={
            <MasterProtectedRoute>
              <MasterDashboard />
            </MasterProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/gmc-console/login" replace />} />
      </Routes>
    </MasterAuthProvider>
  );
}
