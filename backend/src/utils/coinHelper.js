const CoinTransaction = require('../models/CoinTransaction');
const User = require('../models/User');

// Award coins for different actions
const awardCoins = async (userId, type, amount, description, reference = null) => {
  try {
    const result = await CoinTransaction.addCoins(userId, type, amount, description, reference);
    return result;
  } catch (error) {
    console.error('Error awarding coins:', error);
    throw error;
  }
};

// Coin amounts for different actions
const COIN_REWARDS = {
  LESSON_COMPLETE: 20,
  QUIZ_PASS: 50,
  QUIZ_PERFECT: 100,
  FIRST_LESSON: 50,
  DAILY_BONUS: 10,
  STREAK_7_DAYS: 100,
  STREAK_30_DAYS: 500,
  MISTAKE_RESOLVED: 15,
  QAIDA_COMPLETE: 500,
  QURAN_COMPLETE: 1000
};

// Calculate coins based on quiz performance
const calculateQuizCoins = (percentage, attempts) => {
  if (percentage < 60) return 10; // Consolation
  
  let coins = 50; // Base for passing
  
  if (percentage === 100) coins += 50;
  else if (percentage >= 90) coins += 30;
  else if (percentage >= 80) coins += 10;
  
  if (attempts === 1) coins += 20; // First attempt bonus
  
  return coins;
};

// Calculate coins for lesson completion
const calculateLessonCoins = (accuracy, timeSpent, isFirstLesson = false) => {
  let coins = COIN_REWARDS.LESSON_COMPLETE;
  
  if (isFirstLesson) {
    coins += COIN_REWARDS.FIRST_LESSON;
  }
  
  // Bonus for high accuracy
  if (accuracy >= 95) coins += 10;
  else if (accuracy >= 85) coins += 5;
  
  return coins;
};

module.exports = {
  awardCoins,
  COIN_REWARDS,
  calculateQuizCoins,
  calculateLessonCoins
};
