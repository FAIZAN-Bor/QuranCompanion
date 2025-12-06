const express = require('express');
const router = express.Router();
const {
  getProgress,
  getProgressSummary,
  updateLessonProgress,
  getLessonProgress,
  resetLessonProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.get('/', getProgress);
router.get('/summary', getProgressSummary);
router.post('/lesson', validationRules.updateProgress, validate, updateLessonProgress);
router.get('/lesson/:module/:levelId/:lessonId', getLessonProgress);
router.delete('/lesson/:id', validationRules.mongoId, validate, resetLessonProgress);

module.exports = router;
