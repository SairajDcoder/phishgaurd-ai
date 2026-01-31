import { useState, useEffect } from "react";
import {
  Trophy,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Star,
  Target,
  Shield,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// FALLBACK DATA (In case AI fails or is slow)
const FALLBACK_SCENARIOS = [
  {
    id: 1,
    type: "Email",
    sender: "security@paypaI-support.com",
    content:
      "Urgent: Your account is locked. Click here to verify identity: http://bit.ly/secure-paypal",
    isPhishing: true,
    explanation:
      "Look at the sender! 'paypaI' uses a capital 'I' instead of 'l'. Also, legitimate companies never use bit.ly links for security.",
    difficulty: "Hard",
  },
  {
    id: 2,
    type: "SMS",
    sender: "Amazon",
    content:
      "Your package #39921 will be delivered today between 2-4 PM. Track here: https://amazon.com/track/39921",
    isPhishing: false,
    explanation:
      "This is a standard notification. The domain is 'amazon.com' (safe) and there is no urgent threat demanding a login.",
    difficulty: "Easy",
  },
  {
    id: 3,
    type: "Pop-up",
    sender: "System Alert",
    content:
      "YOUR COMPUTER IS INFECTED! Call Microsoft Support immediately at 1-800-123-4567 to remove the virus.",
    isPhishing: true,
    explanation:
      "Tech support scams always ask you to call a number. Microsoft/Apple will NEVER ask you to call them via a pop-up.",
    difficulty: "Medium",
  },
];

const CyberDojo = ({ onClose }) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);

  // 1. FETCH AI QUESTIONS ON MOUNT
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/generate-quiz");
        if (!res.ok) throw new Error("AI Failed");
        const data = await res.json();
        // Add difficulty levels if not present
        const enhancedData = data.map((scenario, i) => ({
          ...scenario,
          difficulty: ["Easy", "Medium", "Hard"][i % 3],
        }));
        setScenarios(enhancedData);
      } catch (err) {
        console.warn("Using fallback questions due to error:", err);
        setScenarios(FALLBACK_SCENARIOS);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  const current = scenarios[index];

  const handleGuess = (guessIsPhishing) => {
    const isCorrect = guessIsPhishing === current.isPhishing;
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
    setAnswered(isCorrect ? "correct" : "wrong");
  };

  const nextQuestion = () => {
    if (index + 1 < scenarios.length) {
      setIndex(index + 1);
      setAnswered(null);
    } else {
      setFinished(true);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
      case "Medium":
        return "text-amber-400 bg-amber-400/10 border-amber-400/30";
      case "Hard":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/95 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-800 relative flex flex-col min-h-[600px] max-h-[90vh]">
        {/* HEADER */}
        <div className="relative p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Cyber Dojo</h2>
                  <p className="text-gray-400 text-sm">
                    AI-Powered Phishing Training
                  </p>
                </div>
              </div>

              {!loading && !finished && (
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                        style={{
                          width: `${((index + 1) / scenarios.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium">
                      {index + 1}/{scenarios.length}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">
                      Streak:{" "}
                      <span className="font-bold text-amber-400">{streak}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            // LOADING STATE
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-800 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <h3 className="text-xl font-bold text-white mt-6 mb-2">
                Generating Training Scenarios
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Our AI is creating realistic phishing scenarios based on current
                threat intelligence...
              </p>
            </div>
          ) : !finished ? (
            // GAMEPLAY STATE
            <div className="space-y-8">
              {/* SCENARIO CARD */}
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1 rounded-full border text-xs font-semibold ${getDifficultyColor(current.difficulty)}`}
                    >
                      {current.difficulty}
                    </div>
                    <div className="text-sm text-gray-500">
                      Scenario #{current.id}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Target className="w-4 h-4" />
                    <span className="font-medium">{current.type}</span>
                    <span className="mx-1">•</span>
                    <span className="font-mono">{current.sender}</span>
                  </div>
                </div>

                <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl text-gray-600 mt-1">"</div>
                    <p className="text-lg text-gray-200 leading-relaxed font-medium">
                      {current.content}
                    </p>
                    <div className="text-2xl text-gray-600 mt-1">"</div>
                  </div>
                </div>

                {/* ANSWER BUTTONS */}
                {!answered && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleGuess(false)}
                      className="group p-5 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 flex flex-col items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className="text-lg font-semibold text-white">
                        Looks Safe
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        Legitimate communication
                      </span>
                    </button>

                    <button
                      onClick={() => handleGuess(true)}
                      className="group p-5 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-red-500/50 transition-all duration-300 flex flex-col items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <span className="text-lg font-semibold text-white">
                        It's Phishing!
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        Malicious attempt detected
                      </span>
                    </button>
                  </div>
                )}

                {/* FEEDBACK */}
                {answered && (
                  <div
                    className={`mt-6 p-6 rounded-xl border animate-fade-in ${answered === "correct" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${answered === "correct" ? "bg-emerald-500/20" : "bg-red-500/20"}`}
                      >
                        {answered === "correct" ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3
                          className={`text-xl font-bold mb-2 ${answered === "correct" ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {answered === "correct"
                            ? "Excellent Detection!"
                            : "Careful Analysis Needed"}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {current.explanation}
                        </p>

                        <button
                          onClick={nextQuestion}
                          className="mt-6 w-full py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-gray-700"
                        >
                          {index + 1 < scenarios.length ? (
                            <>
                              Next Challenge
                              <ChevronRight className="w-4 h-4" />
                            </>
                          ) : (
                            "View Results"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // RESULTS STATE
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-amber-400" />
                </div>
                {score === scenarios.length && (
                  <div className="absolute -top-2 -right-2 animate-pulse">
                    <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 text-center">
                Training Complete!
              </h2>

              <div className="text-center mb-8">
                <p className="text-gray-400 text-lg mb-2">Your final score</p>
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {score}
                  <span className="text-gray-600">/{scenarios.length}</span>
                </div>
                <p className="text-gray-500 mt-4">
                  {score === scenarios.length
                    ? "Perfect score! You're a phishing detection master!"
                    : score >= scenarios.length * 0.7
                      ? "Great job! You have strong security awareness."
                      : "Good effort! Keep training to improve your detection skills."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {score}
                  </div>
                  <div className="text-sm text-gray-500">Correct Answers</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {streak}
                  </div>
                  <div className="text-sm text-gray-500">Max Streak</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {Math.round((score / scenarios.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all border border-gray-700"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => {
                    setFinished(false);
                    setLoading(true);
                    setIndex(0);
                    setScore(0);
                    setStreak(0);
                    setAnswered(null);

                    const fetchQuiz = async () => {
                      try {
                        const res = await fetch(
                          "http://localhost:5000/api/generate-quiz",
                        );
                        if (!res.ok) throw new Error("AI Failed");
                        const data = await res.json();
                        const enhancedData = data.map((scenario, i) => ({
                          ...scenario,
                          difficulty: ["Easy", "Medium", "Hard"][i % 3],
                        }));
                        setScenarios(enhancedData);
                      } catch (err) {
                        setScenarios(FALLBACK_SCENARIOS);
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchQuiz();
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Training Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CyberDojo;
