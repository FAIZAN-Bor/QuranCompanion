const User = require('../models/User');
const SurveyResponse = require('../models/SurveyResponse');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, profileImage, notificationSettings } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;
    if (notificationSettings) {
      user.notificationSettings = {
        ...user.notificationSettings,
        ...notificationSettings
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit learner survey
// @route   POST /api/users/survey
// @access  Private
const submitSurvey = async (req, res, next) => {
  try {
    const { answers, proficiencyLevel, totalScore, sectionScores } = req.body;

    // Check if survey already exists
    const existing = await SurveyResponse.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Survey already completed'
      });
    }

    // Create survey response
    const survey = await SurveyResponse.create({
      user: req.user.id,
      answers,
      proficiencyLevel,
      totalScore,
      sectionScores
    });

    // Update user's proficiency level
    const user = await User.findById(req.user.id);
    user.proficiencyLevel = proficiencyLevel;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Survey submitted successfully',
      data: { survey }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user survey response
// @route   GET /api/users/survey
// @access  Private
const getSurvey = async (req, res, next) => {
  try {
    const survey = await SurveyResponse.findOne({ user: req.user.id });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { survey }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const Progress = require('../models/Progress');
    const Achievement = require('../models/Achievement');
    const CoinTransaction = require('../models/CoinTransaction');

    const user = await User.findById(req.user.id);
    const progressStats = await Progress.getUserProgress(req.user.id);
    const achievements = await Achievement.find({ user: req.user.id })
      .sort({ earnedAt: -1 })
      .limit(5);
    
    const recentTransactions = await CoinTransaction.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          coins: user.coins,
          proficiencyLevel: user.proficiencyLevel,
          currentLevel: user.currentLevel,
          streakDays: user.streakDays,
          accuracy: user.accuracy,
          totalLessonsCompleted: user.totalLessonsCompleted,
          totalQuizzesCompleted: user.totalQuizzesCompleted
        },
        progressStats,
        recentAchievements: achievements,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  changePassword,
  submitSurvey,
  getSurvey,
  getDashboard
};
