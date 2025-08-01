import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateEventPage = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    time: '',
    end_time: '',
    capacity: '',
    price: '',
  });

  const navigate = useNavigate();
  const API_BASE_URL = process.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'time') {
      const newStart = new Date(value);
      const currentEnd = new Date(form.end_time);
      if (form.end_time && newStart >= currentEnd) {
        setForm({ ...form, time: value, end_time: value });
      } else {
        setForm({ ...form, time: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const start = new Date(form.time);
    const end = new Date(form.end_time);
    const now = new Date();

    if (end <= start) {
      toast.error('End time must be after start time!');
      return;
    }

    if (start <= now) {
      toast.error('Start time must be in the future!');
      return;
    }

    if (Number(form.capacity) < 1) {
      toast.error('Capacity must be at least 1');
      return;
    }

    if (Number(form.price) < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    try {
      await axios.post(
        `/api/events/create`,
        {
          ...form,
          capacity: Number(form.capacity),
          price: Number(form.price),
        },
        { withCredentials: true }
      );
      toast.success('Event created successfully!');
      navigate('/dashboard/host');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error creating event');
    }
  };

  const nowISO = new Date().toISOString().slice(0, 16);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-6">
      <div className="bg-base-100 p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Event Name"
            className="input input-bordered w-full"
            onChange={handleChange}
            value={form.name}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="textarea textarea-bordered w-full"
            onChange={handleChange}
            value={form.description}
            required
          />
          <input
            name="time"
            type="datetime-local"
            min={nowISO}
            className="input input-bordered w-full"
            onChange={handleChange}
            value={form.time}
            required
          />
          <input
            name="end_time"
            type="datetime-local"
            min={form.time || nowISO}
            className="input input-bordered w-full"
            onChange={handleChange}
            value={form.end_time}
            required
          />
          <input
            name="capacity"
            type="number"
            min={1}
            placeholder="Capacity"
            className="input input-bordered w-full"
            onChange={handleChange}
            value={form.capacity}
            required
          />
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            placeholder="Price (INR)"
            className="input input-bordered w-full"
            onChange={handleChange}
            value={form.price}
            required
          />
          <button type="submit" className="btn btn-primary w-full">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
