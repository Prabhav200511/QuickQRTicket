import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const PaymentsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);

  // Load event details
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/all`);
        // You might want to make a GET /api/events/:id for efficiency!
        const thisEvent = res.data.events.find(e => String(e.id) === String(eventId));
        setEvent(thisEvent);
      } catch (err) {
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  // Handle ticket buy on 'Paid'
  const handlePaid = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/tickets/buy',
        { eventId },
        { withCredentials: true }
      );
      setTicket(res.data.ticket);
      toast.success('Ticket booked!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Purchase failed');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-40">Loading...</div>;
  if (!event) return <div className="text-center text-error">Event not found.</div>;

  return (
    <div className="max-w-md mx-auto my-8 p-8 bg-base-100 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Payment for: {event.name}</h2>
      <p>Description: {event.description}</p>
      <p>Date & Time: {new Date(event.time).toLocaleString()}</p>
      <p>Price: ₹{event.price}</p>
      <hr className="my-4"/>
      {!ticket ? (
        <>
          <div className="alert alert-info my-3">
            <span>Simulate payment and claim your ticket! (No actual payment required.)</span>
          </div>
          <button
            className="btn btn-success w-full"
            onClick={handlePaid}
          >
            Mark as Paid & Get Ticket
          </button>
        </>
      ) : (
        <div className="text-center mt-4">
          <p className="mb-3 text-success">Payment marked! Here is your ticket QR:</p>
          <img src={ticket.qr_code} alt="Your QR Ticket" className="mx-auto"/>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
