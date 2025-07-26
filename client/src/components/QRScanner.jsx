import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";

const QRScanner = ({ onResult }) => {
  const webcamRef = useRef(null);
  const [scanned, setScanned] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const img = new window.Image();
          img.src = imageSrc;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code && code.data && code.data !== scanned) {
              setScanned(code.data);
              if (onResult) onResult(code.data);
            }
          };
          img.onerror = () => {
            setError("Failed to process webcam image.");
          };
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [onResult, scanned]);

  return (
    <div className="flex flex-col items-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        width={400}
        videoConstraints={{
          facingMode: { ideal: "environment" },
        }}
        onUserMediaError={(e) => setError("Webcam access denied or not available.")}
        className="rounded shadow"
      />
      <div className="mt-4 text-lg text-success">
        {error ? (
          <span className="text-error">{error}</span>
        ) : scanned ? (
          <>
            QR: <b>{scanned}</b>
          </>
        ) : (
          "Point a QR code at the camera"
        )}
      </div>
    </div>
  );
};

export default QRScanner;
