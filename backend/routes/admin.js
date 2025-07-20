import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

function adminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    User.findById(req.userId).then(user => {
      if (!user || !user.isAdmin) return res.status(403).json({ error: 'Not admin' });
      next();
    });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// List all users
router.get('/users', adminMiddleware, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Site-wide stats
router.get('/stats', adminMiddleware, async (req, res) => {
  const userCount = await User.countDocuments();
  const progressCount = await Progress.countDocuments();
  res.json({ userCount, progressCount });
});

// Reset a user's progress
router.post('/reset-user', adminMiddleware, async (req, res) => {
  const { userId } = req.body;
  await Progress.deleteOne({ userId });
  res.json({ success: true });
});

export default router; 