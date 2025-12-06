const express = require('express');
const router = express.Router();
const {
  submitQuiz,
  getQuizResults,
  getBestScore,
  getQuizStats
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.post('/submit', validationRules.submitQuiz, validate, submitQuiz);
router.get('/results', getQuizResults);
router.get('/best/:quizId', getBestScore);
router.get('/stats', getQuizStats);

module.exports = router;
