import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

  const API_BASE_URL = process.env.VITE_API_BASE_URL;

const ViewEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatDateSafe = (dateStr) =>
    dateStr && !isNaN(new Date(dateStr))
      ? new Date(dateStr).toLocaleString()
      : "TBA";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`/api/events/all`);
        setEvents(res.data.events);
        setError(null);
      } catch (err) {
        setError("Failed to load events");
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleGoToPay = (eventId) => {
    navigate(`/pay/${eventId}`);
  };

  const isStarted = (event) => new Date(event.time) <= new Date();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Available Events</h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const started = isStarted(event);
            return (
              <div
                key={event.id}
                className="bg-base-100 p-6 rounded shadow-md flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    Start: {formatDateSafe(event.time)}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    End: {formatDateSafe(event.end_time)}
                  </p>
                  <p>Capacity: {event.capacity}</p>
                  <p>Tickets Left: {event.availabletickets || 0}</p>
                  <p>Price: ₹{event.price}</p>
                  {event.description && (
                    <p className="text-gray-700 mt-2">{event.description}</p>
                  )}
                </div>
                <button
                  disabled={started || (event.availabletickets || 0) <= 0}
                  aria-disabled={started || (event.availabletickets || 0) <= 0}
                  onClick={() => handleGoToPay(event.id)}
                  className={`btn btn-primary btn-sm mt-4 w-full ${
                    started || (event.availabletickets || 0) <= 0
                      ? "btn-disabled bg-gray-400 border-gray-400 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {started
                    ? "Event Started"
                    : (event.availabletickets || 0) > 0
                    ? "Buy Ticket"
                    : "Sold Out"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewEventsPage;
