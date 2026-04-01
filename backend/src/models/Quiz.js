const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: true
    // Index of the correct option
  },
  explanation: {
    type: String,
    trim: true
  }
});

const quizSchema = new mongoose.Schema({
  levelId: {
    type: String,
    required: true,
    unique: true,
    index: true
    // Matches the id in ProgressMapData (e.g., 'qaida_1')
  },
  module: {
    type: String,
    enum: ['Qaida', 'Quran'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  passingScore: {
    type: Number,
    default: 60
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
