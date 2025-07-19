import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const PaymentsPage = () => {
  const { eventId } = useParams();
  const [qrData, setQrData] = useState("");
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Optionally fetch event info for display
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/all`);
        const ev = res.data.events?.find(e => String(e.id) === String(eventId));
        setEvent(ev);
      } catch {
        // fallback: ignore
      } finally {
        setLoading(false);
      }
    })();
    // Optionally, generate random QR here or let backend handle it
    setQrData(`pseudoticket|${eventId}|${Math.random().toString(36).slice(2,10)}`);
  }, [eventId]);

  const handlePaid = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/tickets/buy",
        { eventId },
        { withCredentials: true }
      );
      toast.success("Ticket booked!");
      navigate("/my-tickets");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Purchase failed");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-40">Loading...</div>;
  if (!event) return <div className="text-center text-error">Event not found</div>;
  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-base-100 rounded shadow">
      <h2 className="text-xl font-bold mb-3 text-center">Payment for: {event.name}</h2>
      <div className="flex flex-col items-center mb-5">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=180x180`}
          alt="Random Ticket QR"
          className="mx-auto mb-3"
        />
        <p className="text-success text-center mb-4">
          (Sample QR - ticket confirmed after payment)
        </p>
      </div>
      <button className="btn btn-success w-full" onClick={handlePaid}>
        Mark as Paid and Claim Ticket
      </button>
    </div>
  );
};

export default PaymentsPage;
