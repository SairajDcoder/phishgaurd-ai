// App.jsx - COMPLETE VERSION WITH DARK MODE & SETTINGS
import { useState, useEffect } from "react";
import {
  Shield,
  Scan,
  History,
  AlertTriangle,
  Trophy,
  QrCode,
  Image,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  ChevronRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sun,
  Moon,
  X,
} from "lucide-react";
import CyberDojo from "./CyberDojo";
import QRScanner from "./QRScanner";
import SettingsPage from "./SettingsPage";
import { generateReport } from "./generatePDF";

function App() {
  const [inputText, setInputText] = useState("");
  const [inputType, setInputType] = useState("email");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [showCyberDojo, setShowCyberDojo] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");
  const [darkMode, setDarkMode] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("phishguard-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, []);

  // Update body class when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("phishguard-theme", newMode ? "dark" : "light");
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    fetchRecentHistory();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchRecentHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stats");
      const data = await res.json();
      setHistory(data.recentScans || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, type: inputType }),
      });
      const data = await res.json();
      setResult(data);

      // Refresh stats and history
      fetchStats();
      fetchRecentHistory();
    } catch (error) {
      setResult({
        score: 85,
        verdict: "Error",
        reasons: ["Failed to connect to analysis service. Try again."],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      fetchStats();
      fetchRecentHistory();
    } catch (error) {
      setResult({
        score: 50,
        verdict: "Error",
        reasons: ["Failed to process image"],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (url) => {
    setInputText(url);
    setShowQRScanner(false);
    setActiveTab("scan");
  };

  const getSeverityColor = (score) => {
    if (score < 30) return "bg-emerald-500";
    if (score < 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case "safe":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "phishing":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark" : "light"} ${darkMode ? "bg-gray-950" : "bg-gray-50"} text-gray-900 dark:text-gray-100 transition-colors duration-300`}
    >
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-[1000]"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 hidden md:flex flex-col z-50">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              PhishGuard AI
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Security Hub
            </p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${activeTab === "scan" ? "bg-gray-100 dark:bg-gray-800 text-cyan-600 dark:text-cyan-400" : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"}`}
          >
            <Scan className="w-5 h-5" />
            <span className="font-medium">Scan Content</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${activeTab === "history" ? "bg-gray-100 dark:bg-gray-800 text-cyan-600 dark:text-cyan-400" : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"}`}
          >
            <History className="w-5 h-5" />
            <span className="font-medium">Scan History</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${activeTab === "analytics" ? "bg-gray-100 dark:bg-gray-800 text-cyan-600 dark:text-cyan-400" : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>

          <button
            onClick={() => setShowCyberDojo(true)}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all text-amber-600 dark:text-amber-400"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Cyber Dojo</span>
            <span className="ml-auto text-xs bg-amber-500/20 text-amber-600 dark:text-amber-300 px-2 py-1 rounded-full">
              NEW
            </span>
          </button>
        </nav>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all text-gray-700 dark:text-gray-300"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="font-medium">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all text-gray-700 dark:text-gray-300"
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              PhishGuard AI
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 flex justify-around">
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex flex-col items-center p-2 rounded-lg ${activeTab === "scan" ? "text-cyan-600 dark:text-cyan-400" : "text-gray-600 dark:text-gray-400"}`}
        >
          <Scan className="w-5 h-5" />
          <span className="text-xs mt-1">Scan</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center p-2 rounded-lg ${activeTab === "history" ? "text-cyan-600 dark:text-cyan-400" : "text-gray-600 dark:text-gray-400"}`}
        >
          <History className="w-5 h-5" />
          <span className="text-xs mt-1">History</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex flex-col items-center p-2 rounded-lg ${activeTab === "analytics" ? "text-cyan-600 dark:text-cyan-400" : "text-gray-600 dark:text-gray-400"}`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs mt-1">Analytics</span>
        </button>
        <button
          onClick={() => setShowCyberDojo(true)}
          className="flex flex-col items-center p-2 rounded-lg text-amber-600 dark:text-amber-400"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-xs mt-1">Training</span>
        </button>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="md:ml-64 p-4 md:p-6">
        {/* Top Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === "scan" && "Threat Scanner"}
              {activeTab === "history" && "Scan History"}
              {activeTab === "analytics" && "Security Analytics"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {activeTab === "scan" &&
                "Analyze emails, messages, and links for phishing threats"}
              {activeTab === "history" &&
                "View previous scans and security audits"}
              {activeTab === "analytics" &&
                "Security insights and threat patterns"}
            </p>
          </div>

          {stats && (
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-500">Total Scans</div>
                <div className="text-lg font-bold">{stats.totalScans || 0}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-500">Threats</div>
                <div className="text-lg font-bold text-red-500 dark:text-red-400">
                  {stats.phishingCount || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-500">Safe</div>
                <div className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
                  {stats.safeCount || 0}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Scanner */}
          {activeTab === "scan" && (
            <>
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <div className="w-2 h-5 bg-cyan-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Content Analysis
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                        Content Type
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {["email", "sms", "social", "website", "document"].map(
                          (type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setInputType(type)}
                              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all text-sm ${inputType === type ? "bg-cyan-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                        Enter suspicious content
                      </label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste suspicious email, message, or URL here..."
                        className="w-full h-32 md:h-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 md:p-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none text-gray-900 dark:text-white"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Scan className="w-4 h-4" />
                            Analyze Threat
                          </>
                        )}
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowQRScanner(true)}
                          className="px-3 py-2.5 md:px-4 md:py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-semibold transition-all flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <QrCode className="w-4 h-4" />
                          <span className="hidden sm:inline">Scan QR</span>
                        </button>

                        <label className="px-3 py-2.5 md:px-4 md:py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-semibold transition-all flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                          <Image className="w-4 h-4" />
                          <span className="hidden sm:inline">Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Results Section */}
                {result && (
                  <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        {getVerdictIcon(result.verdict)}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Analysis Result
                        </h3>
                      </div>
                      <button
                        onClick={() => generateReport(result, inputText)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <FileText className="w-4 h-4" />
                        Export PDF
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Threat Score Bar */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Threat Score
                          </span>
                          <span
                            className={`font-bold ${result.score > 70 ? "text-red-500 dark:text-red-400" : result.score > 30 ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400"}`}
                          >
                            {result.score}/100
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getSeverityColor(result.score)} transition-all duration-500`}
                            style={{ width: `${result.score}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Safe</span>
                          <span>Suspicious</span>
                          <span>Phishing</span>
                        </div>
                      </div>

                      {/* Verdict Card */}
                      <div
                        className={`p-4 rounded-lg ${result.score > 70 ? "bg-red-500/10 border border-red-500/30" : result.score > 30 ? "bg-amber-500/10 border border-amber-500/30" : "bg-emerald-500/10 border border-emerald-500/30"}`}
                      >
                        <div className="flex items-center gap-2">
                          {getVerdictIcon(result.verdict)}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Verdict:{" "}
                          </span>
                          <span
                            className={`font-bold ${result.score > 70 ? "text-red-500 dark:text-red-400" : result.score > 30 ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400"}`}
                          >
                            {result.verdict}
                          </span>
                        </div>
                      </div>

                      {/* Reasons */}
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                          Key Findings
                        </h4>
                        <div className="space-y-2">
                          {result.reasons?.map((reason, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Quick Actions & Stats */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowCyberDojo(true)}
                      className="w-full p-4 bg-gradient-to-r from-amber-600/20 to-amber-500/10 hover:from-amber-600/30 hover:to-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            Cyber Dojo
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            AI Training Mode
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-amber-500 dark:group-hover:text-amber-400" />
                    </button>

                    <button
                      onClick={() => setShowQRScanner(true)}
                      className="w-full p-4 bg-gradient-to-r from-cyan-600/20 to-blue-500/10 hover:from-cyan-600/30 hover:to-blue-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <QrCode className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            QR Scanner
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Scan & Analyze
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400" />
                    </button>
                  </div>
                </div>

                {/* Recent Scans */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Recent Scans
                    </h3>
                    <button
                      onClick={fetchRecentHistory}
                      className="text-sm text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-3">
                    {history.slice(0, 5).map((scan, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {getVerdictIcon(scan.verdict)}
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[140px]">
                              {scan.text}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(scan.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 text-xs rounded-full ${scan.score > 70 ? "bg-red-500/20 text-red-600 dark:text-red-300" : scan.score > 30 ? "bg-amber-500/20 text-amber-600 dark:text-amber-300" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"}`}
                        >
                          {scan.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Scan History
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Complete audit log of all scans
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="text-left p-3 md:p-4 font-medium text-gray-900 dark:text-white">
                          Content
                        </th>
                        <th className="text-left p-3 md:p-4 font-medium text-gray-900 dark:text-white">
                          Type
                        </th>
                        <th className="text-left p-3 md:p-4 font-medium text-gray-900 dark:text-white">
                          Score
                        </th>
                        <th className="text-left p-3 md:p-4 font-medium text-gray-900 dark:text-white">
                          Verdict
                        </th>
                        <th className="text-left p-3 md:p-4 font-medium text-gray-900 dark:text-white">
                          Date
                        </th>
                        <th className="text-left p-3 md:p-4 font-medium text-gray-900 dark:text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((scan, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 dark:border-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/20"
                        >
                          <td className="p-3 md:p-4 max-w-xs truncate text-gray-700 dark:text-gray-300">
                            {scan.text}
                          </td>
                          <td className="p-3 md:p-4">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-700 dark:text-gray-300">
                              {scan.type}
                            </span>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 md:w-16 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getSeverityColor(scan.score)}`}
                                  style={{ width: `${scan.score}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {scan.score}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              {getVerdictIcon(scan.verdict)}
                              <span className="text-gray-700 dark:text-gray-300">
                                {scan.verdict}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4 text-gray-600 dark:text-gray-400 text-sm">
                            {new Date(scan.date).toLocaleDateString()}
                          </td>
                          <td className="p-3 md:p-4">
                            <button
                              onClick={() => generateReport(scan, scan.text)}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                            >
                              Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && stats && (
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
                  <h3 className="font-semibold mb-6 text-gray-900 dark:text-white">
                    Threat Distribution
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 border-8 border-emerald-500 rounded-full"></div>
                      <div
                        className="absolute inset-0 border-8 border-amber-500 rounded-full"
                        style={{
                          clipPath: `inset(0 ${100 - ((stats.phishingCount / stats.totalScans) * 100 || 0)}% 0 0)`,
                        }}
                      ></div>
                      <div
                        className="absolute inset-0 border-8 border-red-500 rounded-full"
                        style={{
                          clipPath: `inset(0 ${100 - ((stats.safeCount / stats.totalScans) * 100 || 0)}% 0 0)`,
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalScans}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Scans
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
                  <h3 className="font-semibold mb-6 text-gray-900 dark:text-white">
                    Risk Statistics
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Phishing Detections
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stats.phishingCount}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${(stats.phishingCount / stats.totalScans) * 100 || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Safe Content
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stats.safeCount}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{
                            width: `${(stats.safeCount / stats.totalScans) * 100 || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showCyberDojo && <CyberDojo onClose={() => setShowCyberDojo(false)} />}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
      {showSettings && (
        <SettingsPage
          onClose={() => setShowSettings(false)}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  );
}

export default App;
