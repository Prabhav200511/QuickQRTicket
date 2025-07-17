import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import AuthSidePanel from '../components/AuthSidePanel';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/signup', form, { withCredentials: true });
      login(res.data.user);
      toast.success('Signup successful!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="flex w-full max-w-5xl shadow-xl rounded-xl overflow-hidden">
        {/* Form Section */}
        <div className="w-full md:w-2/3 p-8 bg-base-100">
          <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Name"
              className="input input-bordered w-full"
              onChange={handleChange}
              value={form.name}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              onChange={handleChange}
              value={form.email}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              onChange={handleChange}
              value={form.password}
              required
            />
            <select
              name="role"
              className="select select-bordered w-full"
              onChange={handleChange}
              value={form.role}
              required
            >
              <option value="customer">Customer</option>
              <option value="host">Host</option>
            </select>
            <button type="submit" className="btn btn-primary w-full">Signup</button>
          </form>
          <p className="text-sm text-center mt-4">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="btn btn-link text-primary no-underline hover:underline">
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
