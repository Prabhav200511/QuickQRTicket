import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ScanTicketPage = () => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image.");
      return;
    }
    setScanning(true);
    setResult(null);

    const formData = new FormData();
    formData.append("qrimage", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/tickets/scan",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      setResult({ success: true, message: res.data.message, details: res.data });
      toast.success(res.data.message || "Checked in!");
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || "Scan failed"
      });
      toast.error(
        err.response?.data?.message ||
        "Scan failed. Ensure image is clear and QR is visible."
      );
    } finally {
      setScanning(false);
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 py-10 px-2">
      <div className="bg-base-100 rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Scan Ticket QR</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={handleChange}
            disabled={scanning}
          />
          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={!file || scanning}
          >
            {scanning ? "Scanning..." : "Scan QR"}
          </button>
        </form>
        {result && (
          <div
            className={
              "mt-6 alert " +
              (result.success ? "alert-success" : "alert-error")
            }
          >
            <div>
              <span>{result.message}</span>
              {result.details?.event_name && (
                <div>
                  <strong>Event:</strong> {result.details.event_name}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanTicketPage;
