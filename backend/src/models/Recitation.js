const mongoose = require('mongoose');

const mistakeDetailSchema = new mongoose.Schema({
  word: { type: String },
  expected: { type: String },
  got: { type: String },
  type: { 
    type: String, 
    enum: ['missing', 'substitution', 'insertion', 'tajweed', 'pronunciation'] 
  },
  position: { type: Number },
  severity: { 
    type: String, 
    enum: ['minor', 'moderate', 'major'], 
    default: 'moderate' 
  },
  suggestion: { type: String }
}, { _id: false });

const tajweedScoreSchema = new mongoose.Schema({
  rule: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, default: 0 },
  details: { type: String }
}, { _id: false });

const recitationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: String,
    enum: ['Qaida', 'Quran', 'Dua'],
    required: true
  },
  levelId: {
    type: String,
    required: true
  },
  lessonId: {
    type: String,
    default: null
  },
  groundTruth: {
    type: String,
    required: true
    // The expected Arabic text the user should recite
  },
  recognizedText: {
    type: String,
    default: null
    // What Whisper transcribed
  },
  audioUrl: {
    type: String,
    default: null
    // Path to uploaded audio file
  },

  // Scores
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  accuracyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
    // Text accuracy (WER-based)
  },
  pronunciationScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
    // Neural embedding comparison
  },
  tajweedScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
    // Tajweed rules compliance
  },
  wordErrorRate: {
    type: Number,
    default: 0
  },

  // Detailed analysis
  mistakes: [mistakeDetailSchema],
  tajweedAnalysis: [tajweedScoreSchema],
  wordTimestamps: [{
    word: String,
    start: Number,
    end: Number,
    confidence: Number
  }],

  // Processing
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String,
    default: null
  },
  processingTime: {
    type: Number,
    default: 0
    // Time in ms for AI to process
  }
}, {
  timestamps: true
});

// Indexes
recitationSchema.index({ user: 1, createdAt: -1 });
recitationSchema.index({ user: 1, module: 1 });
recitationSchema.index({ processingStatus: 1 });

module.exports = mongoose.model('Recitation', recitationSchema);
