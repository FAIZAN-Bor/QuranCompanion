const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { awardCoins } = require('./coinHelper');

// Check and award achievements based on user activity
const checkAchievements = async (userId, context) => {
  const { type, data } = context;
  const achievements = [];

  try {
    const user = await User.findById(userId);
    if (!user) return achievements;

    switch (type) {
      case 'lesson_complete':
        // First lesson achievement
        if (user.totalLessonsCompleted === 1) {
          const badge = await Achievement.awardBadge(userId, 'first_lesson');
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, 'First lesson achievement');
            achievements.push(badge);
          }
        }

        // 100 lessons milestone
        if (user.totalLessonsCompleted === 100) {
          const badge = await Achievement.awardBadge(userId, '100_lessons');
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, '100 lessons achievement');
            achievements.push(badge);
          }
        }

        // 500 lessons milestone
        if (user.totalLessonsCompleted === 500) {
          const badge = await Achievement.awardBadge(userId, '500_lessons');
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, '500 lessons achievement');
            achievements.push(badge);
          }
        }
        break;

      case 'quiz_complete':
        // Perfect score achievement
        if (data.percentage === 100) {
          const badge = await Achievement.awardBadge(userId, 'perfect_score', {
            quizId: data.quizId,
            score: data.score
          });
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, 'Perfect quiz score achievement');
            achievements.push(badge);
          }
        }
        break;

      case 'level_complete':
        // Level-specific badges
        if (data.levelId === 'qaida_2' || data.levelId === 'quran_2') {
          const badge = await Achievement.awardBadge(userId, 'level_2_badge', {
            levelId: data.levelId
          });
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, 'Level 2 completion achievement');
            achievements.push(badge);
          }
        }

        if (data.levelId === 'qaida_5' || data.levelId === 'quran_5') {
          const badge = await Achievement.awardBadge(userId, 'level_5_badge', {
            levelId: data.levelId
          });
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, 'Level 5 completion achievement');
            achievements.push(badge);
          }
        }
        break;

      case 'module_complete':
        // Module completion badges
        if (data.module === 'Qaida') {
          const badge = await Achievement.awardBadge(userId, 'qaida_complete');
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, 'Qaida completion achievement');
            achievements.push(badge);
          }
        }

        if (data.module === 'Quran') {
          const badge = await Achievement.awardBadge(userId, 'quran_complete');
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, 'Quran completion achievement');
            achievements.push(badge);
          }
        }
        break;

      case 'streak':
        // Streak achievements
        if (data.streakDays === 7) {
          const badge = await Achievement.awardBadge(userId, 'week_streak', {
            streakDays: 7
          });
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, '7-day streak achievement');
            achievements.push(badge);
          }
        }

        if (data.streakDays === 30) {
          const badge = await Achievement.awardBadge(userId, 'month_streak', {
            streakDays: 30
          });
          if (badge) {
            await awardCoins(userId, 'achievement', badge.coinsRewarded, '30-day streak achievement');
            achievements.push(badge);
          }
        }
        break;

      case 'coins':
        // Coin collector achievement
        if (user.coins >= 1000) {
          const badge = await Achievement.awardBadge(userId, 'coin_collector', {
            totalCoins: user.coins
          });
          if (badge) achievements.push(badge);
        }
        break;
    }

    return achievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return achievements;
  }
};

module.exports = { checkAchievements };
