import { useState, useEffect } from "react";
import QRScanner from "./QRScanner";
import CyberDojo from "./CyberDojo";
import { generateReport } from "./generatePDF";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showDojo, setShowDojo] = useState(false);

  const [stats, setStats] = useState({
    totalScans: 0,
    phishingCount: 0,
    safeCount: 0,
    recentScans: [],
  });

  const [darkMode, setDarkMode] = useState(true);

  // Poll Stats
  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 NEW FUNCTION: Load a past scan into the main view
  const loadScanFromHistory = (scan) => {
    // 1. Populate the Text Box
    setText(scan.text);
    setFile(null); // Clear any file selection

    // 2. Reconstruct the Result Object
    const restoredResult = {
      score: scan.score,
      verdict: scan.verdict,
      reasons: scan.reasons,
      // Important: Pass the text so the PDF generator works
      scannedText: scan.text,
    };

    setResult(restoredResult);

    // 3. Scroll to top (Mobile friendly)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnalyze = async () => {
    if (!text && !file) return;

    setLoading(true);
    setResult(null);

    try {
      let data;
      let scannedContent = "";

      if (file) {
        // 📸 IMAGE PATH
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
          "http://localhost:5000/api/analyze-image",
          { method: "POST", body: formData },
        );
        data = await response.json();
        scannedContent = data.extractedText || "Image Content";
      } else {
        // 📝 TEXT PATH
        const response = await fetch("http://localhost:5000/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "message", text }),
        });
        data = await response.json();
        scannedContent = text;
      }

      const finalResult = { ...data, scannedText: scannedContent };

      setResult(finalResult);
      fetchStats();
      setFile(null);
      setText("");
    } catch (error) {
      alert("Analysis failed. Check backend console." + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 p-8 font-sans relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
        </div>

        {/* HEADER */}
        <header className="relative z-10 max-w-7xl mx-auto flex justify-between items-center mb-10 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Phish
                <span className="text-blue-600 dark:text-blue-400">Guard</span>
              </h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-400">
                Cyber Defense Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 text-sm font-semibold">
              <div className="text-center">
                <span className="block text-gray-400 text-[10px] uppercase">
                  Scans Run
                </span>
                <span className="text-xl font-bold">{stats.totalScans}</span>
              </div>
              <div className="text-center">
                <span className="block text-gray-400 text-[10px] uppercase">
                  Threats Blocked
                </span>
                <span className="text-xl font-bold text-red-500">
                  {stats.phishingCount}
                </span>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-full bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: SCANNER */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700 transition-all">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-500">🔍</span> Analyze Content
              </h2>

              <div className="mb-4 flex flex-wrap gap-2">
                <label className="cursor-pointer bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  📷 Upload Screenshot
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setText("");
                    }}
                  />
                </label>

                <button
                  onClick={() => setShowScanner(true)}
                  className="cursor-pointer bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                >
                  🔳 Scan QR Code
                </button>

                <button
                  onClick={() => setShowDojo(true)}
                  className="cursor-pointer bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                >
                  🥋 Training Mode
                </button>

                {file && (
                  <span className="text-sm text-blue-500 flex items-center animate-fade-in bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                    ✅ {file.name}
                    <button
                      onClick={() => setFile(null)}
                      className="ml-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              <textarea
                className={`w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl p-4 text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none transition-all ${file ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder={
                  file
                    ? "Image selected. Click Analyze..."
                    : "Paste suspicious email text or URL here..."
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!!file}
              ></textarea>

              <button
                onClick={handleAnalyze}
                disabled={loading || (!text && !file)}
                className={`w-full mt-4 py-4 rounded-xl font-bold text-lg tracking-wide text-white shadow-lg transition-all transform active:scale-95 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-blue-500/25 hover:scale-[1.01]"
                }`}
              >
                {loading ? "⚡ Extracting & Scanning..." : "🚀 ANALYZE RISK"}
              </button>
            </div>

            {/* RESULT CARD */}
            {result && (
              <div
                className={`rounded-2xl p-8 shadow-2xl border-l-8 animate-fade-in backdrop-blur-md transition-all ${
                  result.score > 50
                    ? "bg-red-50/90 dark:bg-red-900/20 border-red-500"
                    : "bg-emerald-50/90 dark:bg-emerald-900/20 border-emerald-500"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3
                      className={`text-3xl font-black tracking-tight ${
                        result.score > 50
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {result.verdict.toUpperCase()}
                    </h3>
                    <p className="opacity-75 font-medium">Confidence Score</p>
                  </div>
                  <div
                    className={`text-5xl font-black ${
                      result.score > 50
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {result.score}
                    <span className="text-2xl align-top opacity-50">%</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 mb-8 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)] ${
                      result.score > 50
                        ? "bg-gradient-to-r from-orange-500 to-red-600"
                        : "bg-gradient-to-r from-emerald-500 to-green-500"
                    }`}
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>

                {/* PDF EXPORT BUTTON */}
                <button
                  onClick={() => generateReport(result, result.scannedText)}
                  className="w-full py-4 mb-8 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 border-2
                             bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 
                             border-slate-200 dark:border-slate-700 
                             hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg"
                >
                  <span className="text-xl">📄</span>
                  <span>Export Official PDF Report</span>
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 dark:text-slate-400 ml-2">
                    PRO
                  </span>
                </button>

                <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-6 border border-white/20 dark:border-white/5">
                  <h4 className="font-bold mb-3 uppercase text-xs tracking-wider opacity-70">
                    Analysis Breakdown
                  </h4>
                  <ul className="space-y-3">
                    {result.reasons.map((reason, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm font-medium"
                      >
                        <span
                          className={`mt-1 ${result.score > 50 ? "text-red-500" : "text-emerald-500"}`}
                        >
                          ➤
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE FEED (Now Interactive!) */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Scan History ({stats.recentScans ? stats.recentScans.length : 0}
                )
              </h3>

              <div className="space-y-4 flex-grow overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                {stats.recentScans && stats.recentScans.length > 0 ? (
                  stats.recentScans.map((scan, index) => (
                    <div
                      key={index}
                      onClick={() => loadScanFromHistory(scan)} // 🟢 CLICK HANDLER
                      className="bg-gray-50 dark:bg-slate-900/80 p-4 rounded-xl border-l-4 border-l-transparent hover:border-l-blue-500 shadow-sm hover:shadow-md transition-all group cursor-pointer active:scale-95"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                            scan.verdict === "Phishing"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : scan.verdict === "Safe"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {scan.verdict}
                        </span>
                        <span className="text-gray-400 text-[10px]">
                          {new Date(scan.date).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-slate-400 text-xs truncate font-mono group-hover:text-blue-500 transition-colors">
                        {scan.text.substring(0, 50)}...
                      </p>
                      <div className="mt-2 text-[10px] text-gray-400 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to view report ↗
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-50">
                    <p>No recent activity...</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                <p className="text-xs text-blue-800 dark:text-blue-300 text-center leading-relaxed">
                  💡 <strong>Tip:</strong> Click on any past scan in the list to
                  reload its full security report and download the PDF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={(decodedText) => {
            setText(decodedText);
            setShowScanner(false);
          }}
        />
      )}

      {showDojo && <CyberDojo onClose={() => setShowDojo(false)} />}
    </div>
  );
}

export default App;
