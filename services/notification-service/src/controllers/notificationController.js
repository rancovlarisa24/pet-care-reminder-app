// notificationController.js - stratul HTTP al Notification Service: primește
// cererile, apelează logica din notificationService și formatează răspunsul.
// Citirea/marcarea/ștergerea folosesc req.userId (din token) pentru izolarea datelor.
const notificationService = require('../services');

const notificationController = {
  // POST /api/notifications - creează o notificare (apel intern din Reminder Service).
  createNotification: (req, res) => {
    try {
      const { reminderId, userId, message, channel, type, dedupe } = req.body;
      const notification = notificationService.createNotification(
        reminderId, userId, message, channel, type, dedupe === true
      );
      // dedupe activ + notificare deja existentă => nu cream duplicat (200, fără date noi).
      if (!notification) {
        return res.status(200).json({ message: 'Notification already exists', data: null });
      }
      res.status(201).json({
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // GET /api/notifications - returnează DOAR notificările utilizatorului logat.
  getAllNotifications: (req, res) => {
    try {
      const notifications = notificationService.getNotificationsByUserId(req.userId);
      res.status(200).json({
        message: 'List of notifications',
        data: notifications,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/notifications/:id/sent - marchează notificarea utilizatorului ca trimisă.
  markNotificationAsSent: (req, res) => {
    try {
      const { id } = req.params;
      const notification = notificationService.markNotificationAsSent(id, req.userId);
      res.status(200).json({
        message: 'Notification marked as sent',
        data: notification,
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // PUT /api/notifications/:id/read - marchează notificarea utilizatorului ca citită.
  markNotificationAsRead: (req, res) => {
    try {
      const { id } = req.params;
      const notification = notificationService.markNotificationAsRead(id, req.userId);
      res.status(200).json({
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // DELETE /api/notifications/:id - șterge o notificare a utilizatorului.
  deleteNotification: (req, res) => {
    try {
      const { id } = req.params;
      notificationService.deleteNotification(id, req.userId);
      res.status(200).json({
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};

module.exports = notificationController;
