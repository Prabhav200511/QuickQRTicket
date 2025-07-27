import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import AuthSidePanel from '../components/AuthSidePanel';

  const API_BASE_URL = import.meta.env.NODE_ENV==="production"? '/' : 'http://localhost:5000';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = ({ target: { name, value } }) => setForm({ ...form, [name]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, form, { withCredentials: true });
      login(res.data.user);
      toast.success('Signup successful!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="flex w-full max-w-5xl shadow-xl rounded-xl overflow-hidden">
        {/* Form Section */}
        <div className="w-full md:w-2/3 p-8 bg-base-100">
          <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
            <input
              name="name"
              type="text"
              placeholder="Name"
              className="input input-bordered w-full"
              onChange={handleChange}
              value={form.name}
              required
              disabled={loading}
              aria-label="Name"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              onChange={handleChange}
              value={form.email}
              required
              disabled={loading}
              aria-label="Email"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              onChange={handleChange}
              value={form.password}
              required
              disabled={loading}
              aria-label="Password"
            />
            <select
              name="role"
              className="select select-bordered w-full"
              onChange={handleChange}
              value={form.role}
              required
              disabled={loading}
              aria-label="Select role"
            >
              <option value="customer">Customer</option>
              <option value="host">Host</option>
            </select>
            <button type="submit" className="btn btn-primary w-full" disabled={loading} aria-disabled={loading}>
              {loading ? 'Signing up...' : 'Signup'}
            </button>
          </form>
          <p className="text-sm text-center mt-4">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="btn btn-link text-primary no-underline hover:underline"
              disabled={loading}
              aria-label="Go to Login"
            >
              Login here
            </button>
          </p>
        </div>

        {/* Right Side Panel */}
        <AuthSidePanel />
      </div>
    </div>
  );
};

export default SignupPage;
