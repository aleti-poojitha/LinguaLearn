import React from 'react';
import { Bot } from 'lucide-react';
import { AppSettings } from '../types';

interface TypingIndicatorProps {
  settings: AppSettings;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ settings }) => {
  const getThemeGradient = () => {
    const gradients = {
      default: 'from-purple-100 to-pink-100',
      ocean: 'from-blue-100 to-cyan-100',
      forest: 'from-green-100 to-emerald-100',
      sunset: 'from-orange-100 to-pink-100',
      space: 'from-indigo-100 to-purple-100'
    };
    return gradients[settings.theme] || gradients.default;
  };

  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-start space-x-3">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <img
            src="/logo.png"
            alt="LinguaLearn Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', background: 'white' }}
          />
        </div>
        
        <div className={`
          bg-gradient-to-br ${getThemeGradient()} rounded-3xl px-6 py-4 shadow-lg backdrop-blur-sm border border-white/20
        `}>
          <div className="flex items-center space-x-2">
            <span className="text-purple-700 text-sm font-medium">Lingo is thinking</span>
            <div className="flex space-x-1">
              <div className={`
                w-2 h-2 bg-purple-400 rounded-full 
                ${settings.reducedMotion ? 'opacity-60' : 'animate-bounce'}
              `} />
              <div className={`
                w-2 h-2 bg-purple-400 rounded-full 
                ${settings.reducedMotion ? 'opacity-60' : 'animate-bounce'}
              `} style={{ animationDelay: '0.1s' }} />
              <div className={`
                w-2 h-2 bg-purple-400 rounded-full 
                ${settings.reducedMotion ? 'opacity-60' : 'animate-bounce'}
              `} style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};