const notificationService = require('../services');

const notificationController = {
  createNotification: (req, res) => {
    try {
      const { reminderId, userId, message } = req.body;
      const notification = notificationService.createNotification(reminderId, userId, message);
      res.status(201).json({
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getNotification: (req, res) => {
    try {
      const { id } = req.params;
      const notification = notificationService.getNotification(id);
      res.status(200).json({
        message: 'Notification retrieved successfully',
        data: notification,
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  getAllNotifications: (req, res) => {
    try {
      const notifications = notificationService.getAllNotifications();
      res.status(200).json({
        message: 'List of notifications',
        data: notifications,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getNotificationsByUserId: (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = notificationService.getNotificationsByUserId(userId);
      res.status(200).json({
        message: 'List of notifications for user',
        data: notifications,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getNotificationsByReminderId: (req, res) => {
    try {
      const { reminderId } = req.params;
      const notifications = notificationService.getNotificationsByReminderId(reminderId);
      res.status(200).json({
        message: 'List of notifications for reminder',
        data: notifications,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  markNotificationAsSent: (req, res) => {
    try {
      const { id } = req.params;
      const notification = notificationService.markNotificationAsSent(id);
      res.status(200).json({
        message: 'Notification marked as sent',
        data: notification,
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  markNotificationAsRead: (req, res) => {
    try {
      const { id } = req.params;
      const notification = notificationService.markNotificationAsRead(id);
      res.status(200).json({
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  deleteNotification: (req, res) => {
    try {
      const { id } = req.params;
      notificationService.deleteNotification(id);
      res.status(200).json({
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};

module.exports = notificationController;
