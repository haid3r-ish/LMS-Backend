const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  
  completedUnits: [{ type: mongoose.Schema.Types.ObjectId }], 

  quizScores: [{
    unitId: mongoose.Schema.Types.ObjectId,
    score: Number
  }],

  isCompleted: { type: Boolean, default: false }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// virtual field 
enrollmentSchema.virtual('progress').get(function() {
  if (!this.module || !this.module.content) return 0;
  
  const totalUnits = this.module.content.length;
  if (totalUnits === 0) return 100;

  const percentage = (this.completedUnits.length / totalUnits) * 100;
  return Math.round(percentage);
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);