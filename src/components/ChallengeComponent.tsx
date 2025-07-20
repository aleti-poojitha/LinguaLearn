import React from 'react';
import { Challenge, AppSettings } from '../types';
import { Target, Clock, Trophy, Star, Zap } from 'lucide-react';

interface ChallengeComponentProps {
  challenge: Challenge;
  onAccept: () => void;
  settings: AppSettings;
}

export const ChallengeComponent: React.FC<ChallengeComponentProps> = ({
  challenge,
  onAccept,
  settings
}) => {
  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Target className="w-6 h-6" />;
      case 'weekly': return <Trophy className="w-6 h-6" />;
      case 'special': return <Zap className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getChallengeGradient = (type: string) => {
    switch (type) {
      case 'daily': return 'from-blue-400 to-cyan-500';
      case 'weekly': return 'from-purple-400 to-pink-500';
      case 'special': return 'from-yellow-400 to-orange-500';
      default: return 'from-green-400 to-emerald-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatTimeRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    
    const now = new Date();
    const timeLeft = deadline.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    
    if (hoursLeft < 1) return 'Less than 1 hour left!';
    if (hoursLeft < 24) return `${hoursLeft} hours left`;
    
    const daysLeft = Math.floor(hoursLeft / 24);
    return `${daysLeft} days left`;
  };

  return (
    <div className={`
      bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm 
      rounded-3xl p-6 shadow-xl border border-white/30 ml-12
      ${settings.reducedMotion ? '' : 'animate-fadeIn hover:shadow-2xl transition-all duration-300'}
    `}>
      {/* Challenge Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg
            bg-gradient-to-r ${getChallengeGradient(challenge.type)}
          `}>
            {getChallengeIcon(challenge.type)}
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-gray-800">{challenge.title}</h3>
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium capitalize
                ${getDifficultyColor(challenge.difficulty)}
              `}>
                {challenge.difficulty}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{challenge.points} points</span>
              </div>
              
              {challenge.deadline && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{formatTimeRemaining(challenge.deadline)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Challenge Type Badge */}
        <div className={`
          px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide
          bg-gradient-to-r ${getChallengeGradient(challenge.type)}
        `}>
          {challenge.type}
        </div>
      </div>

      {/* Challenge Description */}
      <div className="bg-white/80 rounded-2xl p-4 mb-6">
        <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
      </div>

      {/* Challenge Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-2xl">
          <div className="text-2xl font-bold text-blue-600">{challenge.points}</div>
          <div className="text-xs text-blue-500 font-medium">Points</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-2xl">
          <div className="text-2xl font-bold text-purple-600 capitalize">{challenge.difficulty}</div>
          <div className="text-xs text-purple-500 font-medium">Difficulty</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-2xl">
          <div className="text-2xl font-bold text-green-600 capitalize">{challenge.type}</div>
          <div className="text-xs text-green-500 font-medium">Type</div>
        </div>
      </div>

      {/* Action Button */}
      {!challenge.completed ? (
        <button
          onClick={onAccept}
          className={`
            w-full bg-gradient-to-r ${getChallengeGradient(challenge.type)} 
            text-white py-4 rounded-2xl font-bold text-lg shadow-lg
            hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2
            ${settings.reducedMotion ? '' : 'hover:scale-105'}
          `}
        >
          <Zap className="w-5 h-5" />
          <span>Accept Challenge! 🚀</span>
        </button>
      ) : (
        <div className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg text-center">
          ✅ Challenge Completed! 🎉
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 italic">
          "Every challenge is an opportunity to grow! 🌱"
        </p>
      </div>
    </div>
  );
};