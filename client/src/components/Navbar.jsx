import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">QuickTicket</Link>
      </div>
      <div className="flex gap-4 items-center">
        {!user ? (
          <>
            <Link to="/login" className="btn btn-sm btn-outline">Login</Link>
            <Link to="/signup" className="btn btn-sm btn-primary">Signup</Link>
          </>
        ) : (
          <>
            <span className="hidden sm:inline text-sm font-medium">Hi, {user.name}</span>
            <Link to="/settings" className="btn btn-sm btn-outline">Settings</Link>
            <button onClick={handleLogout} className="btn btn-sm btn-error">Logout</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
