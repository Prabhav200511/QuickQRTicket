import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import axios from "axios";
import toast from "react-hot-toast";

  const API_BASE_URL =  '/';

const ScanTicketPage = () => {
  const webcamRef = useRef(null);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamRef.current && webcamRef.current.getCanvas() && !qrData) {
        const canvas = webcamRef.current.getCanvas();
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          setQrData(code.data);
        }
      }
    }, 700);
    return () => clearInterval(interval);
  }, [qrData]);

  useEffect(() => {
    const handleScan = async () => {
      if (!qrData) return;
      setResult(null);
      setScanning(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/tickets/scan-qrstring`,
          { qrText: qrData },
          { withCredentials: true }
        );
        setResult({ success: true, message: res.data.message, details: res.data });
        toast.success(res.data.message || "Checked in!");
      } catch (err) {
        setResult({
          success: false,
          message: err.response?.data?.message || "Scan failed",
        });
        toast.error(err.response?.data?.message || "Scan failed. Try again.");
      } finally {
        setScanning(false);
        setQrData(null); // ready to scan next
      }
    };
    if (qrData && !scanning) {
      handleScan();
    }
    // eslint-disable-next-line
  }, [qrData]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 py-10 px-2">
      <div className="bg-base-100 rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Scan Ticket QR</h2>
        <div className="flex flex-col items-center">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/png"
            width={320}
            height={240}
            videoConstraints={{ facingMode: "environment" }}
            className="rounded shadow"
            onUserMediaError={() => {
              toast.error("Unable to access webcam. Please allow camera permissions.");
            }}
          />
          <p className="mt-2 text-center text-sm text-gray-600">
            {scanning
              ? "Checking ticket..."
              : qrData
              ? "QR found! Validating..."
              : "Point the camera at a ticket QR"}
          </p>
        </div>
        {result && (
          <div
            className={"mt-6 alert " + (result.success ? "alert-success" : "alert-error")}
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
