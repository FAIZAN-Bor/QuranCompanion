const Content = require('../models/Content');

// @desc    Get all content by type
// @route   GET /api/content/:type
// @access  Public
const getContentByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { difficulty, tags } = req.query;

    let filters = {};
    if (difficulty) filters.difficulty = difficulty;
    if (tags) filters.tags = { $in: tags.split(',') };

    const content = await Content.getByType(type, filters);

    res.status(200).json({
      success: true,
      count: content.length,
      data: { content }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single content by ID
// @route   GET /api/content/detail/:id
// @access  Public
const getContentById = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { content }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get content by number (Surah number, Qaida page, etc.)
// @route   GET /api/content/:type/number/:number
// @access  Public
const getContentByNumber = async (req, res, next) => {
  try {
    const { type, number } = req.params;

    const content = await Content.findOne({
      type,
      number: parseInt(number),
      isActive: true
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { content }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search content
// @route   GET /api/content/search
// @access  Public
const searchContent = async (req, res, next) => {
  try {
    const { q, type } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    let query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { nameArabic: { $regex: q, $options: 'i' } },
        { transliteration: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    };

    if (type) query.type = type;

    const content = await Content.find(query).limit(20);

    res.status(200).json({
      success: true,
      count: content.length,
      data: { content }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Duas by category
// @route   GET /api/content/dua/category/:category
// @access  Public
const getDuasByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const duas = await Content.find({
      type: 'Dua',
      category,
      isActive: true
    }).sort({ order: 1, number: 1 });

    res.status(200).json({
      success: true,
      count: duas.length,
      data: { duas }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContentByType,
  getContentById,
  getContentByNumber,
  searchContent,
  getDuasByCategory
};
