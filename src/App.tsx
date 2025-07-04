import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Import ProtectedRoute component
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import FavoritesPage from './pages/FavoritesPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ImprintPage from './pages/ImprintPage';
import AdminPage from './pages/AdminPage'; // Import AdminPage
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById('page-top-content');
      const headerHeight = 80; // Behalten Sie Ihre geschätzte Header-Höhe bei

      if (element) {
        const elementRect = element.getBoundingClientRect();
        const scrollToPosition = elementRect.top + window.scrollY - headerHeight;

        window.scrollTo({ top: scrollToPosition, behavior: 'smooth' });
      }
    }, 100); // Behalten Sie die Verzögerung bei

    return () => clearTimeout(timer);
  }, [pathname]);

  return null; // This component doesn't render anything
}

function App() {
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              {/* Public Routes */}
              <Route path="register" element={<RegisterPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="/imprint" element={<ImprintPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="activities" element={<ActivitiesPage />} />
                <Route path="activities/:activityId" element={<ActivityDetailPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>
              
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />

            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;