// src/App.jsx
import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SettingsPage from './pages/SettingPage.jsx';

import HostDashboard from './pages/Dashboards/HostDashboard.jsx';
import CustomerDashboard from './pages/Dashboards/CustomerDashboard.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import ViewEventsPage from './pages/ViewEventsPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import MyTicketsPage from './pages/MyTicketsPage.jsx';
import ScanTicketPage from './pages/ScanTicketPage.jsx';
import HostEventsPage from './pages/HostEventsPage.jsx';

import { useAuth } from './context/AuthContext.jsx';

// Wrapper to require user logged in
const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login, save current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Wrapper to require user role
const RequireRole = ({ role, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // Optionally redirect unauthorized users to homepage or show 403 page
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { user } = useAuth();

  return (
    <div>
      <Toaster position="top-center" />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />

        {/* Host-only routes */}
        <Route
          path="/dashboard/host"
          element={
            <RequireRole role="host">
              <HostDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/dashboard/host/create"
          element={
            <RequireRole role="host">
              <CreateEventPage />
            </RequireRole>
          }
        />
        <Route
          path="/dashboard/host/events"
          element={
            <RequireRole role="host">
              <HostEventsPage />
            </RequireRole>
          }
        />
        <Route
          path="/host/scan"
          element={
            <RequireRole role="host">
              <ScanTicketPage />
            </RequireRole>
          }
        />

        {/* Customer-only routes */}
        <Route
          path="/dashboard/customer"
          element={
            <RequireRole role="customer">
              <CustomerDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/events"
          element={
            <RequireRole role="customer">
              <ViewEventsPage />
            </RequireRole>
          }
        />
        <Route
          path="/pay/:eventId"
          element={
            <RequireRole role="customer">
              <PaymentsPage />
            </RequireRole>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <RequireRole role="customer">
              <MyTicketsPage />
            </RequireRole>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
};

export default App;
