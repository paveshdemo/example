const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'general', relatedId = null) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = { createNotification };
