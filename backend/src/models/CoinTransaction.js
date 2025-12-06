const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'lesson_complete',
      'quiz_pass',
      'quiz_perfect',
      'achievement',
      'daily_bonus',
      'streak_bonus',
      'mistake_resolved',
      'referral',
      'admin_grant',
      'purchase',
      'reward_redemption'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
    // Positive for earning, negative for spending
  },
  balance: {
    type: Number,
    required: true
    // Balance after this transaction
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    model: {
      type: String,
      enum: ['Progress', 'QuizResult', 'Achievement', 'Mistake', null],
      default: null
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
coinTransactionSchema.index({ user: 1, timestamp: -1 });
coinTransactionSchema.index({ user: 1, type: 1 });
coinTransactionSchema.index({ timestamp: -1 });

// Static method to add coins
coinTransactionSchema.statics.addCoins = async function(userId, type, amount, description, reference = null) {
  const User = mongoose.model('User');
  
  // Get user and update balance
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const newBalance = user.coins + amount;
  user.coins = newBalance;
  await user.save();
  
  // Create transaction record
  const transaction = await this.create({
    user: userId,
    type,
    amount,
    balance: newBalance,
    description,
    reference: reference ? {
      model: reference.model,
      id: reference.id
    } : undefined
  });
  
  return { transaction, newBalance };
};

// Static method to deduct coins
coinTransactionSchema.statics.deductCoins = async function(userId, type, amount, description) {
  const User = mongoose.model('User');
  
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.coins < amount) throw new Error('Insufficient coins');
  
  const newBalance = user.coins - amount;
  user.coins = newBalance;
  await user.save();
  
  const transaction = await this.create({
    user: userId,
    type,
    amount: -amount, // Negative for spending
    balance: newBalance,
    description
  });
  
  return { transaction, newBalance };
};

// Get transaction history with pagination
coinTransactionSchema.statics.getHistory = async function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const transactions = await this.find({ user: userId })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments({ user: userId });
  
  return {
    transactions,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
