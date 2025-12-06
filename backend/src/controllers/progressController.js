const Progress = require('../models/Progress');
const User = require('../models/User');
const { awardCoins, calculateLessonCoins } = require('../utils/coinHelper');
const { checkAchievements } = require('../utils/achievementHelper');
const Notification = require('../models/Notification');

// @desc    Get user progress
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res, next) => {
  try {
    const { module, levelId } = req.query;
    
    let query = { user: req.user.id };
    if (module) query.module = module;
    if (levelId) query.levelId = levelId;

    const progress = await Progress.find(query).sort({ lastAccessedAt: -1 });

    res.status(200).json({
      success: true,
      count: progress.length,
      data: { progress }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall progress summary
// @route   GET /api/progress/summary
// @access  Private
const getProgressSummary = async (req, res, next) => {
  try {
    const summary = await Progress.getUserProgress(req.user.id);

    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson progress
// @route   POST /api/progress/lesson
// @access  Private
const updateLessonProgress = async (req, res, next) => {
  try {
    const {
      module,
      levelId,
      lessonId,
      contentId,
      status,
      completionPercentage,
      timeSpent,
      accuracy
    } = req.body;

    // Find or create progress record
    let progress = await Progress.findOne({
      user: req.user.id,
      module,
      levelId,
      lessonId
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user.id,
        module,
        levelId,
        lessonId,
        contentId,
        status,
        completionPercentage: completionPercentage || 0,
        timeSpent: timeSpent || 0,
        accuracy: accuracy || 0,
        startedAt: new Date()
      });
    } else {
      // Update existing progress
      if (status) progress.status = status;
      if (completionPercentage !== undefined) progress.completionPercentage = completionPercentage;
      if (timeSpent) progress.timeSpent += timeSpent;
      if (accuracy !== undefined) progress.accuracy = accuracy;
      progress.lastAccessedAt = new Date();
      progress.attempts += 1;

      if (status === 'completed' && !progress.completedAt) {
        progress.completedAt = new Date();
        
        // Award coins for lesson completion
        const user = await User.findById(req.user.id);
        const isFirstLesson = user.totalLessonsCompleted === 0;
        const coins = calculateLessonCoins(accuracy || 0, timeSpent || 0, isFirstLesson);
        
        progress.coinsEarned = coins;
        await awardCoins(
          req.user.id,
          'lesson_complete',
          coins,
          `Completed ${module} lesson: ${lessonId}`,
          { model: 'Progress', id: progress._id }
        );

        // Update user stats
        user.totalLessonsCompleted += 1;
        await user.save();

        // Check for achievements
        const achievements = await checkAchievements(req.user.id, {
          type: 'lesson_complete',
          data: { module, levelId, lessonId }
        });

        // Send notification
        if (achievements.length > 0) {
          await Notification.createNotification(
            req.user.id,
            'achievement',
            'New Achievement!',
            `You earned: ${achievements.map(a => a.title).join(', ')}`,
            { icon: 'trophy', priority: 'high' }
          );
        }
      }

      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: { progress }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lesson progress details
// @route   GET /api/progress/lesson/:module/:levelId/:lessonId
// @access  Private
const getLessonProgress = async (req, res, next) => {
  try {
    const { module, levelId, lessonId } = req.params;

    const progress = await Progress.findOne({
      user: req.user.id,
      module,
      levelId,
      lessonId
    }).populate('contentId');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset lesson progress
// @route   DELETE /api/progress/lesson/:id
// @access  Private
const resetLessonProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    // Reset progress
    progress.status = 'not_started';
    progress.completionPercentage = 0;
    progress.accuracy = 0;
    progress.attempts = 0;
    progress.completedAt = null;
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Progress reset successfully',
      data: { progress }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgress,
  getProgressSummary,
  updateLessonProgress,
  getLessonProgress,
  resetLessonProgress
};
