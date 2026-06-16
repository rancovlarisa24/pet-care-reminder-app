// notificationService.js - logica de business pentru notificări: validare și
// delegarea operațiilor către repository (SQLite).
const notificationRepository = require('../repositories');

const notificationService = {
  // Creează o notificare după ce verifică că toate câmpurile sunt prezente.
  createNotification: (reminderId, userId, message, channel) => {
    if (!reminderId || !userId || !message) {
      throw new Error('reminderId, userId, and message are required');
    }

    return notificationRepository.create({ userId, reminderId, channel, message });
  },

  // Returnează o notificare după id; aruncă eroare dacă nu există.
  getNotification: (id) => {
    const notification = notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  },

  // Returnează toate notificările.
  getAllNotifications: () => {
    return notificationRepository.findAll();
  },

  // Returnează notificările unui utilizator.
  getNotificationsByUserId: (userId) => {
    if (!userId) {
      throw new Error('userId is required');
    }
    return notificationRepository.findByUserId(userId);
  },

  // Returnează notificările generate de un memento.
  getNotificationsByReminderId: (reminderId) => {
    if (!reminderId) {
      throw new Error('reminderId is required');
    }
    return notificationRepository.findByReminderId(reminderId);
  },

  // Marchează notificarea ca trimisă (simulează trimiterea, pentru demo).
  markNotificationAsSent: (id) => {
    const notification = notificationService.getNotification(id);
    return notificationRepository.markAsSent(id);
  },

  // Marchează notificarea ca citită.
  markNotificationAsRead: (id) => {
    const notification = notificationService.getNotification(id);
    return notificationRepository.markAsRead(id);
  },

  // Șterge o notificare (verifică întâi că există).
  deleteNotification: (id) => {
    notificationService.getNotification(id);
    notificationRepository.delete(id);
  },
};

module.exports = notificationService;
