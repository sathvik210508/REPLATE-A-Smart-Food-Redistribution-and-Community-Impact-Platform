import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { NewDonationPage } from './pages/donor/NewDonationPage';
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TrackingPage } from './pages/tracking/TrackingPage';
import { ImpactPage } from './pages/impact/ImpactPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-replate-muted flex items-center justify-center text-xs text-replate-subtext">
        Validating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to user's natural dashboard
    if (user.role === 'donor') return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'ngo') return <Navigate to="/ngo/dashboard" replace />;
    if (user.role === 'volunteer') return <Navigate to="/volunteer/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/impact" element={<ImpactPage />} />

            {/* Donor Routes */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/donations/new"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <NewDonationPage />
                </ProtectedRoute>
              }
            />

            {/* NGO Routes */}
            <Route
              path="/ngo/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />

            {/* Volunteer Routes */}
            <Route
              path="/volunteer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Tracking (accessible to authenticated users) */}
            <Route
              path="/tracking/:id"
              element={
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
