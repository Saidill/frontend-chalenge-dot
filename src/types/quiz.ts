export interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface QuizQuestion extends Question {
  id: string;
  answers: string[];
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: { [key: number]: string };
  startTime: number;
  timeRemaining: number;
  isCompleted: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  answeredQuestions: number;
  score: number;
}

export interface QuizHistory extends QuizResult {
  timestamp: number;
  username: string | null;
}
