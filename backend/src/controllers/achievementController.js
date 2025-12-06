const Achievement = require('../models/Achievement');
const CoinTransaction = require('../models/CoinTransaction');

// @desc    Get user achievements
// @route   GET /api/achievements
// @access  Private
const getAchievements = async (req, res, next) => {
  try {
    const { badgeType } = req.query;
    
    let query = { user: req.user.id };
    if (badgeType) query.badgeType = badgeType;

    const achievements = await Achievement.find(query).sort({ earnedAt: -1 });

    res.status(200).json({
      success: true,
      count: achievements.length,
      data: { achievements }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Private
const getAchievementById = async (req, res, next) => {
  try {
    const achievement = await Achievement.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { achievement }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get coin transaction history
// @route   GET /api/achievements/coins/history
// @access  Private
const getCoinHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const history = await CoinTransaction.getHistory(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get coin statistics
// @route   GET /api/achievements/coins/stats
// @access  Private
const getCoinStats = async (req, res, next) => {
  try {
    const stats = await CoinTransaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalEarned: {
            $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] }
          },
          totalSpent: {
            $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] }
          },
          transactionCount: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              amount: '$amount'
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalEarned: 0,
      totalSpent: 0,
      transactionCount: 0,
      byType: []
    };

    // Calculate current balance from User model
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        currentBalance: user.coins,
        ...result
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAchievements,
  getAchievementById,
  getCoinHistory,
  getCoinStats
};
