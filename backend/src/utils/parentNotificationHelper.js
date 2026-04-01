const ParentChild = require('../models/ParentChild');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Notify all linked parents about a child's activity
 * @param {string} childId - The ID of the child
 * @param {string} type - Notification type ('achievement', 'quiz_result', 'level_unlock', etc.)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data for the notification
 */
const notifyParents = async (childId, type, title, message, data = {}) => {
  try {
    // 1. Find all active parent links for this child
    const parentLinks = await ParentChild.find({
      child: childId,
      status: 'active'
    });

    if (!parentLinks || parentLinks.length === 0) {
      return;
    }

    // 2. Get child's name for the notification message if not provided
    const child = await User.findById(childId).select('name');
    const childName = child ? child.name : 'Your child';
    
    // Customize message if it doesn't already contain child's name
    const finalMessage = message.includes(childName) ? message : `${childName} ${message}`;

    // 3. Create notifications for each parent
    const notificationPromises = parentLinks.map(link => {
      return Notification.createNotification(
        link.parent,
        'parent_report', // Use parent_report type for all parent notifications
        title,
        finalMessage,
        {
          ...data,
          childId: childId,
          originalType: type
        }
      );
    });

    await Promise.all(notificationPromises);
    console.log(`✅ Sent parental notifications to ${parentLinks.length} parents for child ${childName}`);
  } catch (error) {
    console.error('❌ Error sending parental notifications:', error);
    // Don't throw error to avoid breaking the main request flow
  }
};

module.exports = {
  notifyParents
};
