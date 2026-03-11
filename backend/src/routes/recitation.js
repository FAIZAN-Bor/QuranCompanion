const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
  analyzeRecitation,
  getRecitationHistory,
  getRecitationDetail
} = require('../controllers/recitationController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/recitations');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `recitation-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept common audio formats
  const allowedTypes = [
    'audio/wav', 'audio/wave', 'audio/x-wav',
    'audio/mp3', 'audio/mpeg',
    'audio/mp4', 'audio/m4a', 'audio/x-m4a',
    'audio/aac',
    'audio/ogg', 'audio/webm',
    'application/octet-stream' // Some mobile recorders send this
  ];

  if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// Routes
// POST /api/recitation/analyze - Upload audio and get AI analysis
router.post('/analyze', protect, upload.single('audio'), analyzeRecitation);

// GET /api/recitation/history - Get user's recitation history
router.get('/history', protect, getRecitationHistory);

// GET /api/recitation/:id - Get single recitation detail
router.get('/:id', protect, getRecitationDetail);

// Multer error handling
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
});

module.exports = router;
