// Progress Map Data - Gamified Learning Path from Qaida to Quran
// Fallback data when backend is not available

export const progressMapLevels = [
  // Qaida Module
  {
    id: 'qaida_1',
    module: 'Qaida',
    levelNumber: 1,
    title: 'Basic Alphabets',
    subtitle: 'Learn Arabic Letters',
    icon: 'alphabet',
    status: 'unlocked',
    color: '#0A7D4F',
    lessons: [
      { id: 'q1_l1', title: 'Basic Letters', completed: false },
    ],
    quizRequired: true,
    quizId: 'qaida_1_quiz',
    progress: 0
  },
  {
    id: 'qaida_2',
    module: 'Qaida',
    levelNumber: 2,
    title: 'Letter Combinations',
    subtitle: 'Simple Vowel Sounds',
    icon: 'shapes',
    status: 'unlocked',
    color: '#0F9D63',
    lessons: [
      { id: 'q2_l1', title: 'Letter Combinations', completed: false },
    ],
    quizRequired: true,
    quizId: 'qaida_2_quiz',
    progress: 0
  },
  {
    id: 'qaida_3',
    module: 'Qaida',
    levelNumber: 3,
    title: 'Harakat Practice',
    subtitle: 'Fatha, Kasra, Damma',
    icon: 'vowels',
    status: 'unlocked',
    color: '#15B872',
    lessons: [
      { id: 'q3_l1', title: 'Harakat Basics', completed: false },
      { id: 'q3_l2', title: 'Vowel Practice', completed: false },
    ],
    quizRequired: true,
    quizId: 'qaida_3_quiz',
    progress: 0
  },
  {
    id: 'qaida_4',
    module: 'Qaida',
    levelNumber: 4,
    title: 'Advanced Qaida',
    subtitle: 'Tanween & More',
    icon: 'tanween',
    status: 'unlocked',
    color: '#62B26F',
    lessons: [
      { id: 'q4_l1', title: 'Review All Letters', completed: false },
      { id: 'q4_l2', title: 'Advanced Combinations', completed: false },
    ],
    quizRequired: true,
    quizId: 'qaida_4_quiz',
    progress: 0
  },

  // Quran Module
  {
    id: 'quran_1',
    module: 'Quran',
    levelNumber: 1,
    title: 'Short Surahs',
    subtitle: 'Essential Prayers',
    icon: 'quran',
    status: 'unlocked',
    color: '#0A7D4F',
    lessons: [
      { id: 'qr1_l1', title: 'Al-Fatihah', completed: false },
      { id: 'qr1_l2', title: 'Al-Ikhlas', completed: false },
      { id: 'qr1_l3', title: 'Al-Falaq', completed: false },
      { id: 'qr1_l4', title: 'An-Nas', completed: false },
    ],
    quizRequired: true,
    quizId: 'quran_1_quiz',
    progress: 0
  },
  {
    id: 'quran_2',
    module: 'Quran',
    levelNumber: 2,
    title: 'More Surahs',
    subtitle: 'Expand Your Knowledge',
    icon: 'quran',
    status: 'unlocked',
    color: '#0F9D63',
    lessons: [
      { id: 'qr2_l1', title: 'Al-Kawthar', completed: false },
      { id: 'qr2_l2', title: 'Al-Asr', completed: false },
      { id: 'qr2_l3', title: 'Al-Maun', completed: false },
    ],
    quizRequired: true,
    quizId: 'quran_2_quiz',
    progress: 0
  },
  {
    id: 'quran_3',
    module: 'Quran',
    levelNumber: 3,
    title: 'Intermediate Surahs',
    subtitle: 'Building Knowledge',
    icon: 'quran',
    status: 'unlocked',
    color: '#15B872',
    lessons: [
      { id: 'qr3_l1', title: 'Al-Fil', completed: false },
      { id: 'qr3_l2', title: 'Quraish', completed: false },
      { id: 'qr3_l3', title: 'Al-Humazah', completed: false },
    ],
    quizRequired: true,
    quizId: 'quran_3_quiz',
    progress: 0
  },
  {
    id: 'quran_4',
    module: 'Quran',
    levelNumber: 4,
    title: 'Advanced Quran',
    subtitle: 'Master the Recitation',
    icon: 'quran',
    status: 'unlocked',
    color: '#A3D39C',
    lessons: [
      { id: 'qr4_l1', title: 'All Surahs Review', completed: false },
      { id: 'qr4_l2', title: 'Complete Practice', completed: false },
    ],
    quizRequired: true,
    quizId: 'quran_4_quiz',
    progress: 0
  }
];

// Calculate overall progress
export const calculateOverallProgress = () => {
  let totalLessons = 0;
  let completedLessons = 0;

  progressMapLevels.forEach(level => {
    totalLessons += level.lessons.length;
    completedLessons += level.lessons.filter(l => l.completed).length;
  });

  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
};

// Helper functions
export const getLevelById = (levelId) => {
  return progressMapLevels.find(level => level.id === levelId);
};

export const getNextLevel = (currentLevelId) => {
  const currentIndex = progressMapLevels.findIndex(level => level.id === currentLevelId);
  if (currentIndex !== -1 && currentIndex < progressMapLevels.length - 1) {
    return progressMapLevels[currentIndex + 1];
  }
  return null;
};

export const isLevelCompleted = (levelId) => {
  const level = getLevelById(levelId);
  if (!level) return false;
  return level.lessons.every(lesson => lesson.completed);
};
