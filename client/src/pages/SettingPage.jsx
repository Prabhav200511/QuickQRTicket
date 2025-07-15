import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) return alert('Name cannot be empty.');

    try {
      setLoading(true);
      const res = await axios.put('/api/auth/update-profile', { name });
      login(res.data.user); // update context
      alert('Profile updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="form-control">
        <label className="label">Email</label>
        <input className="input input-bordered" type="email" value={user?.email} readOnly />
      </div>
      <div className="form-control">
        <label className="label">Name</label>
        <input
          className="input input-bordered"
          placeholder={user?.name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <button onClick={handleUpdate} className="btn btn-primary" disabled={loading}>
        {loading ? 'Updating...' : 'Update Name'}
      </button>
    </div>
  );
};

export default SettingsPage;
