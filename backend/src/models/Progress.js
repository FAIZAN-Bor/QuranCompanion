const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: String,
    enum: ['Qaida', 'Quran', 'Dua'],
    required: true
  },
  levelId: {
    type: String,
    required: true
    // Example: 'qaida_1', 'quran_2', etc.
  },
  lessonId: {
    type: String,
    required: true
    // Example: 'q1_l1', 'qr1_l2', etc.
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    default: null
    // Reference to the actual Quran/Qaida/Dua content
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  attempts: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
progressSchema.index({ user: 1, module: 1, levelId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ user: 1, status: 1 });
progressSchema.index({ user: 1, completedAt: -1 });

const STATUS_PRIORITY = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
};

const normalizeModule = (moduleValue) => {
  const raw = String(moduleValue || '').toLowerCase();
  if (raw === 'qaida') return 'Qaida';
  if (raw === 'quran') return 'Quran';
  if (raw === 'dua') return 'Dua';
  return moduleValue || 'Qaida';
};

const normalizeLevelId = (levelValue, moduleValue) => {
  const raw = String(levelValue || '').toLowerCase();
  const directMatch = raw.match(/(qaida|quran|dua)(?:_level)?_(\d+)/);
  if (directMatch) {
    return `${directMatch[1]}_${Number(directMatch[2])}`;
  }

  const levelOnlyMatch = raw.match(/(\d+)/);
  if (levelOnlyMatch) {
    return `${String(moduleValue || '').toLowerCase()}_${Number(levelOnlyMatch[1])}`;
  }

  return raw;
};

const normalizeLessonId = (lessonValue, contentId) => {
  const raw = String(lessonValue || '').trim().toLowerCase();
  if (raw) {
    return raw
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-]/g, '');
  }

  if (contentId) {
    return `content_${String(contentId)}`;
  }

  return 'lesson';
};

const getActivityTime = (progress) => {
  const ts = new Date(
    progress?.lastAccessedAt ||
    progress?.completedAt ||
    progress?.updatedAt ||
    progress?.createdAt ||
    0
  ).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const buildCanonicalLessonKey = (progress) => {
  const moduleName = normalizeModule(progress?.module);
  const levelId = normalizeLevelId(progress?.levelId, moduleName);
  const lessonId = normalizeLessonId(progress?.lessonId, progress?.contentId);
  return `${moduleName}|${levelId}|${lessonId}`;
};

const mergeProgressRecords = (records) => {
  const byKey = new Map();

  records.forEach((record) => {
    const key = buildCanonicalLessonKey(record);
    const moduleName = normalizeModule(record?.module);
    const levelId = normalizeLevelId(record?.levelId, moduleName);
    const lessonId = normalizeLessonId(record?.lessonId, record?.contentId);
    const accuracy = Number(record?.accuracy || 0);
    const timeSpent = Number(record?.timeSpent || 0);
    const attempts = Number(record?.attempts || 0);
    const coinsEarned = Number(record?.coinsEarned || 0);
    const status = STATUS_PRIORITY[record?.status] != null ? record.status : 'not_started';
    const activityTime = getActivityTime(record);

    if (!byKey.has(key)) {
      byKey.set(key, {
        module: moduleName,
        levelId,
        lessonId,
        status,
        completionPercentage: Number(record?.completionPercentage || 0),
        timeSpent,
        attempts,
        accuracy,
        coinsEarned,
        contentId: record?.contentId || null,
        startedAt: record?.startedAt || null,
        completedAt: record?.completedAt || null,
        lastAccessedAt: record?.lastAccessedAt || null,
        createdAt: record?.createdAt || null,
        updatedAt: record?.updatedAt || null,
        activityTime,
      });
      return;
    }

    const existing = byKey.get(key);

    if (STATUS_PRIORITY[status] > STATUS_PRIORITY[existing.status]) {
      existing.status = status;
    }

    existing.completionPercentage = Math.max(
      Number(existing.completionPercentage || 0),
      Number(record?.completionPercentage || 0)
    );
    existing.timeSpent += timeSpent;
    existing.attempts += attempts;
    existing.accuracy = Math.max(Number(existing.accuracy || 0), accuracy);
    existing.coinsEarned = Math.max(Number(existing.coinsEarned || 0), coinsEarned);

    if (!existing.contentId && record?.contentId) {
      existing.contentId = record.contentId;
    }

    const existingActivity = Number(existing.activityTime || 0);
    if (activityTime > existingActivity) {
      existing.lastAccessedAt = record?.lastAccessedAt || existing.lastAccessedAt;
      existing.completedAt = record?.completedAt || existing.completedAt;
      existing.updatedAt = record?.updatedAt || existing.updatedAt;
      existing.createdAt = record?.createdAt || existing.createdAt;
      existing.startedAt = record?.startedAt || existing.startedAt;
      existing.activityTime = activityTime;
    }
  });

  return Array.from(byKey.values());
};

// Static method to get user's overall progress
progressSchema.statics.getUserProgress = async function(userId) {
  // Get all progress records for the user
  const allProgress = await this.find({ user: new mongoose.Types.ObjectId(userId) });
  const mergedProgress = mergeProgressRecords(allProgress);
  const Content = require('./Content');
  
  // Calculate overall statistics
  const totalLessons = mergedProgress.length;
  const completedLessons = mergedProgress.filter(p => p.status === 'completed').length;
  const totalTimeSpent = mergedProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const accuracyValues = mergedProgress.filter(p => p.accuracy != null && p.accuracy > 0);
  const averageAccuracy = accuracyValues.length > 0 
    ? accuracyValues.reduce((sum, p) => sum + p.accuracy, 0) / accuracyValues.length 
    : 0;
  const totalCoins = mergedProgress.reduce((sum, p) => sum + (p.coinsEarned || 0), 0);
  const completedPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  // Group by module for detailed breakdown using merged records.
  const byModuleMap = mergedProgress.reduce((acc, item) => {
    const moduleName = normalizeModule(item.module);
    if (!acc[moduleName]) {
      acc[moduleName] = {
        _id: moduleName,
        totalLessons: 0,
        completedLessons: 0,
        totalTimeSpent: 0,
        totalCoins: 0,
        _accuracySum: 0,
        _accuracyCount: 0,
        _completedLevels: new Set(),
      };
    }

    acc[moduleName].totalLessons += 1;
    if (item.status === 'completed') {
      acc[moduleName].completedLessons += 1;
      acc[moduleName]._completedLevels.add(item.levelId);
    }
    acc[moduleName].totalTimeSpent += Number(item.timeSpent || 0);
    acc[moduleName].totalCoins += Number(item.coinsEarned || 0);

    const accuracy = Number(item.accuracy || 0);
    if (accuracy > 0) {
      acc[moduleName]._accuracySum += accuracy;
      acc[moduleName]._accuracyCount += 1;
    }

    return acc;
  }, {});

  const byModule = Object.values(byModuleMap).map((moduleSummary) => ({
    _id: moduleSummary._id,
    totalLessons: moduleSummary.totalLessons,
    completedLessons: moduleSummary.completedLessons,
    completedLevelsCount: moduleSummary._completedLevels.size,
    totalTimeSpent: moduleSummary.totalTimeSpent,
    averageAccuracy: moduleSummary._accuracyCount > 0
      ? moduleSummary._accuracySum / moduleSummary._accuracyCount
      : 0,
    totalCoins: moduleSummary.totalCoins,
  }));
  
  // Get User data for currentLevel
  const User = require('./User');
  const user = await User.findById(userId);
  
  // Calculate weekly progress (last 7 days) with dates and accuracy
  const weeklyProgress = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - i);
    
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayProgress = allProgress.filter(p => {
      const activityDate = new Date(p.lastAccessedAt || p.completedAt || p.updatedAt || p.createdAt || 0);
      if (!Number.isFinite(activityDate.getTime())) return false;
      return activityDate >= dayStart && activityDate <= dayEnd;
    });
    
    const dayAccuracy = dayProgress.length > 0
      ? dayProgress.reduce((sum, p) => sum + (p.accuracy || 0), 0) / dayProgress.length
      : 0;
    
    weeklyProgress.push({
      date: dayStart.toISOString(),
      lessonsCompleted: dayProgress.length,
      accuracy: Math.round(dayAccuracy)
    });
  }
  
  // Lessons by type with completed and total counts
  const quranModule = byModule.find(m => m._id === 'Quran');
  const duaModule = byModule.find(m => m._id === 'Dua');
  const qaidaModule = byModule.find(m => m._id === 'Qaida');

  // Use catalog totals from Content collection so lesson totals are not guessed or hardcoded.
  // We count unique levelIds based on distinct aggregation
  const contentTotalsAgg = await Content.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: { type: '$type', levelId: '$levelId' }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        totalLevels: { $sum: 1 }
      }
    }
  ]);

  const contentTotals = contentTotalsAgg.reduce((acc, item) => {
    acc[item._id] = item.totalLevels;
    return acc;
  }, {});
  
  const lessonsByType = {
    Quran: { 
      completed: quranModule?.completedLevelsCount || 0,
      total: contentTotals.Quran || 114
    },
    Dua: { 
      completed: duaModule?.completedLessons || 0,
      total: duaModule?.totalLessons || 0 // Assuming Dua is tracked differently or keeping fallbacks
    },
    Qaida: { 
      completed: qaidaModule?.completedLevelsCount || 0,
      total: contentTotals.Qaida || 14
    }
  };

  // Get most recent activity (includes in-progress access, not only completed lessons).
  const lastProgress = mergedProgress
    .slice()
    .sort((a, b) => {
      const aDate = new Date(a.lastAccessedAt || a.completedAt || a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.lastAccessedAt || b.completedAt || b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    })[0];

  const lastActivity = lastProgress
    ? (lastProgress.lastAccessedAt || lastProgress.completedAt || lastProgress.updatedAt || lastProgress.createdAt || null)
    : null;
  
  return {
    totalLessons,
    completedLessons,
    completedPercentage,
    totalTimeSpent,
    accuracy: Math.round(averageAccuracy),
    totalCoins,
    currentLevel: user?.currentLevel || 'Beginner',
    byModule,
    weeklyProgress,
    lessonsByType,
    lastActivity
  };
};

module.exports = mongoose.model('Progress', progressSchema);
