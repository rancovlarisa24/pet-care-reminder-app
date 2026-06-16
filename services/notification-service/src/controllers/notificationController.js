// notificationController.js - stratul HTTP al Notification Service: primește
// cererile, apelează logica din notificationService și formatează răspunsul.
const notificationService = require('../services');

const notificationController = {
  // POST /api/notifications - creează o notificare (apelat de Reminder Service).
  createNotification: (req, res) => {
    try {
      const { reminderId, userId, message, channel } = req.body;
      const notification = notificationService.createNotification(reminderId, userId, message, channel);
      res.status(201).json({
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // GET /api/notifications/:id - returnează o notificare după id (404 dacă nu există).
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

  // GET /api/notifications - returnează toate notificările.
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

  // GET /api/notifications/user/:userId - notificările unui utilizator.
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

  // GET /api/notifications/reminder/:reminderId - notificările unui memento.
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

  // PUT /api/notifications/:id/sent - marchează notificarea ca trimisă.
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

  // PUT /api/notifications/:id/read - marchează notificarea ca citită.
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

  // DELETE /api/notifications/:id - șterge o notificare.
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
