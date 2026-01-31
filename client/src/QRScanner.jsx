import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [scannedResult, setScannedResult] = useState(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null); // Reference for the hidden file input
  const readerId = "reader-custom-id";

  useEffect(() => {
    // 1. Setup the Scanner
    const html5QrCode = new Html5Qrcode(readerId);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    // 2. Start Camera
    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleStop();
          setScannedResult(decodedText);
        },
        (errorMessage) => {
          // Ignore frame errors
        },
      )
      .catch((err) => {
        // Only log if the element still exists
        if (document.getElementById(readerId)) {
          console.error("Camera start failed", err);
          // Don't kill the whole UI, just show a message. User can still upload.
          setErrorMsg("Camera not found. Try uploading an image.");
          setIsScanning(false);
        }
      });

    // 3. Cleanup
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then(() => html5QrCode.clear())
          .catch(console.error);
      } else {
        try {
          html5QrCode.clear();
        } catch (e) {}
      }
    };
  }, []);

  const handleStop = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => setIsScanning(false))
        .catch(console.error);
    } else {
      setIsScanning(false);
    }
  };

  // 📂 HANDLE FILE UPLOAD
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Stop camera if running to save resources
      handleStop();

      // Use the library's built-in file scanner
      const result = await scannerRef.current.scanFile(file, true);
      setScannedResult(result);
      setErrorMsg(""); // Clear previous errors
    } catch (err) {
      console.error("File scan error:", err);
      setErrorMsg("No QR code found in this image.");
      // Restart camera if needed, or just let them try again
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700 relative flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <span className="text-blue-500">🔳</span>
            {scannedResult ? "Scan Successful" : "Scan QR Code"}
          </h2>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 font-bold text-xl"
          >
            ✖
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 bg-slate-900 relative min-h-[400px] flex flex-col justify-center items-center">
          {/* CAMERA CONTAINER */}
          <div
            id={readerId}
            className={`w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-black ${scannedResult ? "hidden" : "block"}`}
            style={{ minHeight: "250px" }}
          ></div>

          {/* LOADING STATE */}
          {isScanning && !scannedResult && !errorMsg && (
            <p className="text-slate-400 text-sm mt-4 animate-pulse">
              Pointing camera at QR code...
            </p>
          )}

          {/* ERROR STATE */}
          {errorMsg && (
            <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg mt-4 w-full">
              <p>⚠️ {errorMsg}</p>
            </div>
          )}

          {/* 📂 UPLOAD BUTTON (Visible when scanning) */}
          {!scannedResult && (
            <div className="mt-6 w-full">
              <p className="text-center text-slate-500 text-xs mb-2">- OR -</p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 hover:bg-slate-800 transition-all font-bold flex items-center justify-center gap-2"
              >
                📁 Upload QR Image
              </button>
            </div>
          )}

          {/* RESULT CARD */}
          {scannedResult && (
            <div className="w-full text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✅
              </div>

              <h3 className="text-white font-bold mb-2">Code Detected!</h3>

              <div className="bg-slate-800 p-4 rounded-lg mb-6 border border-slate-700 break-all">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">
                  Content Found:
                </p>
                <p className="text-blue-400 font-mono text-sm">
                  {scannedResult}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setScannedResult(null);
                    setErrorMsg("");
                    setIsScanning(true);
                    window.location.reload();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-all"
                >
                  Retake
                </button>
                <button
                  onClick={() => onScan(scannedResult)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
                >
                  🚀 Analyze Risk
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        #reader-custom-id video {
            object-fit: cover;
            width: 100% !important;
            height: 100% !important;
            border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
