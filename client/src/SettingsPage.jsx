// SettingsPage.jsx
import { useState } from "react";
import {
  Moon,
  Sun,
  Bell,
  Shield,
  Globe,
  Database,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

const SettingsPage = ({ onClose, darkMode, toggleDarkMode }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    autoScan: false,
    dataRetention: "30days",
    language: "en",
    highContrast: false,
    fontSize: "medium",
    saveScans: true,
    shareAnalytics: false,
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setSaveStatus(null);

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("phishguard-settings", JSON.stringify(settings));
      setSaving(false);
      setSaveStatus({
        type: "success",
        message: "Settings saved successfully!",
      });

      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    }, 500);
  };

  const handleReset = () => {
    const defaultSettings = {
      notifications: true,
      soundEffects: true,
      autoScan: false,
      dataRetention: "30days",
      language: "en",
      highContrast: false,
      fontSize: "medium",
      saveScans: true,
      shareAnalytics: false,
    };
    setSettings(defaultSettings);

    setSaveStatus({
      type: "info",
      message: "Settings reset to defaults",
    });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleExport = () => {
    const exportData = {
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `phishguard-settings-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        if (importedSettings.settings) {
          setSettings(importedSettings.settings);
          setSaveStatus({
            type: "success",
            message: "Settings imported successfully!",
          });
        }
      } catch (error) {
        setSaveStatus({
          type: "error",
          message: "Invalid settings file",
        });
      }
      setTimeout(() => setSaveStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  const clearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all scan history? This action cannot be undone.",
      )
    ) {
      // In a real app, you would call an API here
      setSaveStatus({
        type: "info",
        message: "Scan history cleared",
      });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const SettingItem = ({ icon: Icon, title, description, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-start gap-3 mb-3 sm:mb-0">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div className="w-full sm:w-auto">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your PhishGuard experience
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* APPEARANCE */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                  Appearance
                </h3>
                <div className="space-y-3">
                  <SettingItem
                    icon={darkMode ? Sun : Moon}
                    title="Theme"
                    description="Choose between light and dark mode"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Light
                      </span>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Dark
                      </span>
                    </div>
                  </SettingItem>

                  <SettingItem
                    icon={Eye}
                    title="High Contrast Mode"
                    description="Increase contrast for better visibility"
                  >
                    <button
                      onClick={() =>
                        handleChange("highContrast", !settings.highContrast)
                      }
                      className={`px-4 py-2 rounded-lg transition-colors ${settings.highContrast ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                    >
                      {settings.highContrast ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </SettingItem>

                  <SettingItem
                    icon={Globe}
                    title="Language"
                    description="Interface language"
                  >
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange("language", e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="hi">हिन्दी</option>
                    </select>
                  </SettingItem>
                </div>
              </div>

              {/* NOTIFICATIONS */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
                  Notifications & Sound
                </h3>
                <div className="space-y-3">
                  <SettingItem
                    icon={Bell}
                    title="Push Notifications"
                    description="Get alerts for new threats"
                  >
                    <button
                      onClick={() =>
                        handleChange("notifications", !settings.notifications)
                      }
                      className={`px-4 py-2 rounded-lg transition-colors ${settings.notifications ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                    >
                      {settings.notifications ? "ON" : "OFF"}
                    </button>
                  </SettingItem>

                  <SettingItem
                    icon={settings.soundEffects ? Volume2 : VolumeX}
                    title="Sound Effects"
                    description="Play sounds for interactions"
                  >
                    <button
                      onClick={() =>
                        handleChange("soundEffects", !settings.soundEffects)
                      }
                      className={`px-4 py-2 rounded-lg transition-colors ${settings.soundEffects ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                    >
                      {settings.soundEffects ? "ON" : "OFF"}
                    </button>
                  </SettingItem>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* SECURITY */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-red-500 rounded-full"></div>
                  Security & Privacy
                </h3>
                <div className="space-y-3">
                  <SettingItem
                    icon={Shield}
                    title="Auto-Scan"
                    description="Automatically scan clipboard content"
                  >
                    <button
                      onClick={() =>
                        handleChange("autoScan", !settings.autoScan)
                      }
                      className={`px-4 py-2 rounded-lg transition-colors ${settings.autoScan ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                    >
                      {settings.autoScan ? "ENABLED" : "DISABLED"}
                    </button>
                  </SettingItem>

                  <SettingItem
                    icon={Database}
                    title="Data Retention"
                    description="How long to keep scan history"
                  >
                    <select
                      value={settings.dataRetention}
                      onChange={(e) =>
                        handleChange("dataRetention", e.target.value)
                      }
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    >
                      <option value="7days">7 days</option>
                      <option value="30days">30 days</option>
                      <option value="90days">90 days</option>
                      <option value="forever">Forever</option>
                    </select>
                  </SettingItem>

                  <SettingItem
                    icon={Database}
                    title="Save Scan Results"
                    description="Store scan history locally"
                  >
                    <button
                      onClick={() =>
                        handleChange("saveScans", !settings.saveScans)
                      }
                      className={`px-4 py-2 rounded-lg transition-colors ${settings.saveScans ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                    >
                      {settings.saveScans ? "ENABLED" : "DISABLED"}
                    </button>
                  </SettingItem>
                </div>
              </div>

              {/* DATA MANAGEMENT */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                  Data Management
                </h3>
                <div className="space-y-3">
                  <SettingItem
                    icon={Download}
                    title="Export Settings"
                    description="Backup your configuration"
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <label className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Import
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </SettingItem>

                  <SettingItem
                    icon={Trash2}
                    title="Clear History"
                    description="Delete all scan records"
                  >
                    <button
                      onClick={clearHistory}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </SettingItem>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {saveStatus && (
            <div
              className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-lg ${
                saveStatus.type === "success"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : saveStatus.type === "error"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              }`}
            >
              {saveStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{saveStatus.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
