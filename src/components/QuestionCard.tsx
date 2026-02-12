import type { QuizQuestion } from '../types/quiz';
import { CheckCircle2, Circle } from 'lucide-react';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  selectedAnswer?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  selectedAnswer,
}) => {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-t-xl shadow-lg p-6 border-b-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-blue-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[question.difficulty as keyof typeof difficultyColors]}`}>
              {question.difficulty.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {question.type === 'multiple' ? 'Multiple Choice' : 'True/False'}
            </span>
          </div>
        </div>
        
        <div className="mb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Category</p>
          <p className="text-sm font-medium text-gray-700">{question.category}</p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-lg">
        <h2 
          className="text-2xl font-bold text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
      </div>
      <div className="bg-white rounded-b-xl shadow-lg p-6 space-y-3">
        {question.answers.map((answer, index) => {
          const isSelected = selectedAnswer === answer;
          const letters = ['A', 'B', 'C', 'D'];
          
          return (
            <button
              key={index}
              onClick={() => onAnswer(answer)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group hover:scale-[1.02] ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                isSelected 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
              }`}>
                {letters[index]}
              </div>
              
              <span 
                className={`flex-1 text-base font-medium ${
                  isSelected ? 'text-blue-900' : 'text-gray-700'
                }`}
                dangerouslySetInnerHTML={{ __html: answer }}
              />
              
              {isSelected ? (
                <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300 flex-shrink-0 group-hover:text-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-bold text-gray-800">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};