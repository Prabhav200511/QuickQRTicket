import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

  const API_BASE_URL = import.meta.env.NODE_ENV==="production"? '/' : 'http://localhost:5000';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/tickets/my-tickets`, {
          withCredentials: true,
        });
        setTickets(res.data.tickets);
        setError(null);
      } catch (err) {
        setError("Failed to load tickets");
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const safeFormat = (dt) =>
    dt && !isNaN(new Date(dt)) ? new Date(dt).toLocaleString() : "TBA";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">My Tickets</h2>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-500">No tickets booked yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticket_id}
              className="bg-base-100 p-6 rounded shadow-md flex flex-col items-center"
            >
              <h3 className="text-lg font-semibold mb-2">{ticket.event_name}</h3>
              <p className="text-sm text-gray-500 mb-1">
                Start: {safeFormat(ticket.event_time)}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                End: {safeFormat(ticket.event_end_time)}
              </p>
              <img
                src={ticket.qr_code}
                alt={`QR Code for ${ticket.event_name}`}
                className="mt-2 mb-2"
                style={{ width: 100, height: 100 }}
              />
              <div
                className={`mt-2 badge ${
                  ticket.scanned ? "badge-success" : "badge-warning"
                }`}
                aria-label={ticket.scanned ? "Ticket Used" : "Ticket Not Used"}
              >
                {ticket.scanned ? "Used" : "Not Used"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
