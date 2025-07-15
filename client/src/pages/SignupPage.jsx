import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/signup', form);
      login(res.data.user);
      navigate('/');
    } catch (err) {
      alert('Signup failed');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="p-8 bg-base-100 shadow-xl rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">User Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" type="text" placeholder="Name" className="input input-bordered w-full" onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" className="input input-bordered w-full" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" className="input input-bordered w-full" onChange={handleChange} />
          <button type="submit" className="btn btn-primary w-full">Signup</button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
