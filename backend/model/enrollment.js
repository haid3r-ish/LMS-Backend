const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  
  // Array of Unit IDs that are DONE
  completedUnits: [{ type: mongoose.Schema.Types.ObjectId }], 

  // Store scores for quizzes (optional but good for history)
  quizScores: [{
    unitId: mongoose.Schema.Types.ObjectId,
    score: Number
  }],

  // STORED: For fast certificate checks
  isCompleted: { type: Boolean, default: false }

}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // Ensure virtuals show up in JSON response
  toObject: { virtuals: true } 
});

// VIRTUAL: Calculated Runtime
enrollmentSchema.virtual('progress').get(function() {
  // We need the module populated to know the total count
  if (!this.module || !this.module.content) return 0;
  
  const totalUnits = this.module.content.length;
  if (totalUnits === 0) return 100;

  const percentage = (this.completedUnits.length / totalUnits) * 100;
  return Math.round(percentage);
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);