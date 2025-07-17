import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import AuthSidePanel from '../components/AuthSidePanel';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData, {
        withCredentials: true,
      });
      login(res.data.user);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="flex w-full max-w-5xl shadow-xl rounded-xl overflow-hidden">
        {/* Left - Form */}
        <div className="w-full md:w-2/3 p-8 bg-base-100">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-sm text-center mt-4">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="btn btn-link text-primary no-underline hover:underline"
            >
              Signup here
            </button>
          </div>

          <div className="text-sm text-center mt-2">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-gray-500 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Right - Auth Panel */}
        <AuthSidePanel />
      </div>
    </div>
  );
};

export default LoginPage;
