// Progress Map Data - Gamified Learning Path from Qaida to Quran
import { QuidaData } from './QuidaData';
import { QuranData } from './QuranData';

export const progressMapLevels = [
  // Qaida Module - Using actual QuidaData
  {
    id: 'qaida_1',
    module: 'Qaida',
    levelNumber: 1,
    title: 'Basic Alphabets',
    subtitle: 'Learn Arabic Letters',
    icon: 'alphabet',
    status: 'unlocked', // All unlocked for testing
    color: '#0A7D4F',
    quidaData: [QuidaData[0]], // Basic lesson
    lessons: [
      { id: 'q1_l1', title: QuidaData[0].name, quidaIndex: 0, completed: false },
    ],
    quizRequired: true,
    quizId: 'qaida_1_quiz'
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
    quidaData: [QuidaData[1]], // Simple Combinations
    lessons: [
      { id: 'q2_l1', title: QuidaData[1].name, quidaIndex: 1, completed: false },
    ],
    quizRequired: true,
    quizId: 'qaida_2_quiz'
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
    quidaData: QuidaData.length > 0 ? [QuidaData[0]] : [],
    lessons: [
      { id: 'q3_l1', title: 'Harakat Basics', quidaIndex: 0, completed: false },
      { id: 'q3_l2', title: 'Vowel Practice', quidaIndex: 1, completed: false },
    ],
    quizRequired: true,
    quizId: 'qaida_3_quiz'
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
    quidaData: QuidaData,
    lessons: [
      { id: 'q4_l1', title: 'Review All Letters', quidaIndex: 0, completed: false },
      { id: 'q4_l2', title: 'Advanced Combinations', quidaIndex: 1, completed: false },
    ],
    quizRequired: true,
    quizId: 'qaida_4_quiz'
  },

  // Quran Module - Using actual QuranData
  {
    id: 'quran_1',
    module: 'Quran',
    levelNumber: 1,
    title: 'Short Surahs',
    subtitle: 'Essential Prayers',
    icon: 'quran',
    status: 'unlocked',
    color: '#0A7D4F',
    quranData: QuranData.slice(0, 4), // Al-Ikhlas, Al-Falaq, An-Nas, Al-Fatihah
    lessons: [
      { id: 'qr1_l1', title: QuranData[0]?.name || 'Al-Ikhlas', quranIndex: 0, completed: false },
      { id: 'qr1_l2', title: QuranData[1]?.name || 'Al-Falaq', quranIndex: 1, completed: false },
      { id: 'qr1_l3', title: QuranData[2]?.name || 'An-Nas', quranIndex: 2, completed: false },
      { id: 'qr1_l4', title: QuranData[3]?.name || 'Al-Fatihah', quranIndex: 3, completed: false },
    ],
    quizRequired: true,
    quizId: 'quran_1_quiz'
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
    quranData: QuranData.slice(4, 8), // Al-Kawthar, Al-Asr, Al-Maun, etc.
    lessons: [
      { id: 'qr2_l1', title: QuranData[4]?.name || 'Al-Kawthar', quranIndex: 4, completed: false },
      { id: 'qr2_l2', title: QuranData[5]?.name || 'Al-Asr', quranIndex: 5, completed: false },
      { id: 'qr2_l3', title: QuranData[6]?.name || 'Al-Maun', quranIndex: 6, completed: false },
    ],
    quizRequired: true,
    quizId: 'quran_2_quiz'
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
    quranData: QuranData.length > 8 ? QuranData.slice(8, 12) : QuranData.slice(0, 4),
    lessons: [
      { id: 'qr3_l1', title: 'Surah 1', quranIndex: 0, completed: false },
      { id: 'qr3_l2', title: 'Surah 2', quranIndex: 1, completed: false },
      { id: 'qr3_l3', title: 'Surah 3', quranIndex: 2, completed: false },
    ],
    quizRequired: true,
    quizId: 'quran_3_quiz'
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
    quranData: QuranData,
    lessons: [
      { id: 'qr4_l1', title: 'All Surahs Review', quranIndex: 0, completed: false },
      { id: 'qr4_l2', title: 'Complete Practice', quranIndex: 1, completed: false },
    ],
    quizRequired: true,
    quizId: 'quran_4_quiz'
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
