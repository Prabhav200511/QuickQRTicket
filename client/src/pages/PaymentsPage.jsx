import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const PaymentsPage = () => {
  const { eventId } = useParams();
  const [qrData, setQrData] = useState("");
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/events/all`);
        const ev = res.data.events?.find((e) => String(e.id) === String(eventId));
        setEvent(ev);
      } catch {
        // Optional: you can set error state here if desired
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    // Generate a sample QR for display
    setQrData(`pseudoticket|${eventId}|${Math.random().toString(36).slice(2, 10)}`);
  }, [eventId]);

  const handlePaid = async () => {
    setPurchaseLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/tickets/buy`,
        { eventId },
        { withCredentials: true }
      );
      toast.success("Ticket booked!");
      navigate("/my-tickets");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Purchase failed");
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading)
    return <div className="flex justify-center items-center h-40">Loading...</div>;

  if (!event)
    return <div className="text-center text-error">Event not found</div>;

  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-base-100 rounded shadow">
      <h2 className="text-xl font-bold mb-3 text-center">Payment for: {event.name}</h2>
      <p className="text-center mb-4">
        Start: {event.time ? new Date(event.time).toLocaleString() : "TBA"}
      </p>
      <p className="text-center mb-4">
        End: {event.end_time ? new Date(event.end_time).toLocaleString() : "TBA"}
      </p>
      <p className="text-center mb-6">Price: ₹{event.price}</p>
      <div className="flex flex-col items-center mb-5">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            qrData
          )}&size=180x180`}
          alt="Sample Ticket QR"
          className="mx-auto mb-3"
        />
        <p className="text-success text-center mb-4">
          (Sample QR - ticket confirmed after payment)
        </p>
      </div>
      <button
        className="btn btn-success w-full"
        onClick={handlePaid}
        disabled={purchaseLoading}
      >
        {purchaseLoading ? "Processing..." : "Mark as Paid and Claim Ticket"}
      </button>
    </div>
  );
};

export default PaymentsPage;
