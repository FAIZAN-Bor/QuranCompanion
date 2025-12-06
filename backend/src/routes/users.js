const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  submitSurvey,
  getSurvey,
  getDashboard
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/survey', validationRules.submitSurvey, validate, submitSurvey);
router.get('/survey', getSurvey);
router.get('/dashboard', getDashboard);

module.exports = router;
