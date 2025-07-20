export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  subject: Subject;
  isVoice?: boolean;
  imageUrl?: string;
  hasAudio?: boolean;
  illustrations?: Illustration[];
  quiz?: Quiz;
  quizPrompt?: QuizPrompt;
  story?: Story;
  challenge?: Challenge;
  reward?: Reward;
}

export interface Illustration {
  id: string;
  type: 'diagram' | 'infographic' | 'cartoon' | 'chart';
  url: string;
  description: string;
  highlightWords?: string[];
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  characters: Character[];
  moral?: string;
  illustrations: string[];
}

export interface Character {
  name: string;
  avatar: string;
  personality: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  deadline?: Date;
  completed: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'badge' | 'certificate' | 'points' | 'unlock';
  icon: string;
  earned: boolean;
  earnedAt?: Date;
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  streak: number;
  lastQuizDate: string | null;
  quizzesCompleted: number;
  subjectProgress: Record<Subject, SubjectProgress>;
  achievements: Reward[];
}

export interface SubjectProgress {
  level: number;
  points: number;
  topicsCompleted: string[];
  averageScore: number;
  timeSpent: number; // in minutes
  quizzesCompleted: number;
}

export interface Dashboard {
  childName: string;
  totalLearningTime: number;
  favoriteSubjects: Subject[];
  weeklyProgress: WeeklyProgress[];
  achievements: Reward[];
  recommendations: string[];
}

export interface WeeklyProgress {
  week: string;
  timeSpent: number;
  topicsLearned: number;
  quizzesCompleted: number;
  averageScore: number;
}

export type Subject = 'explore' | 'science' | 'math' | 'social' | 'english' | 'stories' | 'sports';

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'gu' | 'bn';

export type VoiceGender = 'male' | 'female';

export type LearningMode = 'chat' | 'story' | 'quiz' | 'challenge' | 'explore';

export interface AppSettings {
  language: Language;
  voiceGender: VoiceGender;
  speechSpeed: number;
  voiceEnabled: boolean;
  autoTranslate: boolean;
  showWordHighlighting: boolean;
  showWaveform: boolean;
  theme: 'default' | 'ocean' | 'forest' | 'sunset' | 'space';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface AIResponse {
  text: string;
  imageUrl?: string;
  illustrations?: Illustration[];
  quiz?: QuizResponse;
  story?: Story;
  challenge?: Challenge;
  reward?: Reward;
  suggestedTopics?: string[];
}

export interface QuizResponse {
  id: string;
  questions: Quiz[];
  topic: string;
  totalQuestions: number;
}

export interface VoicePlayback {
  isPlaying: boolean;
  currentWord: number;
  duration: number;
  currentTime: number;
  waveformData: number[];
}

export interface SessionData {
  id: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  subject: Subject;
  language: Language;
  pointsEarned: number;
  topicsDiscussed: string[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  age?: number;
  gender?: string;
  location?: string;
  education?: string;
  interests?: string[];
}

export interface QuizPrompt {
  topic: string;
  quizId: string;
}