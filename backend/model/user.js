const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String, // Will store the hashed password
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String, // URL to profile picture
    default: 'https://via.placeholder.com/150'
  },
  // For instructors only
  bio: String,
  expertise: [String] 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);