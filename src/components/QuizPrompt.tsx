import React from 'react';
import { Brain, Trophy, Star } from 'lucide-react';

interface QuizPromptProps {
  topic: string;
  onTakeQuiz: () => void;
  onSkip: () => void;
}

export const QuizPrompt: React.FC<QuizPromptProps> = ({
  topic,
  onTakeQuiz,
  onSkip
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg ml-12 mt-4">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            🧠 Test Your Knowledge!
          </h3>
          <p className="text-gray-600 mb-4">
            Great! You just learned about <span className="font-semibold text-purple-600">{topic}</span>. 
            Want to test your understanding with a quick quiz?
          </p>
          
          <div className="flex items-center space-x-6 mb-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>Earn points</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-purple-500" />
              <span>5 questions</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500">●</span>
              <span>Immediate feedback</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onTakeQuiz}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎯 Take Quiz Now
            </button>
            <button
              onClick={onSkip}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 