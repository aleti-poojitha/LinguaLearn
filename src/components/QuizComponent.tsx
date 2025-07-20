import React, { useState } from 'react';
import { Quiz, AppSettings } from '../types';
import { CheckCircle, XCircle, Trophy, Star } from 'lucide-react';

interface QuizComponentProps {
  quiz: Quiz;
  onAnswer: (answer: number) => void;
  settings: AppSettings;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({
  quiz,
  onAnswer,
  settings
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setIsCorrect(answerIndex === quiz.correctAnswer);
    setShowResult(true);
    onAnswer(answerIndex);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-400 to-emerald-500';
      case 'medium': return 'from-yellow-400 to-orange-500';
      case 'hard': return 'from-red-400 to-pink-500';
      default: return 'from-blue-400 to-cyan-500';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-current text-yellow-400" />
    ));
  };

  return (
    <div className={`
      bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 ml-12
      ${settings.reducedMotion ? '' : 'animate-fadeIn'}
    `}>
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium text-white
            bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)}
          `}>
            {quiz.difficulty.toUpperCase()}
          </div>
          <div className="flex items-center space-x-1">
            {getDifficultyStars(quiz.difficulty)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-purple-600">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-medium">{quiz.points} pts</span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-bold text-gray-800 mb-6">
        🤔 {quiz.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={showResult}
            className={`
              w-full p-4 rounded-2xl text-left transition-all duration-300 border-2
              ${showResult
                ? index === quiz.correctAnswer
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : index === selectedAnswer && !isCorrect
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'bg-gray-100 border-gray-200 text-gray-600'
                : 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 text-purple-800'
              }
              ${selectedAnswer === index && !showResult ? 'bg-purple-200 border-purple-400' : ''}
              ${settings.reducedMotion ? '' : 'hover:scale-102 hover:shadow-md'}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {showResult && (
                <div>
                  {index === quiz.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : index === selectedAnswer && !isCorrect ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : null}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Result */}
      {showResult && (
        <div className={`
          p-4 rounded-2xl border-2
          ${isCorrect 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-orange-50 border-orange-200 text-orange-800'
          }
          ${settings.reducedMotion ? '' : 'animate-slideUp'}
        `}>
          <div className="flex items-center space-x-2 mb-2">
            {isCorrect ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-bold">Excellent! 🎉</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-orange-600" />
                <span className="font-bold">Good try! 💪</span>
              </>
            )}
          </div>
          <p className="text-sm leading-relaxed">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
};