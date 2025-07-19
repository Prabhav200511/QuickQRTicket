import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ViewEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/events/all");
        setEvents(res.data.events);
      } catch (err) {
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

  // Helper: is event started?
  const isStarted = (event) => new Date(event.time) <= new Date();

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
          {events.map((event) => {
            const started = isStarted(event);
            return (
              <div key={event.id} className="bg-base-100 p-6 rounded shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    Time: {new Date(event.time).toLocaleString()}
                  </p>
                  <p>
                    Capacity: {event.capacity}
                  </p>
                  <p>
                    Tickets Left: {event.availabletickets}
                  </p>
                  <p>
                    Price: ₹{event.price}
                  </p>
                  {event.description && (
                    <p className="text-gray-700 mt-2">{event.description}</p>
                  )}
                </div>
                <button
                  disabled={started || event.availabletickets <= 0}
                  onClick={() => handleGoToPay(event.id)}
                  className={`btn btn-primary btn-sm mt-4 w-full
                    ${started || event.availabletickets <= 0 ? "btn-disabled bg-gray-400 border-gray-400 cursor-not-allowed" : ""}
                  `}
                >
                  {started
                    ? "Event Started"
                    : event.availabletickets > 0
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
