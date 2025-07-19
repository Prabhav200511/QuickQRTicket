import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ViewEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events/all');
        setEvents(res.data.events);
      } catch (err) {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleBuy = async (eventId) => {
  try {
    const res = await axios.post(
      'http://localhost:5000/api/tickets/buy',
      { eventId },
      { withCredentials: true }
    );
    toast.success('Ticket booked!');
    const newWindow = window.open();
    newWindow.document.write(`<img src="${res.data.ticket.qr_code}" />`);
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Purchase failed');
  }
};


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Available Events</h2>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-base-100 p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
              <p className="text-sm text-gray-500 mb-1">
                Time: {new Date(event.time).toLocaleString()}
              </p>
              <p>Capacity: {event.capacity}</p>
              <p>Price: ₹{event.price}</p>
              <button
                onClick={() => handleBuy(event.id)}
                className="btn btn-primary btn-sm mt-4 w-full"
              >
                Buy Ticket
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewEventsPage;
