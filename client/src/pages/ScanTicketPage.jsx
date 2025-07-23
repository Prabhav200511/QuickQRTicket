  import React, { useRef, useState, useEffect } from "react";
  import Webcam from "react-webcam";
  import jsQR from "jsqr";
  import axios from "axios";
  import toast from "react-hot-toast";

  const ScanTicketPage = () => {
    const webcamRef = useRef(null);
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [mode, setMode] = useState("camera"); // "camera" or "upload"

    // Live webcam scanning
    useEffect(() => {
      if (mode !== "camera") return;
      const interval = setInterval(() => {
        if (
          webcamRef.current &&
          webcamRef.current.getCanvas() && 
          !qrData
        ) {
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
    }, [qrData, mode]);

    // When a live QR is found, auto-submit to API for validation
    useEffect(() => {
      const handleScan = async () => {
        if (!qrData) return;
        setResult(null);
        setScanning(true);
        try {
          // Send as { qrText: qrData } to a new API endpoint for text-QR
          // Or, if your /scan only accepts images, 
          // you should add a backend route that accepts raw QR text
          const res = await axios.post(
            "http://localhost:5000/api/tickets/scan-qrstring",
            { qrText: qrData },
            { withCredentials: true }
          );
          setResult({ success: true, message: res.data.message, details: res.data });
          toast.success(res.data.message || "Checked in!");
        } catch (err) {
          setResult({
            success: false,
            message: err.response?.data?.message || "Scan failed"
          });
          toast.error(
            err.response?.data?.message || "Scan failed. Try again."
          );
        } finally {
          setScanning(false);
          setQrData(null); // Ready for next scan
        }
      };
      if (qrData && mode === "camera" && !scanning) {
        handleScan();
      }
      // eslint-disable-next-line
    }, [qrData, mode]);

    // Image upload logic stays the same
    const handleChange = (e) => {
      setFile(e.target.files[0]);
      setResult(null);
    };

    const handleUploadSubmit = async (e) => {
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

          <div className="flex justify-center gap-3 mb-6">
            <button
              className={`btn ${mode === "camera" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setMode("camera")}
            >
              Camera
            </button>
            <button
              className={`btn ${mode === "upload" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setMode("upload")}
            >
              Upload Image
            </button>
          </div>

          {mode === "camera" && (
            <div className="flex flex-col items-center">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                width={320}
                height={240}
                videoConstraints={{ facingMode: "environment" }}
                className="rounded shadow"
              />
              <p className="mt-2 text-center text-sm text-gray-600">
                {scanning
                  ? "Checking ticket..."
                  : qrData
                  ? "QR found! Validating..."
                  : "Point the camera at a ticket QR"}
              </p>
            </div>
          )}

          {mode === "upload" && (
            <form onSubmit={handleUploadSubmit} className="space-y-5">
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
          )}

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
