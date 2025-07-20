import mongoose from 'mongoose';

const subjectProgressSchema = new mongoose.Schema({
  level: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  topicsCompleted: { type: [String], default: [] },
  averageScore: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  quizzesCompleted: { type: Number, default: 0 },
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastQuizDate: { type: Date },
  quizzesCompleted: { type: Number, default: 0 },
  completedChallenges: { type: Number, default: 0 },
  subjectProgress: {
    science: { type: subjectProgressSchema, default: () => ({}) },
    math: { type: subjectProgressSchema, default: () => ({}) },
    social: { type: subjectProgressSchema, default: () => ({}) },
    english: { type: subjectProgressSchema, default: () => ({}) },
    general: { type: subjectProgressSchema, default: () => ({}) },
    stories: { type: subjectProgressSchema, default: () => ({}) },
    games: { type: subjectProgressSchema, default: () => ({}) },
  },
  achievements: { type: [String], default: [] },
});

export default mongoose.model('Progress', progressSchema); 