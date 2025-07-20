import React, { useState } from 'react';
import { X, Star, Heart } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback?: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback);
      setRating(0);
      setFeedback('');
      onClose();
    }
  };

  const emojis = ['😢', '😕', '😐', '😊', '😍'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-purple-800">How did I do? 🤔</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Your feedback helps me learn and improve! 🌟
          </p>
          
          <div className="flex justify-center space-x-2 mb-4">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => setRating(index + 1)}
                className={`
                  text-4xl p-2 rounded-full transition-all duration-200
                  ${rating === index + 1 ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'}
                `}
              >
                {emoji}
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="flex items-center justify-center space-x-1 text-purple-600">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < rating ? 'fill-current' : 'opacity-30'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell me what you liked or what I can improve... 💭"
            className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-24"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            Maybe Later
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Heart className="w-4 h-4" />
            <span>Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
};