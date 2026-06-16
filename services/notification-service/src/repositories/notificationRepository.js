const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

const notificationRepository = {
  create: (reminderId, userId, message) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO notifications (id, reminderId, userId, message, sent, read, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, reminderId, userId, message, 0, 0, now, now);
    return notificationRepository.findById(id);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM notifications WHERE id = ?');
    return stmt.get(id);
  },

  findAll: () => {
    const stmt = db.prepare('SELECT * FROM notifications ORDER BY createdAt DESC');
    return stmt.all();
  },

  findByUserId: (userId) => {
    const stmt = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC');
    return stmt.all(userId);
  },

  findByReminderId: (reminderId) => {
    const stmt = db.prepare('SELECT * FROM notifications WHERE reminderId = ? ORDER BY createdAt DESC');
    return stmt.all(reminderId);
  },

  markAsSent: (id) => {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE notifications SET sent = 1, updatedAt = ? WHERE id = ?');
    stmt.run(now, id);
    return notificationRepository.findById(id);
  },

  markAsRead: (id) => {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE notifications SET read = 1, updatedAt = ? WHERE id = ?');
    stmt.run(now, id);
    return notificationRepository.findById(id);
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM notifications WHERE id = ?');
    stmt.run(id);
  },
};

module.exports = notificationRepository;
