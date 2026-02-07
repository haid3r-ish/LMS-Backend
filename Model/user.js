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
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'instructor'],
    default: 'student'
  },
  active: {
        type: Boolean,
        default: true,
        select: false 
  },
  bio: String,
  expertise: [String] 
}, { timestamps: true });

userSchema.pre(/^find/, function() {

    this.find({ active: { $ne: false } })
});

module.exports = mongoose.model('User', userSchema);