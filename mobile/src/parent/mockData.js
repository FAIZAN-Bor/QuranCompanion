// Mock data for parent dashboard
export const mockChildren = [
  {
    id: 1,
    name: 'Ahmed',
    photo: require('../assests/mic.png'), // Placeholder
    progress: 75,
    level: 'Qaida Level 4',
    currentActivity: 'Learning Madd Rules',
  },
  {
    id: 2,
    name: 'Fatima',
    photo: require('../assests/mic.png'), // Placeholder
    progress: 92,
    level: 'Quran Juz 2',
    currentActivity: 'Surah Al-Baqarah',
  },
];

export const mockDashboardStats = {
  todayActivity: 45, // minutes
  weekPerformance: 87, // percentage
  totalMistakes: 12,
  latestAchievement: 'Perfect Recitation Badge',
  lastActive: '2 hours ago',
};

export const mockQuickAccess = [
  {
    id: 1,
    title: 'Progress Overview',
    icon: '📊',
    screen: 'Progress',
    isTab: true,
    color: '#42A5F5',
  },
  {
    id: 2,
    title: 'Lesson Details',
    icon: '📚',
    screen: 'LessonActivityDetails',
    isTab: false,
    color: '#7B1FA2',
  },
  {
    id: 3,
    title: 'Mistake Log',
    icon: '⚠️',
    screen: 'MistakeLog',
    isTab: false,
    color: '#EF5350',
  },
  {
    id: 4,
    title: 'Quiz Results',
    icon: '✍️',
    screen: 'QuizResults',
    isTab: false,
    color: '#FFA726',
  },
  {
    id: 5,
    title: 'Achievements',
    icon: '🏆',
    screen: 'AchievementsRewards',
    isTab: false,
    color: '#FFD700',
  },
  {
    id: 6,
    title: 'Activity Timeline',
    icon: '⏱️',
    screen: 'Activity',
    isTab: true,
    color: '#26C6DA',
  },
];
