import { useState, useEffect } from "react";

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
  },
];

const CyberDojo = ({ onClose }) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null); // 'correct' or 'wrong'
  const [finished, setFinished] = useState(false);

  // 1. FETCH AI QUESTIONS ON MOUNT
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/generate-quiz");
        if (!res.ok) throw new Error("AI Failed");
        const data = await res.json();
        setScenarios(data);
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
    if (isCorrect) setScore(score + 1);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700 relative flex flex-col min-h-[500px]">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🥋 Cyber Dojo{" "}
              <span className="text-sm font-normal text-slate-400">
                | AI Training Simulation
              </span>
            </h2>
            {!loading && !finished && (
              <p className="text-slate-400 text-xs mt-1">
                Scenario {index + 1} of {scenarios.length}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-2xl"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 flex-grow flex flex-col justify-center">
          {loading ? (
            // LOADING STATE
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-white animate-pulse">
                Consulting Neural Network...
              </h3>
              <p className="text-slate-400 mt-2">
                Generating fresh phishing scenarios for you.
              </p>
            </div>
          ) : !finished ? (
            // GAMEPLAY STATE
            <>
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-8 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex justify-between mb-4">
                  <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-500/30">
                    {current.type}
                  </span>
                  <span className="text-slate-500 text-xs font-mono">
                    {current.sender}
                  </span>
                </div>
                <p className="text-lg text-slate-200 font-medium leading-relaxed font-mono">
                  "{current.content}"
                </p>
              </div>

              {/* ANSWER BUTTONS */}
              {!answered && (
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => handleGuess(false)}
                    className="py-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/50 font-bold text-lg transition-all transform hover:scale-[1.02]"
                  >
                    ✅ Looks Safe
                  </button>
                  <button
                    onClick={() => handleGuess(true)}
                    className="py-4 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 font-bold text-lg transition-all transform hover:scale-[1.02]"
                  >
                    💀 It's Phishing!
                  </button>
                </div>
              )}

              {/* FEEDBACK */}
              {answered && (
                <div
                  className={`p-6 rounded-xl animate-fade-in-up border ${answered === "correct" ? "bg-green-900/10 border-green-500/50" : "bg-red-900/10 border-red-500/50"}`}
                >
                  <h3
                    className={`text-xl font-bold mb-2 ${answered === "correct" ? "text-green-400" : "text-red-400"}`}
                  >
                    {answered === "correct" ? "🎉 Correct!" : "❌ Oops!"}
                  </h3>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {current.explanation}
                  </p>
                  <button
                    onClick={nextQuestion}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition-all"
                  >
                    Next Scenario ➡
                  </button>
                </div>
              )}
            </>
          ) : (
            // RESULTS STATE
            <div className="text-center animate-fade-in-up">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Training Complete!
              </h2>
              <p className="text-slate-400 mb-8">
                You scored{" "}
                <span className="text-blue-400 font-bold text-2xl mx-1">
                  {score} / {scenarios.length}
                </span>
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={onClose}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Reset and fetch NEW questions
                    setFinished(false);
                    setLoading(true);
                    setIndex(0);
                    setScore(0);
                    setAnswered(null);
                    // Re-run the fetch effect by remounting or calling a fetch function
                    // Simple way: Reload the component logic
                    const fetchQuiz = async () => {
                      try {
                        const res = await fetch(
                          "http://localhost:5000/api/generate-quiz",
                        );
                        if (!res.ok) throw new Error("AI Failed");
                        const data = await res.json();
                        setScenarios(data);
                      } catch (err) {
                        setScenarios(FALLBACK_SCENARIOS);
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchQuiz();
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
                >
                  🔄 New Training Round
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
