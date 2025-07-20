import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import SubjectSelector from './components/SubjectSelector';
import { InputBar } from './components/InputBar';
import { SettingsModal } from './components/SettingsModal';
import { FeedbackModal } from './components/FeedbackModal';
import DashboardComponent from './components/Dashboard';
import type { Dashboard } from './types';
import { 
  Message, 
  Subject, 
  AppSettings, 
  UserProgress, 
  VoicePlayback, 
  LearningMode,
  SessionData,
  User
} from './types';
import { getAIResponse } from './utils/aiService';
import LoginPage from './components/LoginPage';
import { translations } from './utils/translations';

function App() {
  // All hooks must be declared at the top, before any return or conditional
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: translations['en'].welcome, // Use English for initial render to avoid settings dependency
      isBot: true,
      timestamp: new Date(),
      subject: 'explore'
    }
  ]);

  // Set initial selectedSubject to undefined so nothing is selected at the start
  const [selectedSubject, setSelectedSubject] = useState<Subject>('explore');
  const [learningMode, setLearningMode] = useState<LearningMode>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showTopicPrompt, setShowTopicPrompt] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState<any>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [revealedCorrectAnswer, setRevealedCorrectAnswer] = useState<number | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    voiceGender: 'female',
    speechSpeed: 1,
    voiceEnabled: true,
    autoTranslate: false,
    showWordHighlighting: true,
    showWaveform: true,
    theme: 'default',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false
  });

  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    level: 1,
    streak: 0,
    lastQuizDate: null,
    quizzesCompleted: 0,
    subjectProgress: {
      science: { level: 1, points: 0, topicsCompleted: [], averageScore: 0, timeSpent: 0, quizzesCompleted: 0 },
      math: { level: 1, points: 0, topicsCompleted: [], averageScore: 0, timeSpent: 0, quizzesCompleted: 0 },
      social: { level: 1, points: 0, topicsCompleted: [], averageScore: 0, timeSpent: 0, quizzesCompleted: 0 },
      english: { level: 1, points: 0, topicsCompleted: [], averageScore: 0, timeSpent: 0, quizzesCompleted: 0 },
      stories: { level: 1, points: 0, topicsCompleted: [], averageScore: 0, timeSpent: 0, quizzesCompleted: 0 },
      sports: { level: 1, points: 0, topicsCompleted: [], averageScore: 0, timeSpent: 0, quizzesCompleted: 0 },
      explore: { level: 1, points: 0, topicsCompleted: [], averageScore: 0, timeSpent: 0, quizzesCompleted: 0 }
    },
    achievements: []
  });

  const [voicePlayback, setVoicePlayback] = useState<VoicePlayback>({
    isPlaying: false,
    currentWord: 0,
    duration: 0,
    currentTime: 0,
    waveformData: []
  });

  const [dashboard, setDashboard] = useState<Dashboard>({
    childName: '',
    totalLearningTime: 0,
    favoriteSubjects: [],
    weeklyProgress: [
      { week: 'Mon', timeSpent: 0, topicsLearned: 0, quizzesCompleted: 0, averageScore: 0 },
      { week: 'Tue', timeSpent: 0, topicsLearned: 0, quizzesCompleted: 0, averageScore: 0 },
      { week: 'Wed', timeSpent: 0, topicsLearned: 0, quizzesCompleted: 0, averageScore: 0 },
      { week: 'Thu', timeSpent: 0, topicsLearned: 0, quizzesCompleted: 0, averageScore: 0 },
      { week: 'Fri', timeSpent: 0, topicsLearned: 0, quizzesCompleted: 0, averageScore: 0 },
      { week: 'Sat', timeSpent: 0, topicsLearned: 0, quizzesCompleted: 0, averageScore: 0 },
      { week: 'Sun', timeSpent: 0, topicsLearned: 0, quizzesCompleted: 0, averageScore: 0 }
    ],
    achievements: [],
    recommendations: []
  });

  const [currentSession, setCurrentSession] = useState<SessionData>({
    id: Date.now().toString(),
    startTime: new Date(),
    messages: [],
    subject: selectedSubject,
    language: settings.language,
    pointsEarned: 0,
    topicsDiscussed: []
  });

  const [currentlyPlayingMessageId, setCurrentlyPlayingMessageId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  // Add a new handler to set both user and userProgress
  const handleLogin = async (user: User, token: string, progress: any) => {
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    try {
      // Always fetch latest progress from backend
      const res = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (data && data.progress) {
        setUserProgress(data.progress);
        localStorage.setItem('progress', JSON.stringify(data.progress));
      } else if (progress) {
        setUserProgress(progress);
        localStorage.setItem('progress', JSON.stringify(progress));
      }
    } catch {
      if (progress) {
        setUserProgress(progress);
        localStorage.setItem('progress', JSON.stringify(progress));
      }
    }
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('progress');
  };

  // On mount, check localStorage for user/token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const progressStr = localStorage.getItem('progress');
    if (token && userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUser(userObj);
        if (progressStr) setUserProgress(JSON.parse(progressStr));
      } catch {}
    }
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: translations[settings.language].welcome,
        isBot: true,
        timestamp: new Date(),
        subject: 'explore'
      }
    ]);
  }, [settings.language]);

  // Add this useEffect for browser/phone back button support
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state) {
        // Default: go to home
        setShowSummary(false);
        setIsQuizActive(false);
        setShowTopicPrompt(false);
        setSelectedSubject('explore');
        setSelectedTopic('');
        return;
      }
      if (state.view === 'summary') {
        setShowSummary(true);
        setIsQuizActive(false);
        setShowTopicPrompt(false);
        setSelectedSubject(state.subject || 'explore');
        setSelectedTopic(state.topic || '');
      } else if (state.view === 'quiz') {
        setIsQuizActive(true);
        setShowSummary(false);
        setShowTopicPrompt(false);
        setSelectedSubject(state.subject || 'explore');
        setSelectedTopic(state.topic || '');
      } else if (state.view === 'topicPrompt') {
        setShowTopicPrompt(true);
        setShowSummary(false);
        setIsQuizActive(false);
        setSelectedSubject(state.subject || 'explore');
        setSelectedTopic(state.topic || '');
      } else {
        // Home
        setShowSummary(false);
        setIsQuizActive(false);
        setShowTopicPrompt(false);
        setSelectedSubject('explore');
        setSelectedTopic('');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // All hooks are now declared above this line

  // Apply theme and font size to document
  useEffect(() => {
    document.documentElement.className = `theme-${settings.theme} font-size-${settings.fontSize}`;
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
  }, [settings.theme, settings.fontSize, settings.highContrast, settings.reducedMotion]);

  // Only after all hooks:
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const handleSendMessage = async (text: string, isVoice: boolean = false) => {
    if (!text.trim() || !selectedSubject) return;
    // If not in summary mode, switch to summary card view
    if (!showSummary) {
      setShowSummary(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
      subject: selectedSubject,
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await getAIResponse(
        text, 
        selectedSubject, 
        settings.language,
        {
          previousMessages: messages.slice(-5).map(m => m.text),
          userLevel: userProgress.level
        }
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isBot: true,
        timestamp: new Date(),
        subject: selectedSubject,
        hasAudio: true,
        illustrations: response.illustrations,
        story: response.story,
        challenge: response.challenge,
        quizPrompt: response.quiz ? {
          topic: response.quiz.topic,
          quizId: response.quiz.id
        } : undefined
      };
      
      // Store the quiz data for later use
      if (response.quiz) {
        setPendingQuiz(response.quiz);
      }

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble understanding right now. Could you please try again? 🤔 Don't worry, I'm here to help you learn!",
        isBot: true,
        timestamp: new Date(),
        subject: selectedSubject
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakMessage = async (text: string, messageId: string) => {
    if (voicePlayback.isPlaying && currentlyPlayingMessageId === messageId) {
      // No-op, ResponsiveVoice handles stopping
      setCurrentlyPlayingMessageId(null);
      return;
    }
    // No-op, ResponsiveVoice handles starting
    setCurrentlyPlayingMessageId(messageId);
  };

  // Update navigation functions to push state
  const handleSubjectChange = (subject: string, topic?: string) => {
    if (topic) {
      setSelectedSubject(subject as Subject);
      setSelectedTopic(topic);
      setShowTopicPrompt(true);
      setShowSummary(false);
      setIsQuizActive(false);
      window.history.pushState({ view: 'topicPrompt', subject, topic }, '');
    } else {
      setSelectedSubject(subject as Subject);
      setShowSummary(true);
      setIsQuizActive(false);
      setShowTopicPrompt(false);
      setSelectedTopic('');
      window.history.pushState({ view: 'summary', subject }, '');
    }
  };

  const handleAskQuestion = () => {
    setShowTopicPrompt(false);
    setShowSummary(true);
    setIsQuizActive(false);
    window.history.pushState({ view: 'summary', subject: selectedSubject, topic: selectedTopic }, '');
  };

  const handlePlayQuiz = async () => {
    setShowTopicPrompt(false);
    setIsQuizActive(true);
    setShowSummary(false);
    setQuizCompleted(false);
    window.history.pushState({ view: 'quiz', subject: selectedSubject, topic: selectedTopic }, '');
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          topic: selectedTopic,
          language: settings.language,
        }),
      });
      const data = await res.json();
      // Normalize questions
      const normalizedQuestions = (data.questions || []).map((q: any) => ({
        ...q,
        correct: q.correct ?? q.correctAnswer ?? 0,
      }));
      setQuizQuestions(normalizedQuestions);
    } catch (err) {
      setQuizQuestions([
        { question: `Sample question 1 about ${selectedTopic}`, options: ['A', 'B', 'C', 'D'], correct: 0, type: 'mcq' },
        { question: `Sample question 2 about ${selectedTopic}`, options: ['True', 'False'], correct: 1, type: 'tf' },
      ]);
    }
  };

  const handleQuizComplete = async (score: number) => {
    const totalQuestions = quizQuestions.length;
    const percentage = (score / totalQuestions) * 100;
    
    // Calculate points based on performance
    let pointsEarned = 0;
    if (percentage >= 80) {
      pointsEarned = 50; // Excellent: 50 points
    } else if (percentage >= 60) {
      pointsEarned = 30; // Good: 30 points
    } else if (percentage >= 40) {
      pointsEarned = 15; // Fair: 15 points
    } else {
      pointsEarned = 5;  // Poor: 5 points (participation)
    }
    
    // Update user progress
    const newTotalPoints = userProgress.totalPoints + pointsEarned;
    const newLevel = Math.floor(newTotalPoints / 100) + 1; // Level up every 100 points
    
    // Update streak (if they completed a quiz today)
    const today = new Date().toDateString();
    const lastQuizDate = userProgress.lastQuizDate ? new Date(userProgress.lastQuizDate).toDateString() : null;
    let newStreak = userProgress.streak;
    
    if (lastQuizDate === today) {
      // Already completed a quiz today, don't increase streak
    } else if (lastQuizDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
      // Completed a quiz yesterday, increase streak
      newStreak += 1;
    } else {
      // Break in streak, reset to 1
      newStreak = 1;
    }
    
    // Update subject-specific progress
    const subjectKey = selectedSubject as keyof typeof userProgress.subjectProgress;
    const defaultProgress = { level: 1, points: 0, topicsCompleted: [], averageScore: 0, timeSpent: 0, quizzesCompleted: 0 };
    const currentSubjectProgress = userProgress.subjectProgress[subjectKey] || defaultProgress;
    
    const updatedProgress = {
      ...userProgress,
      totalPoints: newTotalPoints,
      level: newLevel,
      streak: newStreak,
      lastQuizDate: new Date().toISOString(),
      quizzesCompleted: userProgress.quizzesCompleted + 1,
      subjectProgress: {
        ...userProgress.subjectProgress,
        [subjectKey]: {
          ...currentSubjectProgress,
          points: currentSubjectProgress.points + pointsEarned,
          quizzesCompleted: currentSubjectProgress.quizzesCompleted + 1,
          averageScore: Math.round((currentSubjectProgress.averageScore * currentSubjectProgress.quizzesCompleted + percentage) / (currentSubjectProgress.quizzesCompleted + 1))
        }
      }
    };
    
    setUserProgress(updatedProgress);
    setQuizScore(score);
    setIsQuizActive(false);
    setShowSummary(true);
    setQuizCompleted(true);
    setQuizQuestions([]); // Clear questions to prevent repeat
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setShowQuizFeedback(false);
    setPendingQuiz(null);
    
    // Show completion message
    const completionMessage: Message = {
      id: Date.now().toString(),
      text: `🎉 Quiz completed! You scored ${score}/${totalQuestions} (${Math.round(percentage)}%) and earned ${pointsEarned} points! ${newLevel > userProgress.level ? '🎊 Level up! You\'re now level ' + newLevel + '!' : ''} Keep up the great work!`,
      isBot: true,
      timestamp: new Date(),
      subject: selectedSubject,
      hasAudio: true
    };

    setMessages(prev => [...prev, completionMessage]);
    
    // TODO: Send progress update to backend
    try {
      await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          progress: updatedProgress
        })
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
    localStorage.setItem('progress', JSON.stringify(updatedProgress));
  };

  const handleQuizPromptTakeQuiz = () => {
    if (pendingQuiz) {
      // Normalize questions
      const normalizedQuestions = (pendingQuiz.questions || []).map((q: any) => ({
        ...q,
        correct: q.correct ?? q.correctAnswer ?? 0,
      }));
      setQuizQuestions(normalizedQuestions);
      setIsQuizActive(true);
      setShowSummary(false);
      setCurrentQuizIndex(0);
      setQuizCorrectCount(0);
      setSelectedQuizAnswer(null);
      setShowQuizFeedback(false);
    }
  };

  const handleQuizAnswer = (messageId: string, answer: number) => {
    // If answer is -1, it means "take quiz" was clicked
    if (answer === -1) {
      handleQuizPromptTakeQuiz();
      return;
    }
    
    if (selectedQuizAnswer !== null) return; // Prevent double answer
    setSelectedQuizAnswer(answer);
    setShowQuizFeedback(true);
    const correctIdx = quizQuestions[currentQuizIndex].correctAnswer ?? quizQuestions[currentQuizIndex].correct;
    if (correctIdx === answer) {
      setQuizCorrectCount((prev) => prev + 1);
      setRevealedCorrectAnswer(null);
    } else {
      setRevealedCorrectAnswer(correctIdx);
    }
    setTimeout(() => {
      setShowQuizFeedback(false);
      setSelectedQuizAnswer(null);
      setRevealedCorrectAnswer(null);
      if (currentQuizIndex < quizQuestions.length - 1) {
        setCurrentQuizIndex((prev) => prev + 1);
      } else {
        handleQuizComplete(quizCorrectCount + (correctIdx === answer ? 1 : 0));
        setCurrentQuizIndex(0);
        setQuizCorrectCount(0);
        setPendingQuiz(null); // Clear pending quiz after completion
      }
    }, 1800);
  };

  const handleCustomQuizAnswer = (answerIdx: number) => {
    if (selectedQuizAnswer !== null) return; // Prevent double answer
    setSelectedQuizAnswer(answerIdx);
    setShowQuizFeedback(true);
    const correctIdx = quizQuestions[currentQuizIndex].correct;
    if (correctIdx === answerIdx) {
      setQuizCorrectCount((prev) => prev + 1);
      setRevealedCorrectAnswer(null);
    } else {
      setRevealedCorrectAnswer(correctIdx);
    }
    setTimeout(() => {
      setShowQuizFeedback(false);
      setSelectedQuizAnswer(null);
      setRevealedCorrectAnswer(null);
      if (currentQuizIndex < quizQuestions.length - 1) {
        setCurrentQuizIndex((prev) => prev + 1);
      } else {
        handleQuizComplete(quizCorrectCount + (correctIdx === answerIdx ? 1 : 0));
        setCurrentQuizIndex(0);
        setQuizCorrectCount(0);
        setPendingQuiz(null); // Clear pending quiz after completion
      }
    }, 1800);
  };

  const handleChallengeAccept = (challengeId: string) => {
    setUserProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + 10
    }));

    const acceptanceMessage: Message = {
      id: Date.now().toString(),
      text: "🚀 Challenge accepted! You're so brave and determined! I believe in you - let's work together to complete this challenge and earn those points. Remember, every challenge makes you stronger and smarter!",
      isBot: true,
      timestamp: new Date(),
      subject: selectedSubject,
      hasAudio: true
    };

    setMessages(prev => [...prev, acceptanceMessage]);
  };

  const handleStoryAction = (storyId: string, action: string) => {
    let responseText = "";
    
    switch (action) {
      case 'start_reading':
        responseText = "📖 Wonderful! Let's begin this magical story journey together. Take your time reading each page, and don't hesitate to ask me questions about anything you don't understand!";
        break;
      case 'next_page':
        responseText = "📄 Great job reading! You're doing so well. Keep going - the story gets even more exciting!";
        break;
      case 'story_complete':
        responseText = "🎉 Congratulations! You've completed the entire story! You're becoming such a great reader. What did you think of the story? Did you learn something new?";
        setUserProgress(prev => ({
          ...prev,
          totalPoints: prev.totalPoints + 20,
          subjectProgress: {
            ...prev.subjectProgress,
            stories: {
              ...prev.subjectProgress.stories,
              points: prev.subjectProgress.stories.points + 20
            }
          }
        }));
        break;
    }

    if (responseText) {
      const storyResponseMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        isBot: true,
        timestamp: new Date(),
        subject: selectedSubject,
        hasAudio: true
      };

      setMessages(prev => [...prev, storyResponseMessage]);
    }
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    
    // No-op, ResponsiveVoice handles speech
  };

  const handleFeedback = async (rating: number, feedback?: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
      rating,
          feedback
        })
      });
      if (res.ok) {
    // Show thank you message
    const thankYouMessage: Message = {
      id: Date.now().toString(),
      text: `Thank you so much for your feedback! 💝 Your thoughts help me become a better learning assistant. I'm so happy to be part of your learning journey! ${rating >= 4 ? "I'm thrilled you're enjoying our time together!" : "I'll work harder to make learning even more fun for you!"}`,
      isBot: true,
      timestamp: new Date(),
      subject: selectedSubject,
      hasAudio: true
    };
    setMessages(prev => [...prev, thankYouMessage]);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send feedback');
      }
    } catch (e) {
      alert('Network error sending feedback');
    }
  };

  return (
    <div className={
      `min-h-screen transition-all duration-500
      ${settings.theme === 'default' ? 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50' :
        settings.theme === 'ocean' ? 'bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-50' :
        settings.theme === 'forest' ? 'bg-gradient-to-br from-green-100 via-emerald-50 to-lime-50' :
        settings.theme === 'sunset' ? 'bg-gradient-to-br from-orange-100 via-pink-50 to-purple-50' :
        'bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50'
      }
      ${settings.highContrast ? 'contrast-125 brightness-110' : ''}`
    }>
      <Header 
        selectedSubject={selectedSubject}
        userProgress={userProgress}
        currentLanguage={settings.language}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onFeedbackClick={() => setIsFeedbackOpen(true)}
        onDashboardClick={() => setIsDashboardOpen(true)}
        onHomeClick={() => setSelectedSubject('explore')}
        user={user}
        onLoginClick={handleLogout}
        onProfileSave={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }}
      />
      <div className="pt-20 pb-4">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex gap-6">
            {/* Left Sidebar - Subject Cards (only shown when in active learning mode) */}
            {showSummary && (
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
                    <button
                      onClick={() => {
                        setShowSummary(false);
                        setSelectedSubject('explore');
                        setSelectedTopic('');
                        setIsQuizActive(false);
                        setShowTopicPrompt(false);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Back to Home"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSubjectChange('explore')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                        ${selectedSubject === 'explore' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      <span className="font-semibold">Explore</span>
                    </button>
                    
                    <button
                      onClick={() => handleSubjectChange('science')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                        ${selectedSubject === 'science' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/>
                      </svg>
                      <span className="font-semibold">Science</span>
                    </button>
                    
                    <button
                      onClick={() => handleSubjectChange('math')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                        ${selectedSubject === 'math' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0-3 3V8a3 3 0 1 0 3-3"/>
                      </svg>
                      <span className="font-semibold">Math</span>
                    </button>
                    
                    <button
                      onClick={() => handleSubjectChange('social')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                        ${selectedSubject === 'social' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M22 3H2v18h20V3z"/>
                      </svg>
                      <span className="font-semibold">Social Studies</span>
                    </button>
                    
                    <button
                      onClick={() => handleSubjectChange('english')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                        ${selectedSubject === 'english' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15v3A2 2 0 0 1 16 21H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"/><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0-3 3V8a3 3 0 1 0 3-3"/>
                      </svg>
                      <span className="font-semibold">English</span>
                    </button>
                    
                    <button
                      onClick={() => handleSubjectChange('stories')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                        ${selectedSubject === 'stories' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M12 2v7"/><path d="M12 17v5"/><path d="M12 12L9 9"/><path d="M15 12L12 9"/><path d="M9 12L12 9"/>
                      </svg>
                      <span className="font-semibold">Stories</span>
                    </button>
                    
                    <button
                      onClick={() => handleSubjectChange('sports')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left
                        ${selectedSubject === 'sports' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 2H4a2 2 0 0 0-2 2v5a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7V4a2 2 0 0 0-2-2z"/><path d="M15 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      </svg>
                      <span className="font-semibold">Sports</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className={`${showSummary ? 'flex-1' : 'w-full'}`}>
              {!showSummary && (
                <div className="max-w-6xl mx-auto">
          <SubjectSelector 
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
          />
                </div>
              )}
              
              {showSummary && (
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedSubject === 'explore' ? 'Explore & Learn' : `${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} Learning`}
                    </h2>
                    <p className="text-gray-600">
                      {selectedSubject === 'explore' 
                        ? 'Ask me anything! I\'m here to help you learn and explore new topics.' 
                        : `Ready to dive into ${selectedSubject}? Ask questions, take quizzes, and track your progress!`
                      }
                    </p>
                  </div>
          
          <ChatInterface 
            messages={messages}
            isLoading={isLoading}
            settings={settings}
            voicePlayback={voicePlayback}
                    currentlyPlayingMessageId={currentlyPlayingMessageId}
            onSpeakMessage={handleSpeakMessage}
            onQuizAnswer={handleQuizAnswer}
            onChallengeAccept={handleChallengeAccept}
            onStoryAction={handleStoryAction}
          />
                </div>
              )}
              
              {/* Quiz UI */}
              {isQuizActive && quizQuestions.length > 0 && (
                <div className="bg-white rounded-3xl shadow-2xl p-8 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-purple-700">Quiz: {selectedTopic}</h2>
                    <button
                      onClick={() => {
                        setIsQuizActive(false);
                        setShowSummary(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Back to Chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <div className="font-semibold text-lg mb-2 text-gray-800">Question {currentQuizIndex + 1} of {quizQuestions.length}</div>
                    <div className="text-lg text-gray-700 mb-4">{quizQuestions[currentQuizIndex].question}</div>
                    <div className="flex flex-col gap-3">
                      {quizQuestions[currentQuizIndex].options.map((option: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleCustomQuizAnswer(idx)}
                          disabled={selectedQuizAnswer !== null}
                          className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-200
                            ${selectedQuizAnswer === idx
                              ? (quizQuestions[currentQuizIndex].correct === idx
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                                  : 'bg-gradient-to-r from-red-400 to-pink-500 text-white')
                              : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 hover:from-purple-200 hover:to-pink-200'}
                            ${selectedQuizAnswer !== null && quizQuestions[currentQuizIndex].correct === idx ? 'ring-2 ring-green-400' : ''}
                          `}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {showQuizFeedback && selectedQuizAnswer !== null && (
                      <div className={`mt-4 text-lg font-bold ${quizQuestions[currentQuizIndex].correct === selectedQuizAnswer ? 'text-green-600' : 'text-red-600'}`}>
                        {quizQuestions[currentQuizIndex].correct === selectedQuizAnswer ? 'Correct!' : 'Incorrect'}
                      </div>
                    )}
                    {revealedCorrectAnswer !== null && selectedQuizAnswer !== null && (
                      <div className="mt-2 text-sm text-blue-600 font-semibold">Correct answer: {quizQuestions[currentQuizIndex].options[revealedCorrectAnswer]}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <InputBar 
        onSendMessage={handleSendMessage}
        settings={settings}
        isLoading={isLoading}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedback}
      />
      <DashboardComponent
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        userProgress={userProgress}
      />
      {/* Topic selection prompt modal */}
      {showTopicPrompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-center">What would you like to do with <span className="text-purple-600">{selectedTopic}</span>?</h3>
            <div className="flex flex-col gap-4 w-full">
              <button onClick={handleAskQuestion} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg">Ask a Question</button>
              <button onClick={handlePlayQuiz} className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-semibold text-lg hover:from-green-500 hover:to-emerald-600 transition-all duration-200 shadow-lg">Play Quiz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;