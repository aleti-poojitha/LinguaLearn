import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Add a list of allowed emails (for demo, hardcoded; in production, use env or DB)
const allowedEmails = process.env.ALLOWED_EMAILS ? process.env.ALLOWED_EMAILS.split(',') : [
  'student1@example.com',
  'student2@example.com',
  'student3@example.com'
];

// Register new user
router.post('/register', async (req, res) => {
  const { name, email, phone, education, password, age, gender, location, interests } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
  // Check if email is in allowed list
  if (!allowedEmails.includes(email)) {
    return res.status(400).json({ error: 'Registration is only allowed for approved email addresses.' });
  }
  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) return res.status(400).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, phone, education, password: hashed, age, gender, location, interests });
  await user.save();
  // Create empty progress
  const progress = new Progress({ userId: user._id });
  await progress.save();
  res.json({ success: true });
});

// Login
router.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid password' });
  // Get progress/score
  const progress = await Progress.findOne({ userId: user._id });
  // Issue JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      education: user.education,
      age: user.age,
      gender: user.gender,
      location: user.location,
      interests: user.interests,
      createdAt: user.createdAt,
    },
    progress
  });
});

// Update profile
router.post('/profile', async (req, res) => {
  const { token, ...profile } = req.body;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    Object.assign(user, profile);
    await user.save();
    res.json({ success: true, user });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Feedback endpoint
router.post('/feedback', async (req, res) => {
  const { email, rating, feedback } = req.body;
  if (!rating && !feedback) return res.status(400).json({ error: 'Feedback or rating required' });
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: `LinguaLearn Feedback` + (email ? ` from ${email}` : ''),
      text: `Feedback received:\n\nRating: ${rating || 'N/A'}\nFeedback: ${feedback || 'N/A'}\nUser Email: ${email || 'N/A'}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send feedback' });
  }
});

export default router; 