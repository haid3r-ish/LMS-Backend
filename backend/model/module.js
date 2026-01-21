// models/Module.js
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
  // provide content type 
  content: [unitSchema], 
  price: Number
}, { timestamps: true });

const Module = mongoose.model('Module', moduleSchema);


// video discriminator
Module.path('content').discriminator('video', new mongoose.Schema({
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true }
}));

// quiz discriminator
Module.path('content').discriminator('quiz', new mongoose.Schema({
    timeLimit: { type: Number, required: true }, 
    questions: [{
        questionText: String,
        options: [String],
        correctOptionIndex: Number,
        points: { type: Number, default: 1 }
    }]
}));

// assignment discriminator
Module.path('content').discriminator('assignment', new mongoose.Schema({
  instructionPdfUrl: { type: String, required: true }, 
  maxScore: { type: Number, default: 100 }
}));

module.exports = Module;