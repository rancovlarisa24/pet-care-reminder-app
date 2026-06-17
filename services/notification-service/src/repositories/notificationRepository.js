// notificationRepository.js - stratul de acces la date pentru notificări (SQLite).
// Folosește better-sqlite3 (interogari sincrone) și uuid pentru generarea id-urilor.
const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

const notificationRepository = {
  // Inserează o notificare nouă (status 'pending') și returnează rândul creat.
  // Normalizăm tipurile: user_id întreg, reminder_id text curat (evită valori de
  // tip "3.0" la legarea numerelor JS în coloane TEXT).
  create: ({ userId, reminderId, channel, message, type }) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const userIdInt = Number.parseInt(userId, 10);
    const reminderIdStr = String(reminderId);
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, reminder_id, channel, message, type, status, created_at, sent_at, read_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userIdInt, reminderIdStr, channel || 'in-app', message, type || 'created', 'pending', now, null, null);
    return notificationRepository.findById(id);
  },

  // Verifică dacă există deja o notificare de un anumit tip pentru un memento.
  // Folosit pentru a evita duplicatele generate de scheduler (o singură notificare
  // per (reminder_id, type): upcoming/due/overdue).
  existsByReminderAndType: (reminderId, type) => {
    const stmt = db.prepare(
      'SELECT 1 FROM notifications WHERE reminder_id = ? AND type = ? LIMIT 1'
    );
    return stmt.get(String(reminderId), type) !== undefined;
  },

  // Caută o notificare după id.
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM notifications WHERE id = ?');
    return stmt.get(id);
  },

  // Returnează toate notificările, cele mai noi primele.
  findAll: () => {
    const stmt = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC');
    return stmt.all();
  },

  // Returnează notificările unui anumit utilizator.
  findByUserId: (userId) => {
    const stmt = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  },

  // Returnează notificările generate de un anumit memento.
  findByReminderId: (reminderId) => {
    const stmt = db.prepare('SELECT * FROM notifications WHERE reminder_id = ? ORDER BY created_at DESC');
    return stmt.all(reminderId);
  },

  // Marchează notificarea ca trimisă (status 'sent', sent_at = acum).
  markAsSent: (id) => {
    const now = new Date().toISOString();
    const stmt = db.prepare("UPDATE notifications SET status = 'sent', sent_at = ? WHERE id = ?");
    stmt.run(now, id);
    return notificationRepository.findById(id);
  },

  // Marchează notificarea ca citită (status 'read', read_at = acum).
  markAsRead: (id) => {
    const now = new Date().toISOString();
    const stmt = db.prepare("UPDATE notifications SET status = 'read', read_at = ? WHERE id = ?");
    stmt.run(now, id);
    return notificationRepository.findById(id);
  },

  // Șterge o notificare după id.
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM notifications WHERE id = ?');
    stmt.run(id);
  },
};

module.exports = notificationRepository;
