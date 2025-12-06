const express = require('express');
const router = express.Router();
const {
  getContentByType,
  getContentById,
  getContentByNumber,
  searchContent,
  getDuasByCategory
} = require('../controllers/contentController');

// All routes are public (content is accessible to all)

router.get('/search', searchContent);
router.get('/:type', getContentByType);
router.get('/detail/:id', getContentById);
router.get('/:type/number/:number', getContentByNumber);
router.get('/dua/category/:category', getDuasByCategory);

module.exports = router;
