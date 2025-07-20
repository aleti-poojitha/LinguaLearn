import React, { useState } from 'react';
import { X, TrendingUp, Clock, Trophy, Star, BookOpen, Target, Calendar } from 'lucide-react';
import { UserProgress, Subject } from '../types';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isOpen,
  onClose,
  userProgress
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'achievements'>('overview');

  if (!isOpen) return null;

  const getSubjectIcon = (subject: Subject) => {
    const icons = {
      science: '🔬',
      math: '🧮',
      social: '🌍',
      english: '📚',
      general: '🌟',
      stories: '📖',
      games: '🎮'
    };
    return icons[subject];
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const TabButton: React.FC<{ id: string; label: string; icon: React.ReactNode; active: boolean; onClick: () => void }> = 
    ({ id, label, icon, active, onClick }) => (
      <button
        onClick={onClick}
        className={`
          flex items-center space-x-2 px-4 py-3 rounded-2xl font-medium transition-all duration-200
          ${active 
            ? 'bg-purple-500 text-white shadow-lg' 
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }
        `}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <p className="opacity-90">Your learning progress</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close dashboard"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-2 overflow-x-auto">
            <TabButton
              id="overview"
              label="Overview"
              icon={<TrendingUp className="w-5 h-5" />}
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              id="progress"
              label="Progress"
              icon={<Target className="w-5 h-5" />}
              active={activeTab === 'progress'}
              onClick={() => setActiveTab('progress')}
            />
            <TabButton
              id="achievements"
              label="Achievements"
              icon={<Trophy className="w-5 h-5" />}
              active={activeTab === 'achievements'}
              onClick={() => setActiveTab('achievements')}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-2xl p-4 text-center">
                  <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-800">{userProgress.level}</div>
                  <div className="text-sm text-purple-600">Current Level</div>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-800">{userProgress.streak || 0}</div>
                  <div className="text-sm text-green-600">Day Streak</div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-800">{userProgress.totalPoints}</div>
                  <div className="text-sm text-orange-600">Total Points</div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-800">{userProgress.quizzesCompleted || 0}</div>
                  <div className="text-sm text-blue-600">Quizzes Completed</div>
                </div>
              </div>

              {/* Recent Activity */}
              {userProgress.lastQuizDate && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Last Quiz</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(userProgress.lastQuizDate).toLocaleDateString()} at{' '}
                        {new Date(userProgress.lastQuizDate).toLocaleTimeString()}
                      </p>
                      </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Subject Progress</h3>
              {Object.entries(userProgress.subjectProgress).map(([subject, progress]: [string, any]) => (
                <div key={subject} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getSubjectIcon(subject as Subject)}</span>
                      <div>
                        <h4 className="font-bold text-gray-800 capitalize">{subject}</h4>
                        <p className="text-sm text-gray-600">Level {progress.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{progress.points} pts</div>
                      <div className="text-sm text-gray-600">
                        {progress.quizzesCompleted || 0} quizzes • {formatTime(progress.timeSpent)}
                      </div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-purple-100 rounded-full h-3">
                      <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full"
                      style={{ width: `${Math.min(100, (progress.points / 1000) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userProgress.achievements && userProgress.achievements.length > 0 ? (
                  userProgress.achievements.map((reward, idx) => (
                    <div key={idx} className="bg-yellow-50 rounded-2xl p-4 text-center">
                      <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-yellow-700">{reward.title}</div>
                      <div className="text-sm text-yellow-600">{reward.description}</div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center text-gray-500">No achievements yet. Keep learning!</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;