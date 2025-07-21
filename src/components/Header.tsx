import React, { useState } from 'react';
import { Settings, MessageCircle, Trophy, User, Home } from 'lucide-react';
import { Subject, UserProgress, Language } from '../types';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  selectedSubject: Subject;
  userProgress: UserProgress;
  currentLanguage: Language;
  onSettingsClick: () => void;
  onFeedbackClick: () => void;
  onDashboardClick: () => void;
  onHomeClick: () => void;
  user?: import('../types').User | null;
  onLoginClick?: () => void;
  onProfileSave?: (updatedUser: import('../types').User) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedSubject,
  userProgress,
  currentLanguage,
  onSettingsClick,
  onFeedbackClick,
  onDashboardClick,
  onHomeClick,
  user,
  onLoginClick,
  onProfileSave
}) => {
  const getSubjectEmoji = (subject: Subject) => {
    const emojis = {
      science: '🔬',
      math: '🧮',
      social: '🌍',
      english: '📚',
      stories: '📖',
      sports: '🏆',
      explore: '✨'
    };
    return emojis[subject];
  };

  const getLanguageFlag = (lang: Language) => {
    const flags = {
      en: '🇺🇸',
      hi: '🇮🇳',
      te: '🏛️',
      ta: '🏛️',
      kn: '🏛️',
      ml: '🏛️',
      gu: '🏛️',
      bn: '🏛️'
    };
    return flags[lang];
  };

  const getLevelColor = (level: number) => {
    if (level < 5) return 'from-green-400 to-emerald-500';
    if (level < 10) return 'from-blue-400 to-cyan-500';
    if (level < 15) return 'from-purple-400 to-violet-500';
    return 'from-yellow-400 to-orange-500';
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-100/50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onHomeClick}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-0"
            >
              <img
                src="/logo.png"
                alt="LinguaLearn Logo"
                style={{ width: 40, height: 40, borderRadius: '12px' }}
              />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LinguaLearn
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-purple-600">
                  {getSubjectEmoji(selectedSubject)} Learning Assistant
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {getLanguageFlag(currentLanguage)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center space-x-3 bg-white/80 rounded-2xl px-4 py-2 shadow-md">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getLevelColor(userProgress.level)} flex items-center justify-center text-white font-bold text-sm`}>
                  {userProgress.level}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">Level {userProgress.level}</div>
                  <div className="text-xs text-gray-600">{userProgress.totalPoints} pts</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">{userProgress.streak}</span>
              </div>
            </div>
            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center space-x-2 bg-white/80 rounded-2xl px-3 py-1 shadow-md cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                  {user.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="p-2 rounded-2xl bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 transition-all duration-300 shadow-md hover:shadow-lg text-green-700 font-semibold"
              >
                Login / Sign Up
              </button>
            )}
            {/* Action Buttons */}
            <button
              onClick={onDashboardClick}
              className="p-3 rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 transition-all duration-300 shadow-md hover:shadow-lg"
              title="Dashboard"
              aria-label="Open dashboard"
            >
              <User className="w-5 h-5 text-blue-600" />
            </button>
            
            <button
              onClick={onFeedbackClick}
              className="p-3 rounded-2xl bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 transition-all duration-300 shadow-md hover:shadow-lg"
              title="Give Feedback"
              aria-label="Give feedback"
            >
              <MessageCircle className="w-5 h-5 text-orange-600" />
            </button>
            
            <button
              onClick={onSettingsClick}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-all duration-300 shadow-md hover:shadow-lg"
              title="Settings"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5 text-purple-600" />
            </button>
          </div>
        </div>
      </div>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user!} onSave={onProfileSave ?? (() => {})} onLogout={() => { localStorage.removeItem('token'); onLoginClick && onLoginClick(); }} />
    </header>
  );
};