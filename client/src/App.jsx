// Rewrite/client/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import TermsAndConditions from './components/TermsAndConditions';
// Layout Components
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import LoadingSpinner from './components/Common/LoadingSpinner.jsx';

// Page Components (Lazy Loaded)
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage.jsx'));
const SignupPage = lazy(() => import('./pages/Auth/SignupPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const ExplorePage = lazy(() => import('./pages/Explore/ExplorePage.jsx'));
const ExploreArticleDetailPage = lazy(() => import('./pages/Explore/ExploreArticleDetailPage.jsx'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage.jsx'));
const ReadPageArticleView = lazy(() => import('./components/Content/ReadPageArticleView.jsx'));
// NEW Pages for Verification and Password Reset
const VerifyEmailPage = lazy(() => import('./pages/Auth/VerifyEmailPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage.jsx'));


function ProtectedRoute({ children, adminOnly = false }) { /* ... (same as before) ... */
  const { user, loading } = useAuth(); if (loading) return <LoadingSpinner />; if (!user) return <Navigate to="/login" replace />; if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />; return children;
}

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/explore/:articleId" element={<ReadPageArticleView />} />
            <Route path="/read/:articleId" element={<ReadPageArticleView />} /> {/* Consolidated view */}

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/terms" element={<TermsAndConditions />} />
            {/* Profile Route */}
            <Route path="/profile/:username/*" element={<ProfilePage />} />

            {/* Admin Route */}
            <Route path="/admin/dashboard/*" element={ <ProtectedRoute adminOnly={true}> <AdminDashboardPage /> </ProtectedRoute> } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default App;