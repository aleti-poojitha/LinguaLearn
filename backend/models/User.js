import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true },
  education: { type: String },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  location: { type: String },
  interests: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
});

export default mongoose.model('User', userSchema); 