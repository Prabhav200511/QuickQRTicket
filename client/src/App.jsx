import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import HomePage from './pages/HomePage.jsx';
import { useAuth } from './context/AuthContext.jsx'; // ✅ updated
import SettingsPage from './pages/SettingPage.jsx';
import { Toaster } from 'react-hot-toast';
import HostDashboard from './pages/hostDashboard.jsx';
import CustomerDashboard from './pages/customerDashboard.jsx';

const App = () => {
  const { user } = useAuth(); // ✅ fixed

  return (
    <div>
      <Toaster position="top-center" />
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dashboard/host" element={<HostDashboard />} />
        <Route path="/dashboard/customer" element={<CustomerDashboard />} />
      </Routes>
    </div>
  );
};

export default App;
