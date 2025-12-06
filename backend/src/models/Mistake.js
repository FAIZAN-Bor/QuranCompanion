const mongoose = require('mongoose');

const mistakeSchema = new mongoose.Schema({
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
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    default: null
  },
  mistakeType: {
    type: String,
    enum: ['pronunciation', 'recitation', 'tajweed', 'memorization', 'comprehension', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
    // Example: 'Mistake 1', 'Incorrect Madd'
  },
  description: {
    type: String,
    required: true
    // Example: 'Mispronounced the letter "ق" in Surah Al-Ikhlas'
  },
  audioUrl: {
    type: String,
    default: null
    // URL to recorded audio of the mistake (optional)
  },
  correctionNote: {
    type: String,
    default: null
    // AI or teacher feedback
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'major'],
    default: 'moderate'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
mistakeSchema.index({ user: 1, timestamp: -1 });
mistakeSchema.index({ user: 1, isResolved: 1 });
mistakeSchema.index({ user: 1, module: 1, mistakeType: 1 });

// Virtual field for week grouping
mistakeSchema.virtual('weekCategory').get(function() {
  const now = new Date();
  const mistakeDate = new Date(this.timestamp);
  const diffTime = now - mistakeDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) return 'This Week';
  if (diffDays <= 14) return 'Last Week';
  if (diffDays <= 21) return '2 Weeks Ago';
  if (diffDays <= 28) return '3 Weeks Ago';
  return 'Older';
});

// Ensure virtuals are included in JSON
mistakeSchema.set('toJSON', { virtuals: true });
mistakeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Mistake', mistakeSchema);
