const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules
const validationRules = {
  // Auth validations
  signup: [
    body('name')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['child', 'parent'])
      .withMessage('Role must be either child or parent')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  verifyOTP: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('otp')
      .isLength({ min: 4, max: 4 })
      .withMessage('OTP must be 4 digits')
  ],

  // Survey validation
  submitSurvey: [
    body('answers')
      .isObject()
      .withMessage('Answers must be an object'),
    body('proficiencyLevel')
      .isIn(['Absolute Beginner', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'])
      .withMessage('Invalid proficiency level')
  ],

  // Progress validation
  updateProgress: [
    body('module')
      .isIn(['Qaida', 'Quran', 'Dua'])
      .withMessage('Invalid module'),
    body('levelId')
      .notEmpty()
      .withMessage('Level ID is required'),
    body('lessonId')
      .notEmpty()
      .withMessage('Lesson ID is required'),
    body('status')
      .isIn(['not_started', 'in_progress', 'completed'])
      .withMessage('Invalid status')
  ],

  // Quiz validation
  submitQuiz: [
    body('quizId')
      .notEmpty()
      .withMessage('Quiz ID is required'),
    body('module')
      .isIn(['Qaida', 'Quran'])
      .withMessage('Invalid module'),
    body('questions')
      .isArray({ min: 1 })
      .withMessage('Questions array is required'),
    body('score')
      .isInt({ min: 0 })
      .withMessage('Score must be a positive number'),
    body('totalQuestions')
      .isInt({ min: 1 })
      .withMessage('Total questions must be at least 1')
  ],

  // Mistake validation
  logMistake: [
    body('module')
      .isIn(['Qaida', 'Quran', 'Dua'])
      .withMessage('Invalid module'),
    body('mistakeType')
      .isIn(['pronunciation', 'recitation', 'tajweed', 'memorization', 'comprehension', 'other'])
      .withMessage('Invalid mistake type'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
  ],

  // Parent-child validation
  generateLinkCode: [
    body('childEmail')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid child email is required')
  ],

  linkToParent: [
    body('linkCode')
      .isLength({ min: 6, max: 6 })
      .isAlphanumeric()
      .toUpperCase()
      .withMessage('Invalid link code format')
  ],

  // Email validation (for forgot password)
  email: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ],

  // Reset password validation
  resetPassword: [
    body('resetToken')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],

  // MongoDB ID validation
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format')
  ]
};

module.exports = { validate, validationRules };
