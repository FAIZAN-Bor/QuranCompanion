const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const Recitation = require('../models/Recitation');
const Mistake = require('../models/Mistake');
const Progress = require('../models/Progress');

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

/**
 * @desc    Analyze a recitation recording
 * @route   POST /api/recitation/analyze
 * @access  Private
 */
const analyzeRecitation = async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required'
      });
    }

    const { ground_truth, module, levelId, lessonId } = req.body;

    if (!ground_truth || !module) {
      // Clean up uploaded file
      if (req.file?.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'ground_truth and module are required'
      });
    }

    // Create recitation record (pending)
    const recitation = await Recitation.create({
      user: req.user._id,
      module,
      levelId: levelId || `${module.toLowerCase()}_1`,
      lessonId: lessonId || null,
      groundTruth: ground_truth,
      audioUrl: `/uploads/recitations/${req.file.filename}`,
      processingStatus: 'processing'
    });

    // Forward audio to Python AI backend
    let aiResult;
    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(req.file.path), {
        filename: req.file.originalname || req.file.filename,
        contentType: req.file.mimetype || 'audio/wav'
      });
      formData.append('ground_truth', ground_truth);

      const aiResponse = await axios.post(
        `${AI_BACKEND_URL}/analyze`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 120000, // 2 min timeout for AI processing
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      aiResult = aiResponse.data;
    } catch (aiError) {
      console.error('AI Backend Error:', aiError.message);

      // Update recitation as failed
      recitation.processingStatus = 'failed';
      recitation.processingError = aiError.message || 'AI processing failed';
      recitation.processingTime = Date.now() - startTime;
      await recitation.save();

      return res.status(503).json({
        success: false,
        message: 'AI analysis service is currently unavailable. Please try again later.',
        recitationId: recitation._id
      });
    }

    // Map AI results to our schema
    const overallScore = Math.round(aiResult.accuracy_score || 0);
    const pronunciationScore = Math.round(aiResult.pronunciation_score || 0);
    const wordErrorRate = aiResult.word_error_rate || 0;

    // Calculate tajweed score from tajweed_analysis
    let tajweedScore = 0;
    const tajweedAnalysis = [];
    if (aiResult.tajweed_analysis) {
      // AI returns: maddScore, ghunnahScore, shaddahScore, idghamScore, ikhfaScore, iqlabScore, izharScore, qalqalahScore, overall_score
      const ruleNameMap = {
        maddScore: 'Madd',
        ghunnahScore: 'Ghunnah',
        shaddahScore: 'Shaddah',
        idghamScore: 'Idgham',
        ikhfaScore: 'Ikhfa',
        iqlabScore: 'Iqlab',
        izharScore: 'Izhar',
        qalqalahScore: 'Qalqalah'
      };

      for (const [key, label] of Object.entries(ruleNameMap)) {
        if (aiResult.tajweed_analysis[key] !== undefined) {
          const score = aiResult.tajweed_analysis[key];
          tajweedAnalysis.push({
            rule: label,
            score: Math.round(score),
            details: null
          });
        }
      }

      tajweedScore = Math.round(aiResult.tajweed_analysis.overall_score || 0);
    }

    // Calculate weighted overall: (Text×0.5) + (Pronunciation×0.3) + (Tajweed×0.2)
    const textScore = Math.round(Math.max(0, 100 - (wordErrorRate * 100)));
    const weightedOverall = Math.round(
      (textScore * 0.5) + (pronunciationScore * 0.3) + (tajweedScore * 0.2)
    );

    // Map mistakes from AI
    const mistakes = [];
    if (aiResult.mistakes && Array.isArray(aiResult.mistakes)) {
      for (const m of aiResult.mistakes) {
        mistakes.push({
          word: m.word || m.expected || '',
          expected: m.expected || '',
          got: m.got || m.recognized || '',
          type: mapMistakeType(m.type || m.mistake_type),
          position: m.position || 0,
          severity: mapSeverity(m.severity || m.type),
          suggestion: m.suggestion || m.correction || generateSuggestion(m)
        });
      }
    }

    // Update recitation with results
    recitation.recognizedText = aiResult.recognized_text || aiResult.transcription || '';
    recitation.overallScore = weightedOverall;
    recitation.accuracyScore = textScore;
    recitation.pronunciationScore = pronunciationScore;
    recitation.tajweedScore = tajweedScore;
    recitation.wordErrorRate = wordErrorRate;
    recitation.mistakes = mistakes;
    recitation.tajweedAnalysis = tajweedAnalysis;
    recitation.processingStatus = 'completed';
    recitation.processingTime = Date.now() - startTime;

    if (aiResult.word_timestamps) {
      recitation.wordTimestamps = aiResult.word_timestamps.map(w => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: w.confidence || 1
      }));
    }

    await recitation.save();

    // Auto-log significant mistakes to the Mistake collection
    if (mistakes.length > 0 && weightedOverall < 80) {
      try {
        const topMistakes = mistakes.slice(0, 3); // Log top 3 mistakes
        for (const m of topMistakes) {
          await Mistake.create({
            user: req.user._id,
            module,
            levelId: levelId || `${module.toLowerCase()}_1`,
            lessonId: lessonId || 'recitation',
            mistakeType: m.type === 'tajweed' ? 'tajweed' : 'pronunciation',
            title: `${m.type}: "${m.word || m.expected}"`,
            description: m.suggestion || `Expected "${m.expected}", got "${m.got}"`,
            audioUrl: recitation.audioUrl,
            severity: m.severity,
            isResolved: false
          });
        }
      } catch (mistakeErr) {
        console.error('Error logging mistakes:', mistakeErr.message);
        // Non-critical, don't fail the response
      }
    }

    // Return results
    res.status(200).json({
      success: true,
      data: {
        recitationId: recitation._id,
        overallScore: weightedOverall,
        accuracyScore: textScore,
        pronunciationScore,
        tajweedScore,
        wordErrorRate: Math.round(wordErrorRate * 100) / 100,
        recognizedText: recitation.recognizedText,
        groundTruth: ground_truth,
        mistakes,
        tajweedAnalysis,
        processingTime: recitation.processingTime
      }
    });
  } catch (error) {
    // Clean up file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Recitation analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during recitation analysis',
      error: error.message
    });
  }
};

/**
 * @desc    Get recitation history for user
 * @route   GET /api/recitation/history
 * @access  Private
 */
const getRecitationHistory = async (req, res) => {
  try {
    const { module, limit = 20, page = 1 } = req.query;
    const query = { user: req.user._id, processingStatus: 'completed' };
    if (module) query.module = module;

    const recitations = await Recitation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('module levelId groundTruth overallScore accuracyScore pronunciationScore tajweedScore mistakes createdAt');

    const total = await Recitation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: recitations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get recitation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get single recitation detail
 * @route   GET /api/recitation/:id
 * @access  Private
 */
const getRecitationDetail = async (req, res) => {
  try {
    const recitation = await Recitation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!recitation) {
      return res.status(404).json({
        success: false,
        message: 'Recitation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: recitation
    });
  } catch (error) {
    console.error('Get recitation detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper functions
function mapMistakeType(type) {
  const typeMap = {
    'missing': 'missing',
    'deletion': 'missing',
    'substitution': 'substitution',
    'replacement': 'substitution',
    'insertion': 'insertion',
    'addition': 'insertion',
    'tajweed': 'tajweed',
    'pronunciation': 'pronunciation'
  };
  return typeMap[type?.toLowerCase()] || 'pronunciation';
}

function mapSeverity(type) {
  if (['tajweed', 'pronunciation'].includes(type?.toLowerCase())) return 'minor';
  if (['substitution', 'replacement'].includes(type?.toLowerCase())) return 'moderate';
  if (['missing', 'deletion'].includes(type?.toLowerCase())) return 'major';
  return 'moderate';
}

function generateSuggestion(mistake) {
  if (mistake.type === 'missing' || mistake.mistake_type === 'deletion') {
    return `The word "${mistake.expected || mistake.word}" was missed. Try reciting more slowly.`;
  }
  if (mistake.type === 'substitution' || mistake.mistake_type === 'replacement') {
    return `"${mistake.got}" should be "${mistake.expected}". Focus on the correct pronunciation.`;
  }
  if (mistake.type === 'tajweed') {
    return `Tajweed rule not properly applied on "${mistake.word}". Practice this rule separately.`;
  }
  return 'Practice this section again carefully.';
}

module.exports = {
  analyzeRecitation,
  getRecitationHistory,
  getRecitationDetail
};
