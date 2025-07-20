import express from 'express';
import Family from '../models/Family.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
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

// Create a family
router.post('/create', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const family = new Family({ name, members: [req.userId] });
  await family.save();
  res.json(family);
});

// Join a family
router.post('/join', authMiddleware, async (req, res) => {
  const { familyId } = req.body;
  const family = await Family.findById(familyId);
  if (!family) return res.status(404).json({ error: 'Family not found' });
  if (!family.members.includes(req.userId)) {
    family.members.push(req.userId);
    await family.save();
  }
  res.json(family);
});

// Get dashboard (aggregate progress)
router.get('/:id', authMiddleware, async (req, res) => {
  const family = await Family.findById(req.params.id).populate('members');
  if (!family) return res.status(404).json({ error: 'Family not found' });
  // Aggregate progress for all members
  const progresses = await Progress.find({ userId: { $in: family.members.map(m => m._id) } });
  res.json({ family, progresses });
});

export default router; 