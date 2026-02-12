import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triviaApi } from '../services/triviaApi';
import { storage } from '../utils/storage';
import type { QuizState} from '../types/quiz';
import { QuestionCard } from '../components/QuestionCard';
import { Timer } from '../components/Timer';
import { Loader2, LogOut, RotateCcw } from 'lucide-react';

const QUIZ_DURATION = 3 * 60;
const TOTAL_QUESTIONS = 10;

export const Quiz = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const username = storage.getUser();

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
    const savedState = storage.getQuizState();
    if (savedState && savedState.questions.length > 0 && !savedState.isCompleted) {
      setShowResumeDialog(true);
      setIsLoading(false);
    } else {
      startNewQuiz();
    }
  }, [username, navigate]);

  const startNewQuiz = async () => {
    setIsLoading(true);
    try {
      const questions = await triviaApi.getQuestions(TOTAL_QUESTIONS);
      const newState: QuizState = {
        questions,
        currentQuestionIndex: 0,
        userAnswers: {},
        startTime: Date.now(),
        timeRemaining: QUIZ_DURATION,
        isCompleted: false,
      };
      setQuizState(newState);
      storage.saveQuizState(newState);
    } catch (error) {
      console.error('Error loading quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz';
      
      if (confirm(`${errorMessage}\n\nWould you like to try again?`)) {
        // Retry after a short delay
        setTimeout(() => startNewQuiz(), 2000);
      } else {
        // Go back to login
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resumeQuiz = () => {
    const savedState = storage.getQuizState();
    if (savedState) {
      const timeElapsed = Math.floor((Date.now() - savedState.startTime) / 1000);
      const timeRemaining = Math.max(0, QUIZ_DURATION - timeElapsed);
      
      setQuizState({
        ...savedState,
        timeRemaining,
      });
    }
    setShowResumeDialog(false);
  };

  const handleAnswer = (answer: string) => {
    if (!quizState) return;

    const updatedAnswers = {
      ...quizState.userAnswers,
      [quizState.currentQuestionIndex]: answer,
    };

    const nextIndex = quizState.currentQuestionIndex + 1;
    const isLastQuestion = nextIndex >= quizState.questions.length;

    const updatedState: QuizState = {
      ...quizState,
      userAnswers: updatedAnswers,
      currentQuestionIndex: isLastQuestion ? quizState.currentQuestionIndex : nextIndex,
      isCompleted: isLastQuestion,
    };

    setQuizState(updatedState);
    storage.saveQuizState(updatedState);

    if (isLastQuestion) {
      setTimeout(() => {
        completeQuiz(updatedState);
      }, 500);
    }
  };

  const handleTimeUp = () => {
    if (quizState) {
      const completedState = { ...quizState, isCompleted: true };
      setQuizState(completedState);
      completeQuiz(completedState);
    }
  };

  const completeQuiz = (state: QuizState) => {
    const result = calculateResult(state);
    storage.saveQuizHistory(result);
    storage.clearQuizState();
    navigate('/result', { state: result });
  };

  const calculateResult = (state: QuizState) => {
    const answeredQuestions = Object.keys(state.userAnswers).length;
    let correctAnswers = 0;

    Object.entries(state.userAnswers).forEach(([index, answer]) => {
      const question = state.questions[parseInt(index)];
      if (question.correct_answer === answer) {
        correctAnswers++;
      }
    });

    return {
      totalQuestions: state.questions.length,
      correctAnswers,
      wrongAnswers: answeredQuestions - correctAnswers,
      answeredQuestions,
      score: Math.round((correctAnswers / state.questions.length) * 100),
    };
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? Your current progress will be saved.')) {
      navigate('/');
    }
  };

  if (showResumeDialog) {
    const savedState = storage.getQuizState();
    const answeredCount = savedState ? Object.keys(savedState.userAnswers).length : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Resume Quiz?</h2>
            <p className="text-gray-600">
              You have an unfinished quiz with {answeredCount} questions answered.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={resumeQuiz}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Resume Quiz
            </button>
            <button
              onClick={startNewQuiz}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Start New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !quizState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-800 font-semibold text-lg mb-2">Loading your quiz...</p>
          <p className="text-gray-600 text-sm">This may take a few seconds</p>
          <div className="mt-4 text-xs text-gray-500">
            <p>💡 Tip: Questions are being fetched from Open Trivia DB</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const answeredCount = Object.keys(quizState.userAnswers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="bg-white rounded-lg shadow-md px-4 py-3">
            <p className="text-sm text-gray-600">Welcome back,</p>
            <p className="text-lg font-bold text-gray-800">{username}</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-white text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 shadow-md"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <Timer
          initialTime={quizState.timeRemaining}
          onTimeUp={handleTimeUp}
          isActive={!quizState.isCompleted}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Total Questions</p>
            <p className="text-2xl font-bold text-gray-800">{quizState.questions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Answered</p>
            <p className="text-2xl font-bold text-blue-600">{answeredCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-2xl font-bold text-orange-600">
              {quizState.questions.length - answeredCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Current</p>
            <p className="text-2xl font-bold text-purple-600">
              {quizState.currentQuestionIndex + 1}
            </p>
          </div>
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
          onAnswer={handleAnswer}
          selectedAnswer={quizState.userAnswers[quizState.currentQuestionIndex]}
        />
      </div>
    </div>
  );
};