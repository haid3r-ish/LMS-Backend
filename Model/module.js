const mongoose = require('mongoose');
const options = { discriminatorKey: 'type', _id: true };

// content type schema
const unitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isFree: { type: Boolean, default: false }
}, options);

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: {type: String},
  // provide content type 
  content: [unitSchema], 
  certificateUrl: { type: String },
  price: Number,
  rating: {type: Number, default: 0}
}, { timestamps: true });

const Module = mongoose.model('Module', moduleSchema);


// video discriminator
moduleSchema.path('content').discriminator('video', new mongoose.Schema({
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true }
}));

// quiz discriminator
moduleSchema.path('content').discriminator('quiz', new mongoose.Schema({
    quizUrl: { type: String, required: true }, 
    description: String 
}));

// assignment discriminator
moduleSchema.path('content').discriminator('assignment', new mongoose.Schema({
  instructionPdfUrl: { type: String, required: true }, 
  maxScore: { type: Number, default: 100 },
  instruction: {type: String}
}));

module.exports = Module;