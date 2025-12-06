const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: String,
    required: true
    // Example: 'qaida_1_quiz', 'quran_2_quiz'
  },
  module: {
    type: String,
    enum: ['Qaida', 'Quran'],
    required: true
  },
  levelId: {
    type: String,
    required: true
  },
  questions: [{
    questionId: String,
    question: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number // seconds spent on this question
  }],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true,
    default: false
    // Pass threshold is 60%
  },
  timeSpent: {
    type: Number,
    required: true,
    default: 0 // Total time in seconds
  },
  attempts: {
    type: Number,
    default: 1
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
quizResultSchema.index({ user: 1, quizId: 1, completedAt: -1 });
quizResultSchema.index({ user: 1, passed: 1 });
quizResultSchema.index({ user: 1, module: 1 });

// Calculate coins based on performance
quizResultSchema.pre('save', function(next) {
  if (this.passed) {
    // Base coins: 50
    // Bonus for high accuracy: +50 if 100%, +30 if 90-99%, +10 if 80-89%
    // Bonus for first attempt: +20
    let coins = 50;
    
    if (this.percentage === 100) coins += 50;
    else if (this.percentage >= 90) coins += 30;
    else if (this.percentage >= 80) coins += 10;
    
    if (this.attempts === 1) coins += 20;
    
    this.coinsEarned = coins;
  } else {
    this.coinsEarned = 10; // Consolation coins
  }
  
  next();
});

// Static method to get best score for a quiz
quizResultSchema.statics.getBestScore = async function(userId, quizId) {
  const result = await this.findOne({ user: userId, quizId })
    .sort({ percentage: -1, completedAt: 1 })
    .limit(1);
  return result;
};

module.exports = mongoose.model('QuizResult', quizResultSchema);
