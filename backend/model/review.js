const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500 // Prevent spammy long essays
  }
}, { timestamps: true });

// COMPOUND INDEX: 
// Ensures a specific User can review a specific Module only ONCE.
reviewSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);