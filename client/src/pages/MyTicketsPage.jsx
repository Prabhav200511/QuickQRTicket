import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tickets/my-tickets', { withCredentials: true });
        setTickets(res.data.tickets);
      } catch {
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto my-8 p-4">
      <h2 className="text-2xl font-bold text-center mb-6">My Active Tickets</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">Loading...</div>
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No active tickets found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {tickets.map(ticket => (
            <div key={ticket.ticket_id} className="shadow rounded p-6 bg-base-100 text-center">
              <h3 className="text-lg font-semibold mb-2">{ticket.event_name}</h3>
              <p className="mb-2 text-gray-500">
                Event Time: {new Date(ticket.event_time).toLocaleString()}
              </p>
              <img
                src={ticket.qr_code}
                alt={`QR for ${ticket.event_name}`}
                className="mx-auto my-2"
                style={{ maxWidth: 180 }}
              />
              <div>
                <span className={`badge ${ticket.scanned ? 'badge-error' : 'badge-success'} mt-2`}>
                  {ticket.scanned ? 'Scanned/Used' : 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
