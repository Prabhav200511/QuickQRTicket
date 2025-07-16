import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ChangePasswordViaOTP from '../components/ChangePasswordViaOTP';

const SettingsPage = () => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name cannot be empty.');

    try {
      setLoading(true);
      const res = await axios.put('/api/auth/update-profile', { name });
      login(res.data.user); // Update global auth context
      alert('Profile name updated successfully.');
    } catch (err) {
      console.error('Update name error:', err);
      alert('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-10 text-center text-lg text-error">
        You must be logged in to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-8 bg-base-100 shadow-xl rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">⚙️ Account Settings</h1>

      {/* 1. View and edit name */}
      <form onSubmit={handleUpdateName} className="space-y-4">
        <div>
          <label className="label font-semibold">Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="label font-semibold">Email (read-only)</label>
          <input
            type="email"
            className="input input-bordered w-full bg-base-200 cursor-not-allowed"
            value={user.email}
            readOnly
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
        >
          {loading ? 'Saving...' : 'Update Name'}
        </button>
      </form>

      {/* 2. Password change via OTP */}
      <ChangePasswordViaOTP />
    </div>
  );
};

export default SettingsPage;
