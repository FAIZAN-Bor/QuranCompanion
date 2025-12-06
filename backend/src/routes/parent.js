const express = require('express');
const router = express.Router();
const {
  generateLinkCode,
  linkToParent,
  getChildren,
  getChildProgress,
  getChildQuizzes,
  getChildMistakes,
  getChildAchievements,
  unlinkChild
} = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');

// All routes are protected
router.use(protect);

// Parent-only routes
router.post('/generate-link', authorize('parent'), validationRules.generateLinkCode, validate, generateLinkCode);
router.get('/children', authorize('parent'), getChildren);
router.get('/child/:childId/progress', authorize('parent'), getChildProgress);
router.get('/child/:childId/quizzes', authorize('parent'), getChildQuizzes);
router.get('/child/:childId/mistakes', authorize('parent'), getChildMistakes);
router.get('/child/:childId/achievements', authorize('parent'), getChildAchievements);
router.delete('/child/:childId', authorize('parent'), unlinkChild);

// Child-only route
router.post('/link', authorize('child'), validationRules.linkToParent, validate, linkToParent);

module.exports = router;
