const ParentChild = require('../models/ParentChild');
const User = require('../models/User');
const Progress = require('../models/Progress');
const QuizResult = require('../models/QuizResult');
const Mistake = require('../models/Mistake');
const Achievement = require('../models/Achievement');

// @desc    Generate link code for child
// @route   POST /api/parent/generate-link
// @access  Private (Parent only)
const generateLinkCode = async (req, res, next) => {
  try {
    const { childEmail } = req.body;

    // Verify child exists
    const child = await User.findOne({ email: childEmail, role: 'child' });
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child user not found'
      });
    }

    // Check if relationship already exists
    const existing = await ParentChild.findOne({
      parent: req.user.id,
      child: child._id
    });

    if (existing && existing.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Already linked to this child'
      });
    }

    // Create or update link
    let link;
    if (existing) {
      link = existing;
      link.generateLinkCode();
      link.status = 'pending';
      await link.save();
    } else {
      link = await ParentChild.create({
        parent: req.user.id,
        child: child._id
      });
      link.generateLinkCode();
      await link.save();
    }

    res.status(200).json({
      success: true,
      message: 'Link code generated. Share this with your child.',
      data: {
        linkCode: link.linkCode,
        expiresAt: link.linkCodeExpiresAt,
        childEmail
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Link child to parent using code
// @route   POST /api/parent/link
// @access  Private (Child only)
const linkToParent = async (req, res, next) => {
  try {
    const { linkCode } = req.body;

    // Verify link code
    const link = await ParentChild.verifyLinkCode(linkCode);
    if (!link) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired link code'
      });
    }

    // Verify this link is for the current user
    if (link.child.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This link code is not for your account'
      });
    }

    // Activate relationship
    link.activate();
    await link.save();

    const parent = await User.findById(link.parent);

    res.status(200).json({
      success: true,
      message: `Successfully linked to ${parent.name}`,
      data: { link }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parent's children
// @route   GET /api/parent/children
// @access  Private (Parent only)
const getChildren = async (req, res, next) => {
  try {
    const links = await ParentChild.find({
      parent: req.user.id,
      status: 'active'
    }).populate('child', 'name email profileImage proficiencyLevel coins streakDays accuracy totalLessonsCompleted currentLevel lastActiveDate');

    res.status(200).json({
      success: true,
      count: links.length,
      data: { children: links }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child's progress (for parent)
// @route   GET /api/parent/child/:childId/progress
// @access  Private (Parent only)
const getChildProgress = async (req, res, next) => {
  try {
    const { childId } = req.params;

    // Verify parent-child relationship
    const link = await ParentChild.findOne({
      parent: req.user.id,
      child: childId,
      status: 'active'
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child\'s progress'
      });
    }

    // Get progress data
    const progress = await Progress.find({ user: childId })
      .populate('contentId')
      .sort({ lastAccessedAt: -1 });

    const summary = await Progress.getUserProgress(childId);

    res.status(200).json({
      success: true,
      data: { 
        progress,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child's quiz results (for parent)
// @route   GET /api/parent/child/:childId/quizzes
// @access  Private (Parent only)
const getChildQuizzes = async (req, res, next) => {
  try {
    const { childId } = req.params;

    // Verify parent-child relationship
    const link = await ParentChild.findOne({
      parent: req.user.id,
      child: childId,
      status: 'active'
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child\'s quizzes'
      });
    }

    const quizzes = await QuizResult.find({ user: childId })
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: { quizzes }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child's mistakes (for parent)
// @route   GET /api/parent/child/:childId/mistakes
// @access  Private (Parent only)
const getChildMistakes = async (req, res, next) => {
  try {
    const { childId } = req.params;

    // Verify parent-child relationship
    const link = await ParentChild.findOne({
      parent: req.user.id,
      child: childId,
      status: 'active'
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child\'s mistakes'
      });
    }

    const mistakes = await Mistake.find({ user: childId })
      .populate('contentId')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: mistakes.length,
      data: { mistakes }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get child's achievements (for parent)
// @route   GET /api/parent/child/:childId/achievements
// @access  Private (Parent only)
const getChildAchievements = async (req, res, next) => {
  try {
    const { childId } = req.params;

    // Verify parent-child relationship
    const link = await ParentChild.findOne({
      parent: req.user.id,
      child: childId,
      status: 'active'
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child\'s achievements'
      });
    }

    const achievements = await Achievement.find({ user: childId })
      .sort({ earnedAt: -1 });

    res.status(200).json({
      success: true,
      count: achievements.length,
      data: { achievements }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlink child
// @route   DELETE /api/parent/child/:childId
// @access  Private (Parent only)
const unlinkChild = async (req, res, next) => {
  try {
    const { childId } = req.params;

    const link = await ParentChild.findOne({
      parent: req.user.id,
      child: childId
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    link.status = 'inactive';
    link.deactivatedAt = new Date();
    await link.save();

    res.status(200).json({
      success: true,
      message: 'Child unlinked successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateLinkCode,
  linkToParent,
  getChildren,
  getChildProgress,
  getChildQuizzes,
  getChildMistakes,
  getChildAchievements,
  unlinkChild
};
