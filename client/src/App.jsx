import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import HomePage from './pages/HomePage.jsx';
import { useAuth } from './context/AuthContext.jsx'; 
import SettingsPage from './pages/SettingPage.jsx';
import { Toaster } from 'react-hot-toast';
import HostDashboard from './pages/Dashboards/HostDashboard.jsx';
import CustomerDashboard from './pages/Dashboards/CustomerDashboard.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import ViewEventsPage from './pages/ViewEventsPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import MyTicketsPage from './pages/MyTicketsPage';
import ScanTicketPage from './pages/ScanTicketPage.jsx';
import HostEventsPage from './pages/HostEventsPage.jsx';


const App = () => {
  const { user } = useAuth(); 

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
        <Route path="/dashboard/host/create" element={<CreateEventPage />} />
        <Route path="/events" element={<ViewEventsPage />} />
        <Route path="/pay/:eventId" element={<PaymentsPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
        <Route path="/host/scan" element={<ScanTicketPage />} />
        <Route path="/dashboard/host/events" element={<HostEventsPage />} />
      </Routes>
    </div>
  );
};

export default App;
