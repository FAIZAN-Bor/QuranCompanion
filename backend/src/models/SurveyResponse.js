const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user can only have one survey response
  },
  answers: {
    type: Map,
    of: String,
    required: true
    // Stores question ID as key and answer value as value
    // Example: { 'q1': 'all_alphabets', 'q2': 'easily', ... }
  },
  proficiencyLevel: {
    type: String,
    enum: ['Absolute Beginner', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    required: true
  },
  totalScore: {
    type: Number,
    required: true
  },
  sectionScores: {
    readingAbility: Number,
    pronunciationAbility: Number,
    wordSentenceReading: Number,
    previousExperience: Number,
    comprehension: Number
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
surveyResponseSchema.index({ proficiencyLevel: 1 });

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);
