const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const { awardCoins, calculateQuizCoins } = require('../utils/coinHelper');
const { checkAchievements } = require('../utils/achievementHelper');
const Notification = require('../models/Notification');

// @desc    Submit quiz result
// @route   POST /api/quiz/submit
// @access  Private
const submitQuiz = async (req, res, next) => {
  try {
    const {
      quizId,
      module,
      levelId,
      questions,
      score,
      totalQuestions,
      timeSpent
    } = req.body;

    // Calculate percentage and pass status
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 60;

    // Check if this is a retake
    const previousAttempts = await QuizResult.countDocuments({
      user: req.user.id,
      quizId
    });

    // Create quiz result
    const quizResult = await QuizResult.create({
      user: req.user.id,
      quizId,
      module,
      levelId,
      questions,
      score,
      totalQuestions,
      percentage,
      passed,
      timeSpent,
      attempts: previousAttempts + 1
    });

    // Award coins (calculated in model pre-save hook)
    await awardCoins(
      req.user.id,
      passed ? 'quiz_pass' : 'quiz_fail',
      quizResult.coinsEarned,
      `Quiz ${quizId}: ${percentage}%`,
      { model: 'QuizResult', id: quizResult._id }
    );

    // Update user stats
    if (passed) {
      const user = await User.findById(req.user.id);
      user.totalQuizzesCompleted += 1;
      
      // Update accuracy (weighted average)
      const totalQuizzes = user.totalQuizzesCompleted;
      user.accuracy = Math.round(
        ((user.accuracy * (totalQuizzes - 1)) + percentage) / totalQuizzes
      );
      
      await user.save();

      // Check for achievements
      const achievements = await checkAchievements(req.user.id, {
        type: 'quiz_complete',
        data: { quizId, percentage, score, attempts: quizResult.attempts }
      });

      // Send notification
      await Notification.createNotification(
        req.user.id,
        'quiz_result',
        passed ? 'Quiz Passed! 🎉' : 'Quiz Completed',
        `You scored ${percentage}% on ${quizId}. ${passed ? `Earned ${quizResult.coinsEarned} coins!` : 'Try again to improve!'}`,
        { icon: passed ? 'check' : 'info', priority: 'high' }
      );
    }

    res.status(201).json({
      success: true,
      message: passed ? 'Quiz passed!' : 'Quiz completed. Try again!',
      data: { 
        quizResult,
        passed,
        percentage,
        coinsEarned: quizResult.coinsEarned
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz results for user
// @route   GET /api/quiz/results
// @access  Private
const getQuizResults = async (req, res, next) => {
  try {
    const { quizId, module } = req.query;
    
    let query = { user: req.user.id };
    if (quizId) query.quizId = quizId;
    if (module) query.module = module;

    const results = await QuizResult.find(query).sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: { results }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best score for a quiz
// @route   GET /api/quiz/best/:quizId
// @access  Private
const getBestScore = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const bestResult = await QuizResult.getBestScore(req.user.id, quizId);

    if (!bestResult) {
      return res.status(404).json({
        success: false,
        message: 'No quiz results found'
      });
    }

    res.status(200).json({
      success: true,
      data: { result: bestResult }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz statistics
// @route   GET /api/quiz/stats
// @access  Private
const getQuizStats = async (req, res, next) => {
  try {
    const stats = await QuizResult.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          passedQuizzes: {
            $sum: { $cond: ['$passed', 1, 0] }
          },
          averageScore: { $avg: '$percentage' },
          totalCoinsEarned: { $sum: '$coinsEarned' },
          perfectScores: {
            $sum: { $cond: [{ $eq: ['$percentage', 100] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalQuizzes: 0,
      passedQuizzes: 0,
      averageScore: 0,
      totalCoinsEarned: 0,
      perfectScores: 0
    };

    res.status(200).json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQuiz,
  getQuizResults,
  getBestScore,
  getQuizStats
};
