import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type { QuizResult } from "../types/quiz";
import {
  Target,
  CheckCircle2,
  XCircle,
  Award,
  Home,
  RotateCcw,
} from "lucide-react";
import { storage } from "../utils/storage";

export const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as QuizResult;
  const username = storage.getUser();

  useEffect(() => {
    if (!result || !username) {
      navigate("/");
    }
  }, [result, username, navigate]);

  if (!result) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-blue-500 to-indigo-600";
    if (score >= 40) return "from-orange-500 to-amber-600";
    return "from-red-500 to-rose-600";
  };

  const handlePlayAgain = () => {
    storage.clearQuizState();
    navigate("/quiz");
  };

  const handleGoHome = () => {
    storage.clearQuizState();
    navigate("/");
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div
            className={`bg-gradient-to-r ${getScoreBgColor(result.score)} p-8 text-center`}
          >
            <p className="text-white text-lg font-medium mb-2">Your Score</p>
            <p className="text-white text-6xl font-bold">{result.score}%</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-700 font-medium">
                      Total Questions
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {result.totalQuestions}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Answered
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {result.answeredQuestions}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">
                      Correct Answers
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {result.correctAnswers}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-red-700 font-medium">
                      Wrong Answers
                    </p>
                    <p className="text-3xl font-bold text-red-900">
                      {result.wrongAnswers}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Accuracy
                </span>
                <span
                  className={`text-2xl font-bold ${getScoreColor(result.score)}`}
                >
                  {result.answeredQuestions > 0
                    ? Math.round(
                        (result.correctAnswers / result.answeredQuestions) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreBgColor(result.score)} transition-all duration-1000 rounded-full`}
                  style={{
                    width: `${
                      result.answeredQuestions > 0
                        ? (result.correctAnswers / result.answeredQuestions) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handlePlayAgain}
            className="bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={handleGoHome}
            className="bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
