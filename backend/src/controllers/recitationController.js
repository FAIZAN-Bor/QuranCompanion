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

    const { ground_truth, module, levelId, lessonId, reference_audio_url } = req.body;

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
      formData.append('module', module);
      if (reference_audio_url) {
        formData.append('reference_audio_url', reference_audio_url);
      }

      // Extract lesson number for Qaida dynamic weighting
      // levelId format: "qaida_level_4" or lessonId format: "character_3"
      const lessonNum = extractLessonNumber(levelId, lessonId, module);
      formData.append('lesson_number', String(lessonNum));

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
    const overallScore = Math.round(aiResult.accuracy_score || aiResult.accuracyScore || 0);
    const pronunciationScore = Math.round(aiResult.pronunciation_score || 0);
    const aiWordErrorRateRaw = Number(aiResult.word_error_rate ?? aiResult.wordErrorRate ?? 0);
    const wordErrorRate = Number.isNaN(aiWordErrorRateRaw)
      ? 0
      : (aiWordErrorRateRaw > 1 ? aiWordErrorRateRaw / 100 : aiWordErrorRateRaw);

    // Calculate tajweed score from tajweed_analysis
    let tajweedScore = 0;
    const tajweedAnalysis = [];
    if (aiResult.tajweed_analysis) {
      // Include only applicable rules from AI metadata and mark whether each rule was fulfilled.
      const step6Tajweed = aiResult.pipeline_steps?.step_6_tajweed || {};
      const ruleTotals = step6Tajweed.rule_totals || {};
      const detailedRules = step6Tajweed.detailed_rules || {};
      const hasRuleTotalsMetadata = Object.keys(ruleTotals).length > 0;

      const tajweedRuleMap = [
        { scoreKey: 'maddScore', label: 'Madd', detailKey: 'madd' },
        { scoreKey: 'ghunnahScore', label: 'Ghunnah', detailKey: 'ghunnah' },
        { scoreKey: 'shaddahScore', label: 'Shaddah', detailKey: 'shaddah' },
        { scoreKey: 'idghamScore', label: 'Idgham', detailKey: 'idgham' },
        { scoreKey: 'ikhfaScore', label: 'Ikhfa', detailKey: 'ikhfa' },
        { scoreKey: 'iqlabScore', label: 'Iqlab', detailKey: 'iqlab' },
        { scoreKey: 'izharScore', label: 'Izhar', detailKey: 'izhar' },
        { scoreKey: 'qalqalahScore', label: 'Qalqalah', detailKey: 'qalqalah' },
        { scoreKey: 'heavyLetterScore', label: 'Heavy Letters', detailKey: 'heavy_letters' }
      ];

      for (const { scoreKey, label, detailKey } of tajweedRuleMap) {
        const rawScore = aiResult.tajweed_analysis[scoreKey];
        const totalChecksRaw = Number(ruleTotals[detailKey]);
        const totalChecks = Number.isNaN(totalChecksRaw) ? 0 : totalChecksRaw;
        const applicable = hasRuleTotalsMetadata
          ? totalChecks > 0
          : rawScore !== undefined && rawScore !== null;
        if (!applicable) continue;

        const numericScore = Number(rawScore);
        const score = Number.isNaN(numericScore) ? 0 : Math.round(numericScore);

        const ruleDetail = detailedRules[detailKey] || {};
        const fulfilled = typeof ruleDetail.passed === 'boolean'
          ? ruleDetail.passed
          : score >= 80;

        tajweedAnalysis.push({
          rule: label,
          score,
          applicable,
          fulfilled,
          totalChecks,
          details: fulfilled
            ? `Fulfilled in ${totalChecks} check${totalChecks === 1 ? '' : 's'}`
            : `Not fulfilled in one or more of ${totalChecks} check${totalChecks === 1 ? '' : 's'}`
        });
      }

      tajweedScore = Math.round(aiResult.tajweed_analysis.overall_score || 0);
    }

    // Dynamic weighting — must match the Python AI scoring formula
    // Qaida Lessons 1-3: 100% pronunciation (isolated sounds)
    // Qaida Lessons 4-6: 60% pronunciation + 40% tajweed (timing checks)
    // Quran / Qaida 7+:  50% text + 30% pronunciation + 20% tajweed
    
    let textScore = 0;
    if (aiResult.text_accuracy !== undefined) {
      textScore = Math.round(Math.max(0, Math.min(100, aiResult.text_accuracy)));
    } else {
      const aiTextAccuracyRaw = Number(aiResult.accuracy_score ?? aiResult.accuracyScore);
      textScore = Number.isNaN(aiTextAccuracyRaw)
        ? Math.round(Math.max(0, 100 - (wordErrorRate * 100)))
        : Math.round(Math.max(0, Math.min(100, aiTextAccuracyRaw)));
    }
    
    const lessonNum = extractLessonNumber(levelId, lessonId, module);
    let weightedOverall;

    if (module === 'Qaida' && lessonNum >= 1 && lessonNum <= 3) {
      weightedOverall = Math.round(pronunciationScore);
    } else if (module === 'Qaida' && lessonNum >= 4 && lessonNum <= 6) {
      weightedOverall = Math.round((pronunciationScore * 0.6) + (tajweedScore * 0.4));
    } else {
      weightedOverall = Math.round(
        (textScore * 0.5) + (pronunciationScore * 0.3) + (tajweedScore * 0.2)
      );
    }

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

    // Auto-log significant mistakes to the Mistake collection has been disabled
    // to strictly enforce the "5 attempts before mistake" rule from the client.

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

/**
 * Extract the Qaida lesson number from levelId or lessonId.
 * Supports formats like: "qaida_level_4", "level_3", "4", "character_5"
 */
function extractLessonNumber(levelId, lessonId, module) {
  if (module !== 'Qaida') return 0;

  // Try extracting from levelId first (e.g., "qaida_level_4")
  if (levelId) {
    const match = levelId.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }

  // Fallback: try lessonId
  if (lessonId) {
    const match = lessonId.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }

  return 0;
}

function mapMistakeType(type) {
  const typeMap = {
    // Text-based types (from Whisper text comparison)
    'missing': 'missing',
    'deletion': 'missing',
    'substitution': 'substitution',
    'replacement': 'substitution',
    'mispronounced': 'substitution',    // Python AI sends this for text mismatches
    'insertion': 'insertion',
    'addition': 'insertion',
    'extra': 'insertion',               // Python AI sends this for extra words
    // Tajweed types (from Tajweed duration engine)
    'tajweed': 'tajweed',
    'madd_short': 'tajweed',
    'ghunnah_missing': 'tajweed',
    'shaddah_short': 'tajweed',
    'tafkheem_weak': 'tajweed',
    'idgham_missing': 'tajweed',
    'ikhfa_missing': 'tajweed',
    'iqlab_missing': 'tajweed',
    'izhar_missing': 'tajweed',
    'qalqalah_missing': 'tajweed',
    // Pure pronunciation
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
