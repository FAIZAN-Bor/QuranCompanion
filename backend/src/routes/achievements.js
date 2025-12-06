const express = require('express');
const router = express.Router();
const {
  getAchievements,
  getAchievementById,
  getCoinHistory,
  getCoinStats
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.get('/', getAchievements);
router.get('/coins/history', getCoinHistory);
router.get('/coins/stats', getCoinStats);
router.get('/:id', validationRules.mongoId, validate, getAchievementById);

module.exports = router;
