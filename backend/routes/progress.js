import express from 'express';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get user progress
router.get('/', authMiddleware, async (req, res) => {
  let progress = await Progress.findOne({ userId: req.userId });
  if (!progress) {
    progress = new Progress({ userId: req.userId });
    await progress.save();
  }
  res.json(progress);
});

// Update user progress
router.post('/', authMiddleware, async (req, res) => {
  let progress = await Progress.findOne({ userId: req.userId });
  if (!progress) {
    progress = new Progress({ userId: req.userId });
  }
  Object.assign(progress, req.body);
  await progress.save();
  res.json(progress);
});

// Update progress by email (for quiz completion)
router.post('/update', async (req, res) => {
  try {
    console.log('Progress update request body:', req.body);
    const { email, progress: progressData } = req.body;
    
    if (!email) {
      console.error('Progress update error: Email is required');
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!progressData) {
      console.error('Progress update error: Progress data is required');
      return res.status(400).json({ error: 'Progress data is required' });
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Progress update error: User not found for email', email);
      return res.status(404).json({ error: 'User not found' });
    }
    // Find or create progress for this user
    let progress = await Progress.findOne({ userId: user._id });
    if (!progress) {
      progress = new Progress({ userId: user._id });
    }
    // Update progress with new data
    Object.assign(progress, progressData);
    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress', details: error.message });
  }
});

export default router; 