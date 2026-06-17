// reminderRepository.js - stratul de acces la date (interogările SQL către MySQL).
// Fiecare funcție apelează întâi createRemindersTable() pentru a se asigura că
// tabelul există înainte de a opera pe el.
const pool = require("../db/mysql");

// Creează tabelul reminders dacă nu există deja.
const createRemindersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS reminders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      pet_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      reminder_date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await pool.query(query);
};

// Returnează reminderele unui utilizator, ordonate după data scadenței.
const findAllByUser = async (userId) => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE user_id = ? ORDER BY reminder_date ASC",
    [userId]
  );

  return rows;
};

// Inserează un memento nou (legat de utilizatorul logat) și returnează rândul creat.
const create = async (reminderData) => {
  await createRemindersTable();

  const {
    userId,
    petId,
    title,
    description,
    category,
    reminderDate,
    status = "active"
  } = reminderData;

  const query = `
    INSERT INTO reminders 
      (user_id, pet_id, title, description, category, reminder_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [
    userId,
    petId,
    title,
    description,
    category,
    reminderDate,
    status
  ]);

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE id = ?",
    [result.insertId]
  );

  return rows[0];
};

// Returnează reminderele unui animal, dar DOAR cele ale utilizatorului logat.
const findByPetId = async (petId, userId) => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE pet_id = ? AND user_id = ? ORDER BY reminder_date ASC",
    [petId, userId]
  );

  return rows;
};

// Returnează reminderele active ale utilizatorului logat.
const findActiveByUser = async (userId) => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE status = ? AND user_id = ? ORDER BY reminder_date ASC",
    ["active", userId]
  );

  return rows;
};

// Returnează TOATE reminderele active (ale tuturor utilizatorilor).
// Folosit de scheduler pentru a genera notificări temporizate (upcoming/due/overdue).
const findAllActive = async () => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE status = ? ORDER BY reminder_date ASC",
    ["active"]
  );

  return rows;
};

// Marchează un memento al utilizatorului ca realizat; returnează null dacă nu există/nu îi aparține.
const markAsDone = async (id, userId) => {
  await createRemindersTable();

  const [result] = await pool.query(
    "UPDATE reminders SET status = ? WHERE id = ? AND user_id = ?",
    ["done", id, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE id = ?",
    [id]
  );

  return rows[0];
};

// Șterge un memento al utilizatorului; returnează rândul șters sau null dacă nu există/nu îi aparține.
const remove = async (id, userId) => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  if (rows.length === 0) {
    return null;
  }

  await pool.query(
    "DELETE FROM reminders WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  return rows[0];
};

module.exports = {
  createRemindersTable,
  findAllByUser,
  create,
  findByPetId,
  findActiveByUser,
  findAllActive,
  markAsDone,
  remove
};