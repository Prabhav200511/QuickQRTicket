import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const HostEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Adjust this endpoint if your backend route is different!
        const res = await axios.get('http://localhost:5000/api/events/host', { withCredentials: true });
        setEvents(res.data.events); // expects: { events: [...] }
      } catch (err) {
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
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events created yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <div key={event.id} className="bg-base-100 p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
              <p className="text-sm text-gray-500 mb-1">
                Time: {new Date(event.time).toLocaleString()}
              </p>
              <p>Capacity: {event.capacity}</p>
              <p>Price: ₹{event.price}</p>
              {event.description && <p className="text-gray-700 mt-2">{event.description}</p>}
              {/* Add status here if you want (e.g. tickets left, started/ended, etc.) */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostEventsPage;
