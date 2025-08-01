import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ChangePasswordViaOTP from '../components/ChangePasswordViaOTP';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

  const API_BASE_URL = process.env.VITE_API_BASE_URL;

const SettingsPage = () => {
  const { user, login, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(`/api/auth/update-profile`, { name });
      login(res.data.user);
      toast.success('Profile name updated successfully.');
    } catch (err) {
      console.error('Update name error:', err);
      toast.error('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast(
      (t) => (
        <div className="text-sm">
          <p className="font-medium">Are you sure?</p>
          <div className="mt-2 flex gap-2 justify-end">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setDeleteLoading(true);
                  await axios.delete(`${API_BASE_URL}/api/auth/delete-account`);
                  logout();
                  toast.success('Account deleted.');
                  navigate('/signup');
                } catch (err) {
                  console.error('Delete account error:', err);
                  toast.error('Failed to delete account.');
                } finally {
                  setDeleteLoading(false);
                }
              }}
              className="btn btn-sm btn-error btn-outline"
            >
              Yes, Delete
            </button>
            <button onClick={() => toast.dismiss(t.id)} className="btn btn-sm">
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
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

      <ThemeToggle />

      {/* 1. Edit profile name */}
      <form onSubmit={handleUpdateName} className="space-y-4">
        <div>
          <label className="label font-semibold">Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            aria-label="Profile name"
          />
        </div>

        <div>
          <label className="label font-semibold">Email (read-only)</label>
          <input
            type="email"
            className="input input-bordered w-full bg-base-200 cursor-not-allowed"
            value={user?.email || ''}
            readOnly
            aria-label="Email address"
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Saving...' : 'Update Name'}
        </button>
      </form>

      {/* 2. Change password via OTP */}
      <div className="mt-8">
        <ChangePasswordViaOTP />
      </div>

      {/* 3. Delete Account */}
      <div className="mt-8 text-center">
        <button
          onClick={handleDeleteAccount}
          className={`btn btn-error btn-outline w-full ${deleteLoading ? 'btn-disabled' : ''}`}
          disabled={deleteLoading}
        >
          {deleteLoading ? 'Deleting...' : 'Delete Account'}
        </button>
        <p className="text-xs text-gray-500 mt-2">Warning: This action is permanent.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
