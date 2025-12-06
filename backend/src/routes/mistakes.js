const express = require('express');
const router = express.Router();
const {
  logMistake,
  getMistakes,
  getMistakeById,
  resolveMistake,
  deleteMistake,
  getMistakeStats,
  submitPracticeAttempt
} = require('../controllers/mistakeController');
const { protect } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.post('/', validationRules.logMistake, validate, logMistake);
router.get('/', getMistakes);
router.get('/stats', getMistakeStats);
router.get('/:id', validationRules.mongoId, validate, getMistakeById);
router.put('/:id/resolve', validationRules.mongoId, validate, resolveMistake);
router.post('/:id/practice', validationRules.mongoId, validate, submitPracticeAttempt);
router.delete('/:id', validationRules.mongoId, validate, deleteMistake);

module.exports = router;
