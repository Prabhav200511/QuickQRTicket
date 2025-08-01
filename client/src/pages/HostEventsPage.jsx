import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL =  '/' ;

const HostEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDateSafe = (dateStr) => {
    return dateStr && !isNaN(new Date(dateStr))
      ? new Date(dateStr).toLocaleString()
      : "-";
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/events/host`, { withCredentials: true });
        setEvents(res.data.events);
      } catch (err) {
        setError('Failed to load your events');
        toast.error('Failed to load your events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">My Created Events</h2>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events created yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-base-100 p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
              <p className="text-sm text-gray-500 mb-1">Start: {formatDateSafe(event.time)}</p>
              <p className="text-sm text-gray-500 mb-1">End: {formatDateSafe(event.end_time)}</p>
              <p>Capacity: {event.capacity}</p>
              <p>Price: ₹{event.price}</p>
              {event.description && <p className="text-gray-700 mt-2">{event.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostEventsPage;
