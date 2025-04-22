import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import store from './redux/store';
import { checkAuth } from './redux/authSlice';
import { fetchSavedArticles, fetchArticleMetadata } from './redux/articleSlice';
import { Toaster } from 'react-hot-toast';

import DashboardPage from './pages/user/Home/Home';
import LoginPage from './pages/user/Login/LoginPage';
import SignUpPage from './pages/user/SignUp/SignUpPage';
import EmailVerificationPage from './pages/user/EmailVerification/EmailVerificationPage';
import ForgotPasswordPage from './pages/user/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from './pages/user/ResetPassword/ResetPasswordPage';
import InterestSelection from './pages/user/InterestsSelection/InterestSelection';
import SavedArticles from './pages/user/SavedArticles/SavedArticles';
import Profile from './pages/user/Profile/Profile';
import Settings from './pages/user/Settings/Settings';
import Article from './pages/user/Article/Article';
import LoadingSpinner from './components/auth/LoadingSpinner';
import OnboardingGuard from './components/user/OnboardingGuard';
import LanguageSelection from './pages/user/LanguageSelection/LanguageSelection';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard';
import UserManagement from './pages/admin/UserManagement/UserManagement';
import ContentManagement from './pages/admin/Content/ContentManagement';
import AdminAnalytics from './pages/admin/Analytics/AdminAnalytics';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const dispatch = useDispatch();
  const { isCheckingAuth } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchSavedArticles());
      dispatch(fetchArticleMetadata());
    }
  }, [dispatch, user]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <>
      
      <main className="flex-grow relative z-10 min-h-screen flex flex-col bg-neutral-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          } />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          } />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          {/* Onboarding routes */}
          <Route path="/select-language" element={<LanguageSelection />} />
          <Route path="/select-interests" element={<InterestSelection />} />
          {/* Main app routes, protected and onboarding-guarded */}
          <Route element={<OnboardingGuard />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/saved" element={
              <ProtectedRoute>
                <SavedArticles />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/article/:id" element={
              <ProtectedRoute>
                <Article />
              </ProtectedRoute>
            } />
          </Route>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <div style={{ background: 'none' }} className="bg-neutral-50 min-h-screen">
        <AppContent />
        <Toaster />
      </div>
    </Provider>
  );
}

export default App;