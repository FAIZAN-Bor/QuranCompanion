const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeType: {
    type: String,
    enum: [
      'first_lesson',
      'qaida_complete',
      'quran_complete',
      'level_2_badge',
      'level_5_badge',
      'quiz_master',
      'perfect_score',
      'week_streak',
      'month_streak',
      'early_bird',
      'night_owl',
      '100_lessons',
      '500_lessons',
      'coin_collector',
      'mistake_warrior'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
    // Example: 'Qaida Master', 'Perfect Score', etc.
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'trophy'
    // Icon name or URL
  },
  color: {
    type: String,
    default: '#FFD700' // Gold color
  },
  coinsRewarded: {
    type: Number,
    default: 0
  },
  levelCompleted: {
    type: String,
    default: null
    // Reference to level if badge is for level completion
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
    // Additional data like streak count, quiz score, etc.
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ user: 1, earnedAt: -1 });
achievementSchema.index({ user: 1, badgeType: 1 }, { unique: true });
achievementSchema.index({ badgeType: 1 });

// Static method to award achievement
achievementSchema.statics.awardBadge = async function(userId, badgeType, additionalData = {}) {
  // Check if badge already exists
  const existing = await this.findOne({ user: userId, badgeType });
  if (existing) return existing;
  
  // Badge definitions
  const badgeDefinitions = {
    first_lesson: { title: 'First Steps', description: 'Completed your first lesson!', coins: 50 },
    qaida_complete: { title: 'Qaida Master', description: 'Completed all Qaida levels!', coins: 500 },
    quran_complete: { title: 'Quran Champion', description: 'Completed all Quran levels!', coins: 1000 },
    level_2_badge: { title: 'Rising Star', description: 'Completed Level 2!', coins: 100 },
    level_5_badge: { title: 'Knowledge Seeker', description: 'Completed Level 5!', coins: 200 },
    quiz_master: { title: 'Quiz Master', description: 'Passed 10 quizzes in a row!', coins: 300 },
    perfect_score: { title: 'Perfection', description: 'Scored 100% on a quiz!', coins: 150 },
    week_streak: { title: 'Week Warrior', description: '7-day learning streak!', coins: 100 },
    month_streak: { title: 'Dedicated Learner', description: '30-day learning streak!', coins: 500 },
    early_bird: { title: 'Early Bird', description: 'Completed lessons before 9 AM!', coins: 50 },
    night_owl: { title: 'Night Owl', description: 'Completed lessons after 10 PM!', coins: 50 },
    '100_lessons': { title: 'Century', description: 'Completed 100 lessons!', coins: 300 },
    '500_lessons': { title: 'Unstoppable', description: 'Completed 500 lessons!', coins: 1000 },
    coin_collector: { title: 'Coin Collector', description: 'Earned 1000 coins!', coins: 200 },
    mistake_warrior: { title: 'Mistake Warrior', description: 'Resolved 50 mistakes!', coins: 150 }
  };
  
  const definition = badgeDefinitions[badgeType];
  if (!definition) throw new Error('Invalid badge type');
  
  const achievement = await this.create({
    user: userId,
    badgeType,
    title: definition.title,
    description: definition.description,
    coinsRewarded: definition.coins,
    metadata: additionalData
  });
  
  return achievement;
};

module.exports = mongoose.model('Achievement', achievementSchema);
