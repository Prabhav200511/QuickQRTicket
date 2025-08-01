import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';

  const API_BASE_URL = process.env.VITE_API_BASE_URL;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const goToDashboard = () => {
    if (user?.role === 'host') navigate('/dashboard/host');
    else if (user?.role === 'customer') navigate('/dashboard/customer');
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold text-primary">
          QuickTicket
        </Link>
      </div>

      <div className="flex-none gap-2 items-center">
        {/* Theme toggle (ensure logic implemented elsewhere) */}
        <label className="swap swap-rotate ml-2">
          <input type="checkbox" className="theme-controller" value="dark" />
          <svg
            className="swap-on fill-current w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M5.64 17.66A9 9 0 0012 21a9 9 0 000-18 9 9 0 00-6.36 15.66z" />
          </svg>
          <svg
            className="swap-off fill-current w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414M18.364 18.364l-1.414-1.414M6.05 6.05L4.636 7.464" />
          </svg>
        </label>

        {/* Customer links */}
        {user && user.role === 'customer' && (
          <>
            <Link to="/events" className="btn btn-ghost mx-1" aria-label="Browse Events">
              Browse Events
            </Link>
            <Link to="/my-tickets" className="btn btn-ghost mx-1" aria-label="My Tickets">
              My Tickets
            </Link>
          </>
        )}

        {/* Host links */}
        {user && user.role === 'host' && (
          <Link to="/host/scan" className="btn btn-ghost mx-1" aria-label="Scan Ticket">
            Scan Ticket
          </Link>
        )}

        {/* Authenticated user controls */}
        {user ? (
          <>
            <button
              className="btn btn-sm btn-outline ml-2"
              onClick={goToDashboard}
              aria-label="Go to Dashboard"
            >
              Dashboard
            </button>
            <Link to="/settings" className="btn btn-sm btn-outline ml-2" aria-label="Settings">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-error text-white ml-2"
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm btn-primary ml-2" aria-label="Login">
              Login
            </Link>
            <Link to="/signup" className="btn btn-sm btn-outline ml-2" aria-label="Signup">
              Signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
