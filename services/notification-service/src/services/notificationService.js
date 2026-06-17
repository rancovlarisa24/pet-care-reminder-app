// notificationService.js - logica de business pentru notificări: validare,
// verificarea proprietății (un utilizator accesează doar notificările lui) și
// delegarea operațiilor către repository (SQLite).
const notificationRepository = require('../repositories');

// Caută o notificare și verifică faptul că aparține utilizatorului dat.
// Aruncă 'Notification not found' și dacă există, dar e a altui utilizator.
const getOwnedNotification = (id, userId) => {
  const notification = notificationRepository.findById(id);
  if (!notification || Number(notification.user_id) !== Number(userId)) {
    throw new Error('Notification not found');
  }
  return notification;
};

const notificationService = {
  // Creează o notificare (apelat intern de Reminder Service).
  // `type` clasifică notificarea (created/upcoming/due/overdue). Când `dedupe`
  // este true, NU creăm un duplicat dacă există deja una de același tip pentru
  // acel memento (folosit de scheduler ca să anunțe fiecare etapă o singură dată).
  createNotification: (reminderId, userId, message, channel, type = 'created', dedupe = false) => {
    if (!reminderId || !userId || !message) {
      throw new Error('reminderId, userId, and message are required');
    }

    if (dedupe && notificationRepository.existsByReminderAndType(reminderId, type)) {
      return null; // există deja o notificare de acest tip pentru memento
    }

    return notificationRepository.create({ userId, reminderId, channel, message, type });
  },

  // Returnează notificările utilizatorului logat.
  getNotificationsByUserId: (userId) => {
    if (!userId) {
      throw new Error('userId is required');
    }
    return notificationRepository.findByUserId(userId);
  },

  // Marchează ca trimisă o notificare a utilizatorului (verifică întâi proprietatea).
  markNotificationAsSent: (id, userId) => {
    getOwnedNotification(id, userId);
    return notificationRepository.markAsSent(id);
  },

  // Marchează ca citită o notificare a utilizatorului.
  markNotificationAsRead: (id, userId) => {
    getOwnedNotification(id, userId);
    return notificationRepository.markAsRead(id);
  },

  // Șterge o notificare a utilizatorului (verifică întâi proprietatea).
  deleteNotification: (id, userId) => {
    getOwnedNotification(id, userId);
    notificationRepository.delete(id);
  },
};

module.exports = notificationService;
