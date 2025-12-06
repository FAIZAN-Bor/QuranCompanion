const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');
const Content = require('./models/Content');
const Progress = require('./models/Progress');
const Notification = require('./models/Notification');
const Achievement = require('./models/Achievement');
const Mistake = require('./models/Mistake');
const QuizResult = require('./models/QuizResult');
const CoinTransaction = require('./models/CoinTransaction');
const ParentChild = require('./models/ParentChild');

// Helper function for dates
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

// Sample data for initialization
const sampleUsers = [
  {
    name: 'Ahmed Khan',
    email: 'ahmed@test.com',
    password: 'password123',
    role: 'child',
    coins: 450,
    proficiencyLevel: 'Intermediate',
    currentLevel: 'qaida_4',
    totalLessonsCompleted: 25,
    totalQuizzesCompleted: 8,
    accuracy: 85,
    streakDays: 7,
    lastActiveDate: hoursAgo(2),
    isEmailVerified: true
  },
  {
    name: 'Fatima Ali',
    email: 'fatima@test.com',
    password: 'password123',
    role: 'child',
    coins: 680,
    proficiencyLevel: 'Advanced',
    currentLevel: 'quran_2',
    totalLessonsCompleted: 42,
    totalQuizzesCompleted: 15,
    accuracy: 92,
    streakDays: 12,
    lastActiveDate: hoursAgo(5),
    isEmailVerified: true
  },
  {
    name: 'Test Parent',
    email: 'parent@test.com',
    password: 'password123',
    role: 'parent',
    isEmailVerified: true
  },
  {
    name: 'Test Learner',
    email: 'learner@test.com',
    password: 'password123',
    role: 'child',
    coins: 150,
    proficiencyLevel: 'Beginner',
    currentLevel: 'qaida_1',
    totalLessonsCompleted: 5,
    accuracy: 85.5,
    isEmailVerified: true
  }
];

// Qaida content (Basic Arabic letters and rules)
const qaidaContent = [
  {
    type: 'Qaida',
    name: 'Basic Letters',
    nameArabic: 'الحروف الأساسية',
    number: 1,
    lesson: 'Introduction to Arabic letters - Alif, Ba, Ta',
    arabicText: 'أ ب ت ث ج ح خ',
    transliteration: 'Alif, Ba, Ta, Tha, Jeem, Ha, Kha',
    translation: 'Basic Arabic alphabet letters',
    difficulty: 'beginner',
    tags: ['alphabet', 'basics', 'letters'],
    isActive: true,
    characters: [
      { arabic: "ا", english: "Alif" },
      { arabic: "ب", english: "Bay" },
      { arabic: "ت", english: "Tay" },
      { arabic: "ث", english: "Say" },
      { arabic: "ج", english: "Jeem" },
      { arabic: "ح", english: "Haa" },
      { arabic: "خ", english: "Khaa" },
      { arabic: "د", english: "Daal" },
      { arabic: "ذ", english: "Zaal" },
      { arabic: "ر", english: "Ray" },
      { arabic: "ز", english: "Zay" },
      { arabic: "س", english: "Seen" },
      { arabic: "ش", english: "Sheen" },
      { arabic: "ص", english: "Saad" },
      { arabic: "ض", english: "Daad" },
      { arabic: "ط", english: "Taa" },
      { arabic: "ظ", english: "Zaa" },
      { arabic: "ع", english: "Ain" },
      { arabic: "غ", english: "Ghain" },
      { arabic: "ف", english: "Fay" },
      { arabic: "ق", english: "Qaf" },
      { arabic: "ک", english: "Kaaf" },
      { arabic: "ل", english: "Laam" },
      { arabic: "م", english: "Meem" },
      { arabic: "ن", english: "Noon" },
      { arabic: "و", english: "Waw" },
      { arabic: "ہ", english: "Haa" },
      { arabic: "ء", english: "Hamza" },
      { arabic: "ی", english: "Yay" },
      { arabic: "ے", english: "Bari Yay" }
    ]
  },
  {
    type: 'Qaida',
    name: 'Vowel Marks',
    nameArabic: 'الحركات',
    number: 2,
    lesson: 'Learning Fatha, Kasra, and Damma',
    arabicText: 'فَتْحَة كَسْرَة ضَمَّة',
    transliteration: 'Fatha, Kasra, Damma',
    translation: 'Short vowel marks in Arabic',
    difficulty: 'beginner',
    tags: ['vowels', 'harakat', 'pronunciation'],
    isActive: true,
    characters: [
      { arabic: "بَ", english: "Ba with Fatha" },
      { arabic: "بِ", english: "Ba with Kasra" },
      { arabic: "بُ", english: "Ba with Damma" },
      { arabic: "تَ", english: "Ta with Fatha" },
      { arabic: "تِ", english: "Ta with Kasra" },
      { arabic: "تُ", english: "Ta with Damma" },
      { arabic: "جَ", english: "Jeem with Fatha" },
      { arabic: "جِ", english: "Jeem with Kasra" },
      { arabic: "جُ", english: "Jeem with Damma" }
    ]
  },
  {
    type: 'Qaida',
    name: 'Letter Combinations',
    nameArabic: 'تركيب الحروف',
    number: 3,
    lesson: 'Combining letters to form words',
    arabicText: 'كَتَبَ قَرَأَ',
    transliteration: 'Kataba, Qara\'a',
    translation: 'He wrote, He read',
    difficulty: 'intermediate',
    tags: ['words', 'combinations', 'reading'],
    isActive: true,
    characters: [
      { arabic: "با", english: "Baa" },
      { arabic: "بو", english: "Boo" },
      { arabic: "بی", english: "Bee" },
      { arabic: "تا", english: "Taa" },
      { arabic: "تو", english: "Too" },
      { arabic: "تی", english: "Tee" },
      { arabic: "ثا", english: "Saa" },
      { arabic: "ثو", english: "Soo" },
      { arabic: "ثی", english: "See" },
      { arabic: "جا", english: "Jaa" },
      { arabic: "جو", english: "Joo" },
      { arabic: "جی", english: "Jee" }
    ]
  },
  {
    type: 'Qaida',
    name: 'Sukoon and Shadda',
    nameArabic: 'السكون والشدة',
    number: 4,
    lesson: 'Understanding Sukoon (no vowel) and Shadda (doubling)',
    arabicText: 'سُكُون شَدَّة',
    transliteration: 'Sukoon, Shadda',
    translation: 'Silence mark and doubling mark',
    difficulty: 'intermediate',
    tags: ['advanced-marks', 'pronunciation'],
    isActive: true,
    characters: [
      { arabic: "بْ", english: "Ba with Sukoon" },
      { arabic: "تْ", english: "Ta with Sukoon" },
      { arabic: "بَّ", english: "Ba with Shadda" },
      { arabic: "تَّ", english: "Ta with Shadda" },
      { arabic: "مَدَّ", english: "Madda" },
      { arabic: "سَبَّحَ", english: "Sabbaha" }
    ]
  }
];

// Quran content (Short Surahs from Juz 30)
const quranContent = [
  {
    type: 'Quran',
    name: 'Al-Fatihah',
    nameArabic: 'الفاتحة',
    number: 1,
    totalAyahs: 7,
    revelation: 'Makki',
    juz: 1,
    arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Bismillah ir-Rahman ir-Raheem',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
    difficulty: 'beginner',
    tags: ['essential', 'prayer', 'opening'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'Al-Ikhlas',
    nameArabic: 'الإخلاص',
    number: 112,
    totalAyahs: 4,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    transliteration: 'Qul Huwa Allahu Ahad',
    translation: 'Say: He is Allah, the One',
    difficulty: 'beginner',
    tags: ['tawheed', 'short-surah', 'juz-30'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'Al-Falaq',
    nameArabic: 'الفلق',
    number: 113,
    totalAyahs: 5,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    transliteration: 'Qul A\'udhu bi Rabbi al-Falaq',
    translation: 'Say: I seek refuge with the Lord of the dawn',
    difficulty: 'beginner',
    tags: ['protection', 'short-surah', 'juz-30'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'An-Nas',
    nameArabic: 'الناس',
    number: 114,
    totalAyahs: 6,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: 'Qul A\'udhu bi Rabbi an-Nas',
    translation: 'Say: I seek refuge with the Lord of mankind',
    difficulty: 'beginner',
    tags: ['protection', 'short-surah', 'juz-30'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'Al-Kawthar',
    nameArabic: 'الكوثر',
    number: 108,
    totalAyahs: 3,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
    transliteration: 'Inna A\'tayna Ka al-Kawthar',
    translation: 'Indeed, We have granted you abundance',
    difficulty: 'beginner',
    tags: ['abundance', 'short-surah', 'juz-30'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'Al-Asr',
    nameArabic: 'العصر',
    number: 103,
    totalAyahs: 3,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'وَالْعَصْرِ',
    transliteration: 'Wal-Asr',
    translation: 'By time',
    difficulty: 'beginner',
    tags: ['time', 'faith', 'short-surah', 'juz-30'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'Al-Maun',
    nameArabic: 'الماعون',
    number: 107,
    totalAyahs: 7,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ',
    transliteration: 'Ara\'ayta Alladhi Yukadhdhibu bi ad-Deen',
    translation: 'Have you seen the one who denies the Recompense?',
    difficulty: 'intermediate',
    tags: ['charity', 'prayer', 'juz-30'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'Al-Fil',
    nameArabic: 'الفيل',
    number: 105,
    totalAyahs: 5,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ',
    transliteration: 'Alam Tara Kayfa Fa\'ala Rabbuka bi Ashabi al-Feel',
    translation: 'Have you not seen how your Lord dealt with the companions of the elephant?',
    difficulty: 'intermediate',
    tags: ['history', 'kaaba', 'juz-30'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'Quraish',
    nameArabic: 'قريش',
    number: 106,
    totalAyahs: 4,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'لِإِيلَافِ قُرَيْشٍ',
    transliteration: 'Li-Ilafi Quraish',
    translation: 'For the accustomed security of the Quraish',
    difficulty: 'intermediate',
    tags: ['gratitude', 'tribe', 'juz-30'],
    isActive: true
  },
  {
    type: 'Quran',
    name: 'Al-Humazah',
    nameArabic: 'الهمزة',
    number: 104,
    totalAyahs: 9,
    revelation: 'Makki',
    juz: 30,
    arabicText: 'وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ',
    transliteration: 'Waylun Likulli Humazatin Lumazah',
    translation: 'Woe to every scorner and mocker',
    difficulty: 'intermediate',
    tags: ['warning', 'character', 'juz-30'],
    isActive: true
  }
];

// Dua content (Daily supplications)
const duaContent = [
  {
    type: 'Dua',
    name: 'Morning Dua',
    nameArabic: 'دعاء الصباح',
    number: 1,
    category: 'Morning',
    arabicText: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
    transliteration: 'Asbaḥnā wa aṣbaḥa-l-mulku lillāh',
    translation: 'We have entered morning and the dominion belongs to Allah',
    difficulty: 'beginner',
    tags: ['morning', 'daily', 'essential'],
    isActive: true
  },
  {
    type: 'Dua',
    name: 'Evening Dua',
    nameArabic: 'دعاء المساء',
    number: 2,
    category: 'Evening',
    arabicText: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',
    transliteration: 'Amsaynā wa amsā-l-mulku lillāh',
    translation: 'We have entered evening and the dominion belongs to Allah',
    difficulty: 'beginner',
    tags: ['evening', 'daily', 'essential'],
    isActive: true
  },
  {
    type: 'Dua',
    name: 'Before Eating',
    nameArabic: 'دعاء قبل الأكل',
    number: 3,
    category: 'Eating',
    arabicText: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah',
    difficulty: 'beginner',
    tags: ['eating', 'food', 'daily'],
    isActive: true
  },
  {
    type: 'Dua',
    name: 'After Eating',
    nameArabic: 'دعاء بعد الأكل',
    number: 4,
    category: 'Eating',
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا',
    transliteration: 'Alḥamdu lillāhi-lladhī aṭʿamanā wa saqānā',
    translation: 'Praise be to Allah who has fed us and given us drink',
    difficulty: 'beginner',
    tags: ['eating', 'gratitude', 'daily'],
    isActive: true
  },
  {
    type: 'Dua',
    name: 'Before Sleeping',
    nameArabic: 'دعاء قبل النوم',
    number: 5,
    category: 'Sleeping',
    arabicText: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allāhumma amūtu wa aḥyā',
    translation: 'In Your name, O Allah, I die and I live',
    difficulty: 'beginner',
    tags: ['sleeping', 'night', 'daily'],
    isActive: true
  },
  {
    type: 'Dua',
    name: 'Upon Waking',
    nameArabic: 'دعاء الاستيقاظ',
    number: 6,
    category: 'Morning',
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا',
    transliteration: 'Alḥamdu lillāhi-lladhī aḥyānā baʿda mā amātanā',
    translation: 'Praise be to Allah who gave us life after death',
    difficulty: 'beginner',
    tags: ['morning', 'waking', 'daily'],
    isActive: true
  },
  {
    type: 'Dua',
    name: 'Entering Home',
    nameArabic: 'دعاء دخول المنزل',
    number: 7,
    category: 'Daily',
    arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ',
    transliteration: 'Allāhumma innī as\'aluka khayra-l-mawlaj',
    translation: 'O Allah, I ask You for the best entering',
    difficulty: 'intermediate',
    tags: ['home', 'daily', 'travel'],
    isActive: true
  },
  {
    type: 'Dua',
    name: 'Leaving Home',
    nameArabic: 'دعاء الخروج من المنزل',
    number: 8,
    category: 'Daily',
    arabicText: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ',
    transliteration: 'Bismillāh, tawakkaltu ʿalā-llāh',
    translation: 'In the name of Allah, I place my trust in Allah',
    difficulty: 'beginner',
    tags: ['travel', 'daily', 'protection'],
    isActive: true
  }
];

// Sample progress data - will be linked to children after creation
// Helper to add variation to data
const vary = (baseValue, variant, range = 10) => {
  const offset = variant === 'A' ? 0 : (variant === 'B' ? range : -range);
  return Math.min(100, Math.max(0, baseValue + offset));
};

const createProgressData = (userId, variant = 'A') => {
  const isVariantB = variant === 'B';
  const dayOffset = isVariantB ? 1 : 0; // Fatima's progress is offset by 1 day
  const accuracyBoost = isVariantB ? 5 : 0; // Fatima has slightly higher accuracy
  
  return [
  // Qaida lessons - completed over last 7 days
  {
    user: userId,
    module: 'Qaida',
    levelId: isVariantB ? 'qaida_2' : 'qaida_1',
    lessonId: isVariantB ? 'q2_l1' : 'q1_l1',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(95, variant),
    coinsEarned: isVariantB ? 18 : 15,
    timeSpent: isVariantB ? 280 : 300,
    attempts: 1,
    startedAt: daysAgo(7 - dayOffset),
    completedAt: daysAgo(6 - dayOffset),
    lastAccessedAt: daysAgo(6 - dayOffset)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: isVariantB ? 'qaida_2' : 'qaida_1',
    lessonId: isVariantB ? 'q2_l2' : 'q1_l2',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(88, variant),
    coinsEarned: isVariantB ? 15 : 12,
    timeSpent: isVariantB ? 380 : 420,
    attempts: isVariantB ? 1 : 2,
    startedAt: daysAgo(6 - dayOffset),
    completedAt: daysAgo(5 - dayOffset),
    lastAccessedAt: daysAgo(5 - dayOffset)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: isVariantB ? 'qaida_3' : 'qaida_2',
    lessonId: isVariantB ? 'q3_l1' : 'q2_l1',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(92, variant),
    coinsEarned: isVariantB ? 18 : 15,
    timeSpent: isVariantB ? 320 : 350,
    attempts: 1,
    startedAt: daysAgo(5 - dayOffset),
    completedAt: daysAgo(4 - dayOffset),
    lastAccessedAt: daysAgo(4 - dayOffset)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: isVariantB ? 'qaida_3' : 'qaida_2',
    lessonId: isVariantB ? 'q3_l2' : 'q2_l2',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(78, variant, 8),
    coinsEarned: isVariantB ? 14 : 10,
    timeSpent: isVariantB ? 400 : 500,
    attempts: isVariantB ? 2 : 3,
    startedAt: daysAgo(4 - dayOffset),
    completedAt: daysAgo(3 - dayOffset),
    lastAccessedAt: daysAgo(3 - dayOffset)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: isVariantB ? 'qaida_4' : 'qaida_3',
    lessonId: isVariantB ? 'q4_l1' : 'q3_l1',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(85, variant),
    coinsEarned: isVariantB ? 16 : 12,
    timeSpent: isVariantB ? 340 : 380,
    attempts: isVariantB ? 1 : 2,
    startedAt: daysAgo(3 - dayOffset),
    completedAt: daysAgo(2 - dayOffset),
    lastAccessedAt: daysAgo(2 - dayOffset)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: isVariantB ? 'qaida_4' : 'qaida_3',
    lessonId: isVariantB ? 'q4_l2' : 'q3_l2',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(90, variant),
    coinsEarned: isVariantB ? 17 : 14,
    timeSpent: isVariantB ? 290 : 320,
    attempts: 1,
    startedAt: daysAgo(2 - dayOffset),
    completedAt: daysAgo(1),
    lastAccessedAt: daysAgo(1)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: isVariantB ? 'qaida_5' : 'qaida_4',
    lessonId: isVariantB ? 'q5_l1' : 'q4_l1',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(83, variant),
    coinsEarned: isVariantB ? 15 : 12,
    timeSpent: isVariantB ? 360 : 400,
    attempts: isVariantB ? 1 : 2,
    startedAt: daysAgo(1),
    completedAt: hoursAgo(isVariantB ? 5 : 3),
    lastAccessedAt: hoursAgo(isVariantB ? 5 : 3)
  },
  // Quran lessons - Fatima has more progress
  {
    user: userId,
    module: 'Quran',
    levelId: 'quran_1',
    lessonId: 'qr1_l1',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(88, variant),
    coinsEarned: isVariantB ? 25 : 20,
    timeSpent: isVariantB ? 550 : 600,
    attempts: 1,
    startedAt: daysAgo(isVariantB ? 6 : 5),
    completedAt: daysAgo(isVariantB ? 5 : 4),
    lastAccessedAt: daysAgo(isVariantB ? 5 : 4)
  },
  {
    user: userId,
    module: 'Quran',
    levelId: 'quran_1',
    lessonId: 'qr1_l2',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(92, variant),
    coinsEarned: isVariantB ? 26 : 22,
    timeSpent: isVariantB ? 500 : 550,
    attempts: 1,
    startedAt: daysAgo(isVariantB ? 4 : 3),
    completedAt: daysAgo(isVariantB ? 3 : 2),
    lastAccessedAt: daysAgo(isVariantB ? 3 : 2)
  },
  // Fatima has completed this lesson, Ahmed is in progress
  {
    user: userId,
    module: 'Quran',
    levelId: 'quran_1',
    lessonId: 'qr1_l3',
    status: isVariantB ? 'completed' : 'in_progress',
    completionPercentage: isVariantB ? 100 : 60,
    accuracy: isVariantB ? 94 : 75,
    coinsEarned: isVariantB ? 24 : 5,
    timeSpent: isVariantB ? 520 : 180,
    attempts: 1,
    startedAt: hoursAgo(isVariantB ? 8 : 2),
    completedAt: isVariantB ? hoursAgo(6) : undefined,
    lastAccessedAt: hoursAgo(isVariantB ? 6 : 2)
  },
  // Fatima has additional Quran lessons
  ...(isVariantB ? [{
    user: userId,
    module: 'Quran',
    levelId: 'quran_2',
    lessonId: 'qr2_l1',
    status: 'completed',
    completionPercentage: 100,
    accuracy: 96,
    coinsEarned: 28,
    timeSpent: 480,
    attempts: 1,
    startedAt: daysAgo(2),
    completedAt: daysAgo(1),
    lastAccessedAt: daysAgo(1)
  },
  {
    user: userId,
    module: 'Quran',
    levelId: 'quran_2',
    lessonId: 'qr2_l2',
    status: 'in_progress',
    completionPercentage: 45,
    accuracy: 88,
    coinsEarned: 8,
    timeSpent: 200,
    attempts: 1,
    startedAt: hoursAgo(4),
    lastAccessedAt: hoursAgo(4)
  }] : []),
  // Dua lessons
  {
    user: userId,
    module: 'Dua',
    levelId: 'dua_1',
    lessonId: 'd1_l1',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(95, variant),
    coinsEarned: isVariantB ? 12 : 10,
    timeSpent: isVariantB ? 180 : 200,
    attempts: 1,
    startedAt: daysAgo(6),
    completedAt: daysAgo(6),
    lastAccessedAt: daysAgo(6)
  },
  {
    user: userId,
    module: 'Dua',
    levelId: 'dua_1',
    lessonId: 'd1_l2',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(100, variant, 2),
    coinsEarned: isVariantB ? 18 : 15,
    timeSpent: isVariantB ? 160 : 180,
    attempts: 1,
    startedAt: daysAgo(4),
    completedAt: daysAgo(4),
    lastAccessedAt: daysAgo(4)
  },
  {
    user: userId,
    module: 'Dua',
    levelId: 'dua_2',
    lessonId: 'd2_l1',
    status: 'completed',
    completionPercentage: 100,
    accuracy: vary(90, variant),
    coinsEarned: isVariantB ? 15 : 12,
    timeSpent: isVariantB ? 190 : 220,
    attempts: 1,
    startedAt: daysAgo(2),
    completedAt: daysAgo(1),
    lastAccessedAt: daysAgo(1)
  },
  // Fatima has more Dua lessons
  ...(isVariantB ? [{
    user: userId,
    module: 'Dua',
    levelId: 'dua_2',
    lessonId: 'd2_l2',
    status: 'completed',
    completionPercentage: 100,
    accuracy: 98,
    coinsEarned: 16,
    timeSpent: 170,
    attempts: 1,
    startedAt: daysAgo(1),
    completedAt: hoursAgo(10),
    lastAccessedAt: hoursAgo(10)
  }] : [])
];
};

// Sample mistakes data - different mistakes for each child
const createMistakesData = (userId, variant = 'A') => {
  const isVariantB = variant === 'B';
  
  if (isVariantB) {
    // Fatima's mistakes - fewer and different types
    return [
      {
        user: userId,
        module: 'Quran',
        levelId: 'quran_2',
        lessonId: 'qr2_l1',
        mistakeType: 'tajweed',
        title: 'Madd Length Error',
        description: 'Extended madd beyond the required count',
        severity: 'minor',
        isResolved: true,
        resolvedAt: hoursAgo(8),
        timestamp: daysAgo(1)
      },
      {
        user: userId,
        module: 'Qaida',
        levelId: 'qaida_4',
        lessonId: 'q4_l2',
        mistakeType: 'pronunciation',
        title: 'Sukoon Clarity',
        description: 'Slight vocalization on letter with sukoon',
        severity: 'minor',
        isResolved: false,
        timestamp: daysAgo(2)
      },
      {
        user: userId,
        module: 'Quran',
        levelId: 'quran_1',
        lessonId: 'qr1_l3',
        mistakeType: 'tajweed',
        title: 'Izhar Issue',
        description: 'Slight hiding instead of clear pronunciation',
        severity: 'moderate',
        isResolved: true,
        resolvedAt: daysAgo(1),
        timestamp: daysAgo(3)
      }
    ];
  }
  
  // Ahmed's mistakes - more mistakes, different types
  return [
  {
    user: userId,
    module: 'Qaida',
    levelId: 'qaida_2',
    lessonId: 'q2_l1',
    mistakeType: 'tajweed',
    title: 'Qalqalah Error',
    description: 'Missed the bouncing sound on ق in Qaida lesson',
    severity: 'major',
    isResolved: false,
    timestamp: daysAgo(1)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: 'qaida_3',
    lessonId: 'q3_l1',
    mistakeType: 'pronunciation',
    title: 'Ikhfa Mistake',
    description: 'Incomplete hiding of noon sakinah before ت',
    severity: 'major',
    isResolved: false,
    timestamp: daysAgo(2)
  },
  {
    user: userId,
    module: 'Quran',
    levelId: 'quran_1',
    lessonId: 'qr1_l1',
    mistakeType: 'tajweed',
    title: 'Idgham Error',
    description: 'Incomplete merging of noon with و',
    severity: 'moderate',
    isResolved: true,
    resolvedAt: daysAgo(1),
    timestamp: daysAgo(3)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: 'qaida_4',
    lessonId: 'q4_l1',
    mistakeType: 'pronunciation',
    title: 'Madd Duration',
    description: 'Short elongation on madd letters',
    severity: 'major',
    isResolved: false,
    timestamp: hoursAgo(5)
  },
  {
    user: userId,
    module: 'Quran',
    levelId: 'quran_1',
    lessonId: 'qr1_l2',
    mistakeType: 'tajweed',
    title: 'Ghunna Missing',
    description: 'Missed nasalization on noon mushaddad',
    severity: 'minor',
    isResolved: true,
    resolvedAt: daysAgo(2),
    timestamp: daysAgo(4)
  },
  {
    user: userId,
    module: 'Qaida',
    levelId: 'qaida_3',
    lessonId: 'q3_l2',
    mistakeType: 'pronunciation',
    title: 'Tafkheem Error',
    description: 'Light pronunciation of heavy letter ص',
    severity: 'moderate',
    isResolved: false,
    timestamp: daysAgo(2)
  }
];
};

// Sample quiz results - different quiz scores for each child
const createQuizData = (userId, variant = 'A') => {
  const isVariantB = variant === 'B';
  
  if (isVariantB) {
    // Fatima's quizzes - higher scores, more quizzes
    return [
      {
        user: userId,
        quizId: 'qaida_2_quiz',
        module: 'Qaida',
        levelId: 'qaida_2',
        questions: [
          { questionId: 'q1', question: 'Apply Fatha to Ba', selectedAnswer: 'بَ', correctAnswer: 'بَ', isCorrect: true, timeSpent: 18 },
          { questionId: 'q2', question: 'Apply Kasra to Ba', selectedAnswer: 'بِ', correctAnswer: 'بِ', isCorrect: true, timeSpent: 20 },
          { questionId: 'q3', question: 'Apply Damma to Ba', selectedAnswer: 'بُ', correctAnswer: 'بُ', isCorrect: true, timeSpent: 15 }
        ],
        score: 3,
        totalQuestions: 3,
        percentage: 100,
        passed: true,
        timeSpent: 53,
        attempts: 1,
        coinsEarned: 120,
        completedAt: daysAgo(6)
      },
      {
        user: userId,
        quizId: 'tajweed_rules_quiz',
        module: 'Qaida',
        levelId: 'qaida_3',
        questions: [
          { questionId: 'q1', question: 'What is Qalqalah?', selectedAnswer: 'Bouncing sound', correctAnswer: 'Bouncing sound', isCorrect: true, timeSpent: 25 },
          { questionId: 'q2', question: 'When does Ikhfa occur?', selectedAnswer: 'Before specific letters', correctAnswer: 'Before specific letters', isCorrect: true, timeSpent: 22 },
          { questionId: 'q3', question: 'What is Ghunna?', selectedAnswer: 'Nasalization', correctAnswer: 'Nasalization', isCorrect: true, timeSpent: 18 },
          { questionId: 'q4', question: 'Duration of Madd Asli?', selectedAnswer: '2 counts', correctAnswer: '2 counts', isCorrect: true, timeSpent: 12 }
        ],
        score: 4,
        totalQuestions: 4,
        percentage: 100,
        passed: true,
        timeSpent: 77,
        attempts: 1,
        coinsEarned: 180,
        completedAt: daysAgo(4)
      },
      {
        user: userId,
        quizId: 'quran_1_quiz',
        module: 'Quran',
        levelId: 'quran_1',
        questions: [
          { questionId: 'q1', question: 'First verse of Al-Fatiha', selectedAnswer: 'بسم الله', correctAnswer: 'بسم الله', isCorrect: true, timeSpent: 30 },
          { questionId: 'q2', question: 'Meaning of Rahman', selectedAnswer: 'Most Merciful', correctAnswer: 'Most Merciful', isCorrect: true, timeSpent: 25 },
          { questionId: 'q3', question: 'Number of verses in Al-Fatiha', selectedAnswer: '7', correctAnswer: '7', isCorrect: true, timeSpent: 15 }
        ],
        score: 3,
        totalQuestions: 3,
        percentage: 100,
        passed: true,
        timeSpent: 70,
        attempts: 1,
        coinsEarned: 150,
        completedAt: daysAgo(2)
      },
      {
        user: userId,
        quizId: 'quran_2_quiz',
        module: 'Quran',
        levelId: 'quran_2',
        questions: [
          { questionId: 'q1', question: 'First word of Surah Ikhlas', selectedAnswer: 'قل', correctAnswer: 'قل', isCorrect: true, timeSpent: 20 },
          { questionId: 'q2', question: 'Meaning of Ahad', selectedAnswer: 'The One', correctAnswer: 'The One', isCorrect: true, timeSpent: 18 },
          { questionId: 'q3', question: 'Last word of Surah Ikhlas', selectedAnswer: 'احد', correctAnswer: 'احد', isCorrect: true, timeSpent: 22 }
        ],
        score: 3,
        totalQuestions: 3,
        percentage: 100,
        passed: true,
        timeSpent: 60,
        attempts: 1,
        coinsEarned: 160,
        completedAt: hoursAgo(6)
      }
    ];
  }
  
  // Ahmed's quizzes - original data
  return [
  {
    user: userId,
    quizId: 'qaida_1_quiz',
    module: 'Qaida',
    levelId: 'qaida_1',
    questions: [
      { questionId: 'q1', question: 'Identify the letter Alif', selectedAnswer: 'ا', correctAnswer: 'ا', isCorrect: true, timeSpent: 15 },
      { questionId: 'q2', question: 'Identify the letter Ba', selectedAnswer: 'ب', correctAnswer: 'ب', isCorrect: true, timeSpent: 12 },
      { questionId: 'q3', question: 'Identify the letter Ta', selectedAnswer: 'ت', correctAnswer: 'ت', isCorrect: true, timeSpent: 10 }
    ],
    score: 3,
    totalQuestions: 3,
    percentage: 100,
    passed: true,
    timeSpent: 37,
    attempts: 1,
    coinsEarned: 120,
    completedAt: daysAgo(5)
  },
  {
    user: userId,
    quizId: 'qaida_2_quiz',
    module: 'Qaida',
    levelId: 'qaida_2',
    questions: [
      { questionId: 'q1', question: 'Apply Fatha to Ba', selectedAnswer: 'بَ', correctAnswer: 'بَ', isCorrect: true, timeSpent: 20 },
      { questionId: 'q2', question: 'Apply Kasra to Ba', selectedAnswer: 'بُ', correctAnswer: 'بِ', isCorrect: false, timeSpent: 25 },
      { questionId: 'q3', question: 'Apply Damma to Ba', selectedAnswer: 'بُ', correctAnswer: 'بُ', isCorrect: true, timeSpent: 18 }
    ],
    score: 2,
    totalQuestions: 3,
    percentage: 67,
    passed: true,
    timeSpent: 63,
    attempts: 2,
    coinsEarned: 50,
    completedAt: daysAgo(3)
  },
  {
    user: userId,
    quizId: 'tajweed_rules_quiz',
    module: 'Qaida',
    levelId: 'qaida_3',
    questions: [
      { questionId: 'q1', question: 'What is Qalqalah?', selectedAnswer: 'Bouncing sound', correctAnswer: 'Bouncing sound', isCorrect: true, timeSpent: 30 },
      { questionId: 'q2', question: 'When does Ikhfa occur?', selectedAnswer: 'Before specific letters', correctAnswer: 'Before specific letters', isCorrect: true, timeSpent: 25 },
      { questionId: 'q3', question: 'What is Ghunna?', selectedAnswer: 'Nasalization', correctAnswer: 'Nasalization', isCorrect: true, timeSpent: 20 },
      { questionId: 'q4', question: 'Duration of Madd Asli?', selectedAnswer: '2 counts', correctAnswer: '2 counts', isCorrect: true, timeSpent: 15 }
    ],
    score: 4,
    totalQuestions: 4,
    percentage: 100,
    passed: true,
    timeSpent: 90,
    attempts: 1,
    coinsEarned: 120,
    completedAt: daysAgo(2)
  },
  {
    user: userId,
    quizId: 'quran_surah_quiz',
    module: 'Quran',
    levelId: 'quran_1',
    questions: [
      { questionId: 'q1', question: 'Complete: Bismillah ir-Rahman...', selectedAnswer: 'ir-Raheem', correctAnswer: 'ir-Raheem', isCorrect: true, timeSpent: 10 },
      { questionId: 'q2', question: 'How many verses in Al-Fatihah?', selectedAnswer: '7', correctAnswer: '7', isCorrect: true, timeSpent: 8 },
      { questionId: 'q3', question: 'Surah Al-Ikhlas is about?', selectedAnswer: 'Tawheed', correctAnswer: 'Tawheed', isCorrect: true, timeSpent: 12 },
      { questionId: 'q4', question: 'Al-Falaq means?', selectedAnswer: 'The Dawn', correctAnswer: 'The Dawn', isCorrect: true, timeSpent: 15 },
      { questionId: 'q5', question: 'An-Nas means?', selectedAnswer: 'The Mankind', correctAnswer: 'The Mankind', isCorrect: true, timeSpent: 10 }
    ],
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    passed: true,
    timeSpent: 55,
    attempts: 1,
    coinsEarned: 120,
    completedAt: daysAgo(1)
  },
  {
    user: userId,
    quizId: 'madd_rules_practice',
    module: 'Qaida',
    levelId: 'qaida_4',
    questions: [
      { questionId: 'q1', question: 'Madd Asli duration?', selectedAnswer: '2 counts', correctAnswer: '2 counts', isCorrect: true, timeSpent: 20 },
      { questionId: 'q2', question: 'When does Madd Munfasil occur?', selectedAnswer: 'Before hamza', correctAnswer: 'Same word hamza', isCorrect: false, timeSpent: 30 },
      { questionId: 'q3', question: 'Duration of Madd Lazim?', selectedAnswer: '6 counts', correctAnswer: '6 counts', isCorrect: true, timeSpent: 25 }
    ],
    score: 2,
    totalQuestions: 3,
    percentage: 67,
    passed: true,
    timeSpent: 75,
    attempts: 1,
    coinsEarned: 50,
    completedAt: hoursAgo(8)
  }
];
};

// Sample achievements - different achievements for each child
const createAchievementsData = (userId, variant = 'A') => {
  const isVariantB = variant === 'B';
  
  if (isVariantB) {
    // Fatima's achievements - more achievements, higher levels
    return [
      {
        user: userId,
        badgeType: 'first_lesson',
        title: 'First Steps',
        description: 'Completed your first lesson!',
        icon: '🎯',
        color: '#0A7D4F',
        coinsRewarded: 50,
        earnedAt: daysAgo(14)
      },
      {
        user: userId,
        badgeType: 'week_streak',
        title: 'Daily Practice Streak',
        description: '12 days consecutive practice!',
        icon: '🔥',
        color: '#E53935',
        coinsRewarded: 150,
        metadata: { streakDays: 12 },
        earnedAt: hoursAgo(5)
      },
      {
        user: userId,
        badgeType: 'perfect_score',
        title: 'Perfect Recitation Master',
        description: 'Achieved 100% accuracy in 5 lessons!',
        icon: '🏆',
        color: '#FFD700',
        coinsRewarded: 100,
        earnedAt: daysAgo(2)
      },
      {
        user: userId,
        badgeType: 'level_5_badge',
        title: 'Tajweed Master Level 2',
        description: 'Mastered advanced Tajweed rules!',
        icon: '⭐',
        color: '#1976D2',
        coinsRewarded: 150,
        levelCompleted: 'qaida_4',
        earnedAt: daysAgo(3)
      },
      {
        user: userId,
        badgeType: 'quiz_master',
        title: 'Quiz Champion',
        description: 'Scored 100% in 4 consecutive quizzes!',
        icon: '🎯',
        color: '#F57C00',
        coinsRewarded: 120,
        earnedAt: daysAgo(1)
      },
      {
        user: userId,
        badgeType: 'quran_complete',
        title: 'Quran Explorer',
        description: 'Started learning Quran recitation!',
        icon: '📖',
        color: '#7B1FA2',
        coinsRewarded: 80,
        earnedAt: daysAgo(5)
      },
      {
        user: userId,
        badgeType: '100_lessons',
        title: 'Dua Memorizer',
        description: 'Memorized 4 duas perfectly!',
        icon: '🤲',
        color: '#0A7D4F',
        coinsRewarded: 100,
        earnedAt: hoursAgo(10)
      }
    ];
  }
  
  // Ahmed's achievements - original data
  return [
  {
    user: userId,
    badgeType: 'first_lesson',
    title: 'First Steps',
    description: 'Completed your first lesson!',
    icon: '🎯',
    color: '#0A7D4F',
    coinsRewarded: 50,
    earnedAt: daysAgo(7)
  },
  {
    user: userId,
    badgeType: 'week_streak',
    title: 'Daily Practice Streak',
    description: '7 days consecutive practice!',
    icon: '🔥',
    color: '#E53935',
    coinsRewarded: 100,
    metadata: { streakDays: 7 },
    earnedAt: hoursAgo(8)
  },
  {
    user: userId,
    badgeType: 'perfect_score',
    title: 'Perfect Recitation',
    description: 'Achieved 100% accuracy in a lesson!',
    icon: '🏆',
    color: '#FFD700',
    coinsRewarded: 75,
    earnedAt: daysAgo(3)
  },
  {
    user: userId,
    badgeType: 'level_2_badge',
    title: 'Tajweed Master Level 1',
    description: 'Mastered basic Tajweed rules!',
    icon: '⭐',
    color: '#1976D2',
    coinsRewarded: 100,
    levelCompleted: 'qaida_2',
    earnedAt: daysAgo(4)
  },
  {
    user: userId,
    badgeType: 'quiz_master',
    title: 'Quiz Champion',
    description: 'Scored 90%+ in 3 consecutive quizzes!',
    icon: '🎯',
    color: '#F57C00',
    coinsRewarded: 80,
    earnedAt: daysAgo(2)
  },
  {
    user: userId,
    badgeType: 'qaida_complete',
    title: 'Qaida Basic Certified',
    description: 'Completed Qaida basics successfully!',
    icon: '✅',
    color: '#0A7D4F',
    coinsRewarded: 150,
    levelCompleted: 'qaida_3',
    earnedAt: daysAgo(1)
  }
];
};

// Sample coin transactions - different transactions for each child
const createCoinTransactions = (userId, currentBalance, variant = 'A') => {
  let balance = 0;
  const isVariantB = variant === 'B';
  
  if (isVariantB) {
    // Fatima's transactions - more coins, different activities
    const transactions = [
      {
        user: userId,
        type: 'lesson_complete',
        amount: 20,
        description: 'Completed Qaida Lesson 1',
        timestamp: daysAgo(12)
      },
      {
        user: userId,
        type: 'achievement',
        amount: 50,
        description: 'Earned "First Steps" badge',
        timestamp: daysAgo(12)
      },
      {
        user: userId,
        type: 'lesson_complete',
        amount: 18,
        description: 'Completed Dua - Morning Prayer',
        timestamp: daysAgo(10)
      },
      {
        user: userId,
        type: 'quiz_perfect',
        amount: 150,
        description: 'Perfect score on Dua Quiz 1',
        timestamp: daysAgo(9)
      },
      {
        user: userId,
        type: 'streak_bonus',
        amount: 30,
        description: '7-day streak bonus',
        timestamp: daysAgo(8)
      },
      {
        user: userId,
        type: 'lesson_complete',
        amount: 25,
        description: 'Completed Quran Lesson - Al-Fatiha',
        timestamp: daysAgo(7)
      },
      {
        user: userId,
        type: 'achievement',
        amount: 80,
        description: 'Earned "Quran Explorer" badge',
        timestamp: daysAgo(5)
      },
      {
        user: userId,
        type: 'quiz_perfect',
        amount: 150,
        description: 'Perfect score on Tajweed Advanced Quiz',
        timestamp: daysAgo(4)
      },
      {
        user: userId,
        type: 'achievement',
        amount: 150,
        description: 'Earned "Tajweed Master Level 2" badge',
        timestamp: daysAgo(3)
      },
      {
        user: userId,
        type: 'lesson_complete',
        amount: 22,
        description: 'Completed Dua - Before Sleep',
        timestamp: daysAgo(2)
      },
      {
        user: userId,
        type: 'achievement',
        amount: 100,
        description: 'Earned "Dua Memorizer" badge',
        timestamp: hoursAgo(10)
      },
      {
        user: userId,
        type: 'streak_bonus',
        amount: 50,
        description: '12-day streak bonus',
        timestamp: hoursAgo(5)
      },
      {
        user: userId,
        type: 'achievement',
        amount: 120,
        description: 'Earned "Quiz Champion" badge',
        timestamp: daysAgo(1)
      },
      {
        user: userId,
        type: 'daily_bonus',
        amount: 15,
        description: 'Daily login bonus',
        timestamp: hoursAgo(2)
      }
    ];
    
    return transactions.map(t => {
      balance += t.amount;
      return { ...t, balance };
    });
  }
  
  // Ahmed's transactions - original
  const transactions = [
    {
      user: userId,
      type: 'lesson_complete',
      amount: 15,
      description: 'Completed Qaida Lesson 1',
      timestamp: daysAgo(6)
    },
    {
      user: userId,
      type: 'achievement',
      amount: 50,
      description: 'Earned "First Steps" badge',
      timestamp: daysAgo(6)
    },
    {
      user: userId,
      type: 'lesson_complete',
      amount: 12,
      description: 'Completed Qaida Lesson 2',
      timestamp: daysAgo(5)
    },
    {
      user: userId,
      type: 'quiz_perfect',
      amount: 120,
      description: 'Perfect score on Qaida Quiz 1',
      timestamp: daysAgo(5)
    },
    {
      user: userId,
      type: 'lesson_complete',
      amount: 15,
      description: 'Completed Qaida Lesson 3',
      timestamp: daysAgo(4)
    },
    {
      user: userId,
      type: 'achievement',
      amount: 100,
      description: 'Earned "Tajweed Master Level 1" badge',
      timestamp: daysAgo(4)
    },
    {
      user: userId,
      type: 'daily_bonus',
      amount: 10,
      description: 'Daily login bonus',
      timestamp: daysAgo(3)
    },
    {
      user: userId,
      type: 'quiz_pass',
      amount: 50,
      description: 'Passed Qaida Quiz 2',
      timestamp: daysAgo(3)
    },
    {
      user: userId,
      type: 'achievement',
      amount: 75,
      description: 'Earned "Perfect Recitation" badge',
      timestamp: daysAgo(3)
    },
    {
      user: userId,
      type: 'streak_bonus',
      amount: 25,
      description: '5-day streak bonus',
      timestamp: daysAgo(2)
    },
    {
      user: userId,
      type: 'quiz_perfect',
      amount: 120,
      description: 'Perfect score on Tajweed Rules Quiz',
      timestamp: daysAgo(2)
    },
    {
      user: userId,
      type: 'lesson_complete',
      amount: 22,
      description: 'Completed Quran Lesson - Al-Ikhlas',
      timestamp: daysAgo(2)
    },
    {
      user: userId,
      type: 'quiz_perfect',
      amount: 120,
      description: 'Perfect score on Quran Surah Quiz',
      timestamp: daysAgo(1)
    },
    {
      user: userId,
      type: 'achievement',
      amount: 150,
      description: 'Earned "Qaida Basic Certified" badge',
      timestamp: daysAgo(1)
    },
    {
      user: userId,
      type: 'achievement',
      amount: 100,
      description: 'Earned "Daily Practice Streak" badge (7 days)',
      timestamp: hoursAgo(8)
    }
  ];
  
  // Calculate running balance for each transaction
  return transactions.map(t => {
    balance += t.amount;
    return { ...t, balance };
  });
};

// Initialize database function
async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...\n');

    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data (optional - comment out if you want to preserve data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Content.deleteMany({});
    await Progress.deleteMany({});
    await Notification.deleteMany({});
    await Achievement.deleteMany({});
    await Mistake.deleteMany({});
    await QuizResult.deleteMany({});
    await CoinTransaction.deleteMany({});
    await ParentChild.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Insert users
    console.log('👥 Creating sample users...');
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users:`);
    createdUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    console.log();

    // Get specific users
    const parent = createdUsers.find(u => u.email === 'parent@test.com');
    const ahmed = createdUsers.find(u => u.email === 'ahmed@test.com');
    const fatima = createdUsers.find(u => u.email === 'fatima@test.com');
    const testLearner = createdUsers.find(u => u.email === 'learner@test.com');

    // Create Parent-Child relationships
    console.log('👨‍👧‍👦 Creating parent-child relationships...');
    const parentChildLinks = [
      {
        parent: parent._id,
        child: ahmed._id,
        relationshipType: 'parent',
        status: 'active',
        linkedAt: daysAgo(30)
      },
      {
        parent: parent._id,
        child: fatima._id,
        relationshipType: 'parent',
        status: 'active',
        linkedAt: daysAgo(25)
      }
    ];
    const createdLinks = await ParentChild.create(parentChildLinks);
    console.log(`✅ Created ${createdLinks.length} parent-child relationships\n`);

    // Insert Qaida content
    console.log('📚 Creating Qaida content...');
    const createdQaida = await Content.create(qaidaContent);
    console.log(`✅ Created ${createdQaida.length} Qaida lessons\n`);

    // Insert Quran content
    console.log('📖 Creating Quran content...');
    const createdQuran = await Content.create(quranContent);
    console.log(`✅ Created ${createdQuran.length} Quran surahs\n`);

    // Insert Dua content
    console.log('🤲 Creating Dua content...');
    const createdDuas = await Content.create(duaContent);
    console.log(`✅ Created ${createdDuas.length} Duas\n`);

    // Create progress for Ahmed
    console.log('📊 Creating progress records for Ahmed...');
    const ahmedProgress = createProgressData(ahmed._id, 'A');
    await Progress.create(ahmedProgress);
    console.log(`✅ Created ${ahmedProgress.length} progress records for Ahmed\n`);

    // Create progress for Fatima (more advanced)
    console.log('📊 Creating progress records for Fatima...');
    const fatimaProgress = createProgressData(fatima._id, 'B');
    await Progress.create(fatimaProgress);
    console.log(`✅ Created ${fatimaProgress.length} progress records for Fatima\n`);

    // Create mistakes for Ahmed
    console.log('⚠️ Creating mistakes for Ahmed...');
    const ahmedMistakes = createMistakesData(ahmed._id, 'A');
    await Mistake.create(ahmedMistakes);
    console.log(`✅ Created ${ahmedMistakes.length} mistakes for Ahmed\n`);

    // Create mistakes for Fatima (fewer mistakes, different types)
    console.log('⚠️ Creating mistakes for Fatima...');
    const fatimaMistakes = createMistakesData(fatima._id, 'B');
    await Mistake.create(fatimaMistakes);
    console.log(`✅ Created ${fatimaMistakes.length} mistakes for Fatima\n`);

    // Create quiz results for Ahmed
    console.log('📝 Creating quiz results for Ahmed...');
    const ahmedQuizzes = createQuizData(ahmed._id, 'A');
    await QuizResult.create(ahmedQuizzes);
    console.log(`✅ Created ${ahmedQuizzes.length} quiz results for Ahmed\n`);

    // Create quiz results for Fatima (higher scores)
    console.log('📝 Creating quiz results for Fatima...');
    const fatimaQuizzes = createQuizData(fatima._id, 'B');
    await QuizResult.create(fatimaQuizzes);
    console.log(`✅ Created ${fatimaQuizzes.length} quiz results for Fatima\n`);

    // Create achievements for Ahmed
    console.log('🏆 Creating achievements for Ahmed...');
    const ahmedAchievements = createAchievementsData(ahmed._id, 'A');
    await Achievement.create(ahmedAchievements);
    console.log(`✅ Created ${ahmedAchievements.length} achievements for Ahmed\n`);

    // Create achievements for Fatima (more achievements)
    console.log('🏆 Creating achievements for Fatima...');
    const fatimaAchievements = createAchievementsData(fatima._id, 'B');
    await Achievement.create(fatimaAchievements);
    console.log(`✅ Created ${fatimaAchievements.length} achievements for Fatima\n`);

    // Create coin transactions for Ahmed
    console.log('💰 Creating coin transactions for Ahmed...');
    const ahmedTransactions = createCoinTransactions(ahmed._id, ahmed.coins, 'A');
    await CoinTransaction.create(ahmedTransactions);
    console.log(`✅ Created ${ahmedTransactions.length} coin transactions for Ahmed\n`);

    // Create coin transactions for Fatima (more coins)
    console.log('💰 Creating coin transactions for Fatima...');
    const fatimaTransactions = createCoinTransactions(fatima._id, fatima.coins, 'B');
    await CoinTransaction.create(fatimaTransactions);
    console.log(`✅ Created ${fatimaTransactions.length} coin transactions for Fatima\n`);

    // Insert notifications for all learners
    console.log('🔔 Creating notifications...');
    const learners = createdUsers.filter(u => u.role === 'child');
    const notifications = [];
    for (const learner of learners) {
      notifications.push({
        user: learner._id,
        title: 'Welcome to Quran Companion!',
        message: 'Start your journey of learning Quran and Qaida',
        type: 'general',
        icon: '👋'
      });
      notifications.push({
        user: learner._id,
        title: 'New Achievement Unlocked!',
        message: 'You have earned the "First Steps" badge',
        type: 'achievement',
        icon: '🏆'
      });
      notifications.push({
        user: learner._id,
        title: 'Keep up the streak! 🔥',
        message: 'You are on a 7-day learning streak!',
        type: 'streak_milestone',
        icon: '🔥'
      });
    }
    const createdNotifications = await Notification.create(notifications);
    console.log(`✅ Created ${createdNotifications.length} notifications\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ Database initialization completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${createdUsers.length} (1 parent, 3 children)`);
    console.log(`   Parent-Child Links: ${createdLinks.length}`);
    console.log(`   Qaida Lessons: ${createdQaida.length}`);
    console.log(`   Quran Surahs: ${createdQuran.length}`);
    console.log(`   Duas: ${createdDuas.length}`);
    console.log(`   Progress Records: ${ahmedProgress.length + fatimaProgress.length}`);
    console.log(`   Mistakes: ${ahmedMistakes.length + fatimaMistakes.length}`);
    console.log(`   Quiz Results: ${ahmedQuizzes.length + fatimaQuizzes.length}`);
    console.log(`   Achievements: ${ahmedAchievements.length + fatimaAchievements.length}`);
    console.log(`   Coin Transactions: ${ahmedTransactions.length + fatimaTransactions.length}`);
    console.log(`   Notifications: ${createdNotifications.length}`);
    console.log('\n📝 Test Credentials:');
    console.log('   ┌─────────────────────────────────────────────────────────┐');
    console.log('   │ PARENT ACCOUNT (for testing Parent Dashboard)          │');
    console.log('   │   Email: parent@test.com                               │');
    console.log('   │   Password: password123                                │');
    console.log('   │   Children: Ahmed Khan, Fatima Ali                     │');
    console.log('   ├─────────────────────────────────────────────────────────┤');
    console.log('   │ CHILD ACCOUNTS                                         │');
    console.log('   │   Ahmed: ahmed@test.com / password123                  │');
    console.log('   │   Fatima: fatima@test.com / password123                │');
    console.log('   │   Test Learner: learner@test.com / password123         │');
    console.log('   └─────────────────────────────────────────────────────────┘');
    console.log('\n👪 Parent Dashboard Test Data:');
    console.log('   Ahmed (8 lessons, 6 mistakes, 4 quizzes, 6 achievements)');
    console.log('     - Focus: Qaida lessons, Tajweed practice');
    console.log('     - Quiz avg: ~85%, 7-day streak');
    console.log('   Fatima (9 lessons, 4 mistakes, 4 quizzes, 7 achievements)');
    console.log('     - Focus: Dua memorization, Quran recitation');
    console.log('     - Quiz avg: ~95%, 12-day streak');
    console.log('   Both children have unique progress, mistakes, and achievements');
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
