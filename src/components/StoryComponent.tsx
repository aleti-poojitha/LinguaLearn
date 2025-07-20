import React, { useState } from 'react';
import { Story, AppSettings } from '../types';
import { Book, Users, Heart, ArrowRight } from 'lucide-react';

interface StoryComponentProps {
  story: Story;
  onAction: (action: string) => void;
  settings: AppSettings;
}

export const StoryComponent: React.FC<StoryComponentProps> = ({
  story,
  onAction,
  settings
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);

  const pages = story.content.split('\n\n').filter(page => page.trim());

  const handleStartReading = () => {
    setIsReading(true);
    onAction('start_reading');
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      onAction('next_page');
    } else {
      onAction('story_complete');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      onAction('previous_page');
    }
  };

  return (
    <div className={`
      bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 
      backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 ml-12
      ${settings.reducedMotion ? '' : 'animate-fadeIn'}
    `}>
      {!isReading ? (
        /* Story Preview */
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            📖 {story.title}
          </h3>
          
          {/* Characters */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 text-purple-600">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Characters:</span>
            </div>
            <div className="flex space-x-2">
              {story.characters.map((character, index) => (
                <div key={index} className="flex items-center space-x-1 bg-white/80 rounded-full px-3 py-1">
                  <span className="text-lg">{character.avatar}</span>
                  <span className="text-sm font-medium text-gray-700">{character.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Story Illustrations Preview */}
          {story.illustrations.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              {story.illustrations.slice(0, 3).map((illustration, index) => (
                <div key={index} className="aspect-square rounded-2xl overflow-hidden shadow-md">
                  <img 
                    src={illustration} 
                    alt={`Story illustration ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleStartReading}
            className={`
              bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold
              shadow-lg hover:shadow-xl transition-all duration-300
              ${settings.reducedMotion ? '' : 'hover:scale-105'}
            `}
          >
            Start Reading! ✨
          </button>
        </div>
      ) : (
        /* Story Reader */
        <div>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-purple-600 mb-2">
              <span>Page {currentPage + 1} of {pages.length}</span>
              <span>{Math.round(((currentPage + 1) / pages.length) * 100)}% complete</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Story Content */}
          <div className="bg-white/80 rounded-2xl p-6 mb-6 min-h-[200px]">
            <p className="text-gray-800 leading-relaxed text-lg">
              {pages[currentPage]}
            </p>
          </div>

          {/* Story Illustration */}
          {story.illustrations[currentPage] && (
            <div className="mb-6">
              <img 
                src={story.illustrations[currentPage]} 
                alt={`Story illustration for page ${currentPage + 1}`}
                className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className={`
                px-6 py-3 rounded-2xl font-medium transition-all duration-300
                ${currentPage === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }
              `}
            >
              ← Previous
            </button>

            <div className="flex space-x-2">
              {pages.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${index === currentPage ? 'bg-purple-500' : 'bg-purple-200'}
                  `}
                />
              ))}
            </div>

            <button
              onClick={handleNextPage}
              className={`
                px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-2
                bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg
                ${settings.reducedMotion ? '' : 'hover:scale-105'}
              `}
            >
              <span>{currentPage === pages.length - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Moral of the story */}
          {currentPage === pages.length - 1 && story.moral && (
            <div className={`
              mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-2 border-yellow-200
              ${settings.reducedMotion ? '' : 'animate-slideUp'}
            `}>
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-800">Moral of the Story:</span>
              </div>
              <p className="text-orange-700 leading-relaxed">{story.moral}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};