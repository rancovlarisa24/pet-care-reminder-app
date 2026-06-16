const notificationRepository = require('../repositories');

const notificationService = {
  createNotification: (reminderId, userId, message) => {
    if (!reminderId || !userId || !message) {
      throw new Error('reminderId, userId, and message are required');
    }

    return notificationRepository.create(reminderId, userId, message);
  },

  getNotification: (id) => {
    const notification = notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  },

  getAllNotifications: () => {
    return notificationRepository.findAll();
  },

  getNotificationsByUserId: (userId) => {
    if (!userId) {
      throw new Error('userId is required');
    }
    return notificationRepository.findByUserId(userId);
  },

  getNotificationsByReminderId: (reminderId) => {
    if (!reminderId) {
      throw new Error('reminderId is required');
    }
    return notificationRepository.findByReminderId(reminderId);
  },

  markNotificationAsSent: (id) => {
    const notification = notificationService.getNotification(id);
    return notificationRepository.markAsSent(id);
  },

  markNotificationAsRead: (id) => {
    const notification = notificationService.getNotification(id);
    return notificationRepository.markAsRead(id);
  },

  deleteNotification: (id) => {
    notificationService.getNotification(id);
    notificationRepository.delete(id);
  },
};

module.exports = notificationService;
