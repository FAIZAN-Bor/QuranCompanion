const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Quran', 'Qaida', 'Dua'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameArabic: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: Number,
    required: true
    // Surah number, Qaida page number, or Dua number
  },
  // For Quran
  totalAyahs: {
    type: Number,
    default: null
  },
  revelation: {
    type: String,
    enum: ['Makki', 'Madani'],
    default: null
  },
  juz: {
    type: Number,
    default: null
  },
  
  // For Qaida
  lesson: {
    type: String,
    default: null
    // Lesson content/description
  },
  characters: [{
    arabic: String,
    english: String
  }],
  
  // For Dua
  category: {
    type: String,
    default: null
    // 'Morning', 'Evening', 'Eating', 'Sleeping', etc.
  },
  
  // Common fields
  arabicText: {
    type: String,
    default: null
  },
  transliteration: {
    type: String,
    default: null
  },
  translation: {
    type: String,
    default: null
  },
  audioUrl: {
    type: String,
    default: null
    // URL to audio recitation
  },
  imageUrl: {
    type: String,
    default: null
    // URL to image (for Qaida lessons)
  },
  verses: [{
    verseNumber: Number,
    arabicText: String,
    transliteration: String,
    translation: String,
    audioUrl: String
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
    // Additional flexible data
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
    // For custom ordering
  }
}, {
  timestamps: true
});

// Indexes
contentSchema.index({ type: 1, number: 1 }, { unique: true });
contentSchema.index({ type: 1, isActive: 1, order: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ difficulty: 1 });

// Static method to get content by type
contentSchema.statics.getByType = async function(type, filters = {}) {
  return await this.find({ 
    type, 
    isActive: true,
    ...filters 
  }).sort({ order: 1, number: 1 });
};

module.exports = mongoose.model('Content', contentSchema);
