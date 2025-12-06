const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
    // Example: 'qaida_1', 'quran_2', etc.
  },
  lessonId: {
    type: String,
    required: true
    // Example: 'q1_l1', 'qr1_l2', etc.
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    default: null
    // Reference to the actual Quran/Qaida/Dua content
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  attempts: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
progressSchema.index({ user: 1, module: 1, levelId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ user: 1, status: 1 });
progressSchema.index({ user: 1, completedAt: -1 });

// Static method to get user's overall progress
progressSchema.statics.getUserProgress = async function(userId) {
  // Get all progress records for the user
  const allProgress = await this.find({ user: new mongoose.Types.ObjectId(userId) });
  
  // Calculate overall statistics
  const totalLessons = allProgress.length;
  const completedLessons = allProgress.filter(p => p.status === 'completed').length;
  const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const accuracyValues = allProgress.filter(p => p.accuracy != null && p.accuracy > 0);
  const averageAccuracy = accuracyValues.length > 0 
    ? accuracyValues.reduce((sum, p) => sum + p.accuracy, 0) / accuracyValues.length 
    : 0;
  const totalCoins = allProgress.reduce((sum, p) => sum + (p.coinsEarned || 0), 0);
  const completedPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  // Group by module for detailed breakdown
  const byModule = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$module',
        totalLessons: { $sum: 1 },
        completedLessons: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalTimeSpent: { $sum: '$timeSpent' },
        averageAccuracy: { $avg: '$accuracy' },
        totalCoins: { $sum: '$coinsEarned' }
      }
    }
  ]);
  
  // Get User data for currentLevel
  const User = require('./User');
  const user = await User.findById(userId);
  
  // Calculate weekly progress (last 7 days) with dates and accuracy
  const weeklyProgress = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - i);
    
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayProgress = allProgress.filter(p => {
      if (!p.completedAt) return false;
      const completedDate = new Date(p.completedAt);
      return completedDate >= dayStart && completedDate <= dayEnd;
    });
    
    const dayAccuracy = dayProgress.length > 0
      ? dayProgress.reduce((sum, p) => sum + (p.accuracy || 0), 0) / dayProgress.length
      : 0;
    
    weeklyProgress.push({
      date: dayStart.toISOString(),
      lessonsCompleted: dayProgress.length,
      accuracy: Math.round(dayAccuracy)
    });
  }
  
  // Lessons by type with completed and total counts
  const quranModule = byModule.find(m => m._id === 'Quran');
  const duaModule = byModule.find(m => m._id === 'Dua');
  const qaidaModule = byModule.find(m => m._id === 'Qaida');
  
  const lessonsByType = {
    Quran: { 
      completed: quranModule?.completedLessons || 0,
      total: quranModule?.totalLessons || 0
    },
    Dua: { 
      completed: duaModule?.completedLessons || 0,
      total: duaModule?.totalLessons || 0
    },
    Qaida: { 
      completed: qaidaModule?.completedLessons || 0,
      total: qaidaModule?.totalLessons || 0
    }
  };

  // Get last activity date
  const lastProgress = allProgress
    .filter(p => p.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
  
  return {
    totalLessons,
    completedLessons,
    completedPercentage,
    totalTimeSpent,
    accuracy: Math.round(averageAccuracy),
    totalCoins,
    currentLevel: user?.currentLevel || 'Beginner',
    byModule,
    weeklyProgress,
    lessonsByType,
    lastActivity: lastProgress?.completedAt || null
  };
};

module.exports = mongoose.model('Progress', progressSchema);
