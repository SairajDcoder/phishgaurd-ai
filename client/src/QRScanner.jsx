import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  QrCode,
  X,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const QRScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [scannedResult, setScannedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const readerId = "qr-reader-id";

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(readerId);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    // Start camera
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
        if (document.getElementById(readerId)) {
          console.error("Camera start failed", err);
          setErrorMsg("Camera access denied. Try uploading an image instead.");
          setIsScanning(false);
        }
      });

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      handleStop();
      const result = await scannerRef.current.scanFile(file, true);
      setScannedResult(result);
      setErrorMsg("");
    } catch (err) {
      console.error("File scan error:", err);
      setErrorMsg("No QR code found in this image. Try another image.");
    } finally {
      setLoading(false);
    }
  };

  const restartScanner = () => {
    setScannedResult(null);
    setErrorMsg("");
    setIsScanning(true);

    if (scannerRef.current && !scannerRef.current.isScanning) {
      scannerRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleStop();
            setScannedResult(decodedText);
          },
          () => {},
        )
        .catch(() => {
          setErrorMsg("Failed to restart camera");
        });
    }
  };

  const isUrl = (text) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/95 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-800 relative flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {scannedResult ? "Scan Complete" : "QR Code Scanner"}
                </h2>
                <p className="text-gray-400 text-xs">
                  {scannedResult
                    ? "Content detected"
                    : "Scan or upload QR code"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                handleStop();
                onClose();
              }}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 bg-gray-900/50 relative min-h-[450px] flex flex-col">
          {/* SCANNER VIEW */}
          {!scannedResult && (
            <div className="space-y-6">
              <div className="relative">
                <div
                  id={readerId}
                  className="w-full h-64 rounded-xl overflow-hidden border-2 border-gray-700 bg-black relative"
                ></div>

                {/* Scanning animation overlay */}
                {isScanning && !errorMsg && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan-line"></div>
                    <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-xl pointer-events-none"></div>
                  </>
                )}

                {/* Corner markers */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-500"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-500"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500"></div>
              </div>

              {/* STATUS INDICATOR */}
              <div className="text-center">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 text-cyan-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing image...</span>
                  </div>
                ) : isScanning ? (
                  <div className="flex items-center justify-center gap-2 text-cyan-400">
                    <Camera className="w-4 h-4" />
                    <span>Position QR code within frame</span>
                  </div>
                ) : errorMsg ? (
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Camera inactive</div>
                )}
              </div>

              {/* UPLOAD SECTION */}
              <div className="pt-4 border-t border-gray-800">
                <div className="text-center mb-4">
                  <div className="text-gray-500 text-sm mb-2">— OR —</div>
                  <p className="text-gray-400 text-sm">
                    Upload a QR code image file
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={loading}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all duration-300 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="font-semibold text-gray-300">
                    Upload QR Image
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG, or GIF
                  </span>
                </button>

                {errorMsg && (
                  <button
                    onClick={restartScanner}
                    className="w-full mt-3 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Camera Again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* RESULT VIEW */}
          {scannedResult && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  QR Code Scanned Successfully!
                </h3>
                <p className="text-gray-400 text-sm">
                  Content extracted and ready for analysis
                </p>
              </div>

              {/* RESULT CARD */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-5 bg-cyan-500 rounded-full"></div>
                    <h4 className="font-semibold">Detected Content</h4>
                  </div>
                  <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full">
                    {isUrl(scannedResult) ? "URL" : "Text"}
                  </div>
                </div>

                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-auto max-h-40">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap break-all font-mono">
                    {scannedResult}
                  </pre>
                </div>

                {isUrl(scannedResult) && (
                  <a
                    href={scannedResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open link in new tab
                  </a>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setScannedResult(null);
                    restartScanner();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-all border border-gray-700 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Scan Another
                </button>
                <button
                  onClick={() => onScan(scannedResult)}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Analyze Content
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline styles for scanner */}
      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
        
        #${readerId} video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
