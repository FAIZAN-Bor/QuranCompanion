const Content = require('../models/Content');
const Notification = require('../models/Notification');

/**
 * Schedule Dua reminders for a user for the next 24 hours
 * @param {string} userId - The ID of the user
 */
const scheduleDuaNotifications = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check if we already scheduled Duas for this user today
    const existing = await Notification.findOne({
      user: userId,
      type: 'dua_reminder',
      scheduledFor: { $gte: today }
    });

    if (existing) {
      // Already scheduled for today
      return;
    }

    // 2. Define schedule slots
    const slots = [
      { name: 'Morning', hour: 8, minute: 0, icon: 'wb-sunny' },
      { name: 'Evening', hour: 18, minute: 0, icon: 'brightness-3' },
      { name: 'Sleeping', hour: 22, minute: 0, icon: 'bed' }
    ];

    // 3. Fetch Duas for each category
    const categories = ['Morning', 'Evening', 'Sleeping'];
    const duaMap = {};

    for (const category of categories) {
      const duas = await Content.find({
        type: 'Dua',
        category: category,
        isActive: true
      });

      if (duas.length > 0) {
        // Pick a random one
        duaMap[category] = duas[Math.floor(Math.random() * duas.length)];
      }
    }

    // 4. Create scheduled notifications
    const now = new Date();
    const notificationPromises = slots.map(slot => {
      const dua = duaMap[slot.name];
      if (!dua) return null;

      const scheduleDate = new Date();
      scheduleDate.setHours(slot.hour, slot.minute, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (scheduleDate <= now) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      return Notification.createNotification(
        userId,
        'dua_reminder',
        `${slot.name} Dua Reminder`,
        `Time for your ${slot.name.toLowerCase()} supplication: "${dua.name}". Click to recite!`,
        {
          scheduledFor: scheduleDate,
          icon: slot.icon,
          priority: 'medium',
          data: {
            duaId: dua._id,
            category: slot.name
          }
        }
      );
    }).filter(p => p !== null);

    if (notificationPromises.length > 0) {
      await Promise.all(notificationPromises);
      console.log(`✅ Scheduled ${notificationPromises.length} Dua reminders for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Error scheduling Dua notifications:', error);
  }
};

module.exports = {
  scheduleDuaNotifications
};
