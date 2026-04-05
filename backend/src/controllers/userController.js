const User = require('../models/User');
const SurveyResponse = require('../models/SurveyResponse');
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Progress = require('../models/Progress');
const QuizResult = require('../models/QuizResult');
const Mistake = require('../models/Mistake');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');
const CoinTransaction = require('../models/CoinTransaction');
const Recitation = require('../models/Recitation');
const ParentChild = require('../models/ParentChild');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

const getDeleteOps = (userId, session = null) => {
  const useSession = (query) => (session ? query.session(session) : query);
  return [
    useSession(Progress.deleteMany({ user: userId })),
    useSession(QuizResult.deleteMany({ user: userId })),
    useSession(Mistake.deleteMany({ user: userId })),
    useSession(Achievement.deleteMany({ user: userId })),
    useSession(Notification.deleteMany({ user: userId })),
    useSession(CoinTransaction.deleteMany({ user: userId })),
    useSession(Recitation.deleteMany({ user: userId })),
    useSession(SurveyResponse.deleteMany({ user: userId })),
    useSession(ParentChild.deleteMany({
      $or: [{ parent: userId }, { child: userId }]
    })),
    useSession(User.deleteOne({ _id: userId })),
  ];
};

const extractLocalUploadPath = (audioUrl) => {
  if (!audioUrl || typeof audioUrl !== 'string') return null;
  const normalized = audioUrl.replace(/\\/g, '/');
  const marker = '/uploads/';
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex === -1) return null;

  const relativePath = normalized.slice(markerIndex + marker.length);
  if (!relativePath || relativePath.includes('..')) return null;

  return path.join(UPLOADS_DIR, relativePath);
};

const deleteLocalMediaFiles = async (audioUrls = []) => {
  const localPaths = Array.from(
    new Set(audioUrls.map(extractLocalUploadPath).filter(Boolean))
  );

  if (!localPaths.length) return;

  await Promise.allSettled(
    localPaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore missing files and continue account cleanup.
        if (error.code !== 'ENOENT') {
          console.error('Failed to remove media file:', filePath, error.message);
        }
      }
    })
  );
};

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

// @desc    Delete user account and all related user data
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Capture audio references before deleting recitation/mistake records.
    const [recitations, mistakes] = await Promise.all([
      Recitation.find({ user: userId }).select('audioUrl').lean(),
      Mistake.find({ user: userId }).select('audioUrl').lean(),
    ]);
    const audioUrls = [
      ...recitations.map((item) => item.audioUrl),
      ...mistakes.map((item) => item.audioUrl),
    ].filter(Boolean);

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await Promise.all(getDeleteOps(userId, session));
      });
    } catch (txError) {
      const message = String(txError?.message || '');
      const txUnsupported =
        message.includes('Transaction numbers are only allowed') ||
        message.includes('Transaction support');

      if (!txUnsupported) {
        throw txError;
      }

      // Fallback for environments without transaction support.
      await Promise.all(getDeleteOps(userId, null));
    } finally {
      await session.endSession();
    }

    await deleteLocalMediaFiles(audioUrls);

    res.status(200).json({
      success: true,
      message: 'Account and related data deleted successfully'
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
  getDashboard,
  deleteAccount
};
