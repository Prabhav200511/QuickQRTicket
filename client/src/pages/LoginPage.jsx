import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', form);
      login(res.data.user);
      navigate('/');
    } catch (err) {
      alert('Login failed');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="p-8 bg-base-100 shadow-xl rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">User Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" className="input input-bordered w-full" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" className="input input-bordered w-full" onChange={handleChange} />
          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
