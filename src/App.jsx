import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import MenuPage from './MenuPage';
import RestaurantsPage from './RestaurantsPage';
import ContactPage from './ContactPage';
import HowItWorksPage from './HowItWorksPage';
import FeaturesPage from './FeaturesPage';
import ReviewPage from './ReviewPage';
import AllReviewsPage from './AllReviewsPage';
import PricingPage from './PricingPage';
import MasterConsole from './master/MasterConsole';
import { OwnerAuthProvider } from './owner/OwnerAuthContext';
import OwnerLogin from './owner/OwnerLogin';
import OwnerSignup from './owner/OwnerSignup';
import OwnerDashboard from './owner/OwnerDashboard';
import OwnerProtectedRoute from './owner/OwnerProtectedRoute';
import CreateMenuPage from './owner/CreateMenuPage';

export default function App() {
  return (
    <BrowserRouter>
      <OwnerAuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/reviews" element={<AllReviewsPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<OwnerLogin />} />
          <Route path="/signup" element={<OwnerSignup />} />
          <Route
            path="/create-menu"
            element={(
              <OwnerProtectedRoute>
                <CreateMenuPage />
              </OwnerProtectedRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <OwnerProtectedRoute>
                <OwnerDashboard />
              </OwnerProtectedRoute>
            )}
          />
          <Route path="/menu" element={<Navigate to="/menu/brew-and-bites" replace />} />
          <Route path="/menu/:restaurantId" element={<MenuPage />} />
          <Route path="/menu/:restaurantId/review" element={<ReviewPage />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          {/* Master / root owner console — not linked from public nav */}
          <Route path="/gmc-console/*" element={<MasterConsole />} />
        </Routes>
      </OwnerAuthProvider>
    </BrowserRouter>
  );
}
