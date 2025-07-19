import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateEventPage = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    time: '',
    end_time: '',  // new!
    capacity: '',
    price: '',
  });

  const navigate = useNavigate();

  // Keep end_time always at least as late as start time
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Optionally, auto-correct end_time if it's before time
    if (name === "time" && form.end_time && value > form.end_time) {
      setForm({ ...form, time: value, end_time: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic frontend overflow protection
    if (form.end_time <= form.time) {
      toast.error('End time must be after start time!');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/events/create',
        form,
        { withCredentials: true }
      );
      toast.success('Event created successfully!');
      navigate('/dashboard/host');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error creating event');
    }
  };

  // Start time can't be before now
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
