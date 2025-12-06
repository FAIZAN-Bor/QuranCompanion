const Mistake = require('../models/Mistake');
const User = require('../models/User');
const { awardCoins, COIN_REWARDS } = require('../utils/coinHelper');
const { checkAchievements } = require('../utils/achievementHelper');

// @desc    Log a new mistake
// @route   POST /api/mistakes
// @access  Private
const logMistake = async (req, res, next) => {
  try {
    const {
      module,
      levelId,
      lessonId,
      contentId,
      mistakeType,
      title,
      description,
      audioUrl,
      severity
    } = req.body;

    const mistake = await Mistake.create({
      user: req.user.id,
      module,
      levelId,
      lessonId,
      contentId,
      mistakeType,
      title,
      description,
      audioUrl,
      severity
    });

    res.status(201).json({
      success: true,
      message: 'Mistake logged successfully',
      data: { mistake }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's mistakes
// @route   GET /api/mistakes
// @access  Private
const getMistakes = async (req, res, next) => {
  try {
    const { module, mistakeType, isResolved } = req.query;
    
    let query = { user: req.user.id };
    if (module) query.module = module;
    if (mistakeType) query.mistakeType = mistakeType;
    if (isResolved !== undefined) query.isResolved = isResolved === 'true';

    const mistakes = await Mistake.find(query)
      .populate('contentId')
      .sort({ timestamp: -1 });

    // Group by week
    const grouped = mistakes.reduce((acc, mistake) => {
      const week = mistake.weekCategory;
      if (!acc[week]) acc[week] = [];
      acc[week].push(mistake);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: mistakes.length,
      data: { 
        mistakes,
        groupedByWeek: grouped
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single mistake
// @route   GET /api/mistakes/:id
// @access  Private
const getMistakeById = async (req, res, next) => {
  try {
    const mistake = await Mistake.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('contentId');

    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { mistake }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark mistake as resolved
// @route   PUT /api/mistakes/:id/resolve
// @access  Private
const resolveMistake = async (req, res, next) => {
  try {
    const { correctionNote } = req.body;

    const mistake = await Mistake.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake not found'
      });
    }

    mistake.isResolved = true;
    mistake.resolvedAt = new Date();
    if (correctionNote) mistake.correctionNote = correctionNote;
    await mistake.save();

    // Award coins for resolving mistake
    await awardCoins(
      req.user.id,
      'mistake_resolved',
      COIN_REWARDS.MISTAKE_RESOLVED,
      `Resolved mistake: ${mistake.title}`,
      { model: 'Mistake', id: mistake._id }
    );

    // Check for mistake warrior achievement
    const resolvedCount = await Mistake.countDocuments({
      user: req.user.id,
      isResolved: true
    });

    if (resolvedCount === 50) {
      await checkAchievements(req.user.id, {
        type: 'mistake_resolved',
        data: { count: resolvedCount }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mistake marked as resolved',
      data: { mistake }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete mistake
// @route   DELETE /api/mistakes/:id
// @access  Private
const deleteMistake = async (req, res, next) => {
  try {
    const mistake = await Mistake.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mistake deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mistake statistics
// @route   GET /api/mistakes/stats
// @access  Private
const getMistakeStats = async (req, res, next) => {
  try {
    const stats = await Mistake.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalMistakes: { $sum: 1 },
          resolvedMistakes: {
            $sum: { $cond: ['$isResolved', 1, 0] }
          },
          byType: {
            $push: {
              type: '$mistakeType',
              isResolved: '$isResolved'
            }
          },
          byModule: {
            $push: {
              module: '$module',
              isResolved: '$isResolved'
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalMistakes: 0,
      resolvedMistakes: 0,
      byType: [],
      byModule: []
    };

    res.status(200).json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit practice attempt for a mistake
// @route   POST /api/mistakes/:id/practice
// @access  Private
const submitPracticeAttempt = async (req, res, next) => {
  try {
    const { isCorrect, attemptNumber, audioPath } = req.body;

    const mistake = await Mistake.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!mistake) {
      return res.status(404).json({
        success: false,
        message: 'Mistake not found'
      });
    }

    // If already resolved, just return success
    if (mistake.isResolved) {
      return res.status(200).json({
        success: true,
        message: 'Mistake already resolved',
        data: { mistake, autoResolved: false }
      });
    }

    // Track practice attempt (you could store this in a separate collection for analytics)
    const practiceData = {
      attemptNumber,
      attemptedAt: new Date(),
      isCorrect,
      audioPath
    };

    // If the user marked it as correct, auto-resolve the mistake
    if (isCorrect) {
      mistake.isResolved = true;
      mistake.resolvedAt = new Date();
      mistake.correctionNote = `Self-assessed as correct after ${attemptNumber} practice attempt(s)`;
      await mistake.save();

      // Award coins for resolving mistake through practice
      await awardCoins(
        req.user.id,
        'mistake_resolved',
        COIN_REWARDS.MISTAKE_RESOLVED,
        `Resolved mistake through practice: ${mistake.title}`,
        { model: 'Mistake', id: mistake._id }
      );

      // Check for mistake warrior achievement
      const resolvedCount = await Mistake.countDocuments({
        user: req.user.id,
        isResolved: true
      });

      if (resolvedCount === 50) {
        await checkAchievements(req.user.id, {
          type: 'mistake_resolved',
          data: { count: resolvedCount }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Excellent! Mistake resolved through practice!',
        data: { 
          mistake, 
          autoResolved: true,
          coinsEarned: COIN_REWARDS.MISTAKE_RESOLVED,
          practiceData
        }
      });
    }

    // If not correct, just log the practice attempt
    res.status(200).json({
      success: true,
      message: 'Practice attempt recorded. Keep practicing!',
      data: { 
        mistake, 
        autoResolved: false,
        practiceData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logMistake,
  getMistakes,
  getMistakeById,
  resolveMistake,
  deleteMistake,
  getMistakeStats,
  submitPracticeAttempt
};
