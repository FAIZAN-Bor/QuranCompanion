const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'achievement',
      'daily_reminder',
      'quiz_result',
      'parent_report',
      'level_unlock',
      'streak_milestone',
      'mistake_resolved',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'bell'
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
    // Additional data like achievement ID, quiz ID, etc.
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null
    // For scheduled notifications (daily reminders)
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
    // Optional expiration for time-sensitive notifications
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1, sentAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ scheduledFor: 1 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, additionalData = {}) {
  return await this.create({
    user: userId,
    type,
    title,
    message,
    data: additionalData.data || {},
    icon: additionalData.icon || 'bell',
    priority: additionalData.priority || 'medium',
    scheduledFor: additionalData.scheduledFor || null
  });
};

// Auto-delete expired notifications (cleanup job)
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
