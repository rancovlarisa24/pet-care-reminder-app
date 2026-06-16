const pool = require("../db/mysql");

const createRemindersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS reminders (
      id INT AUTO_INCREMENT PRIMARY KEY,
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

const findAll = async () => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders ORDER BY reminder_date ASC"
  );

  return rows;
};

const create = async (reminderData) => {
  await createRemindersTable();

  const {
    petId,
    title,
    description,
    category,
    reminderDate,
    status = "active"
  } = reminderData;

  const query = `
    INSERT INTO reminders 
      (pet_id, title, description, category, reminder_date, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [
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

const findByPetId = async (petId) => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE pet_id = ? ORDER BY reminder_date ASC",
    [petId]
  );

  return rows;
};

const findActive = async () => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE status = ? ORDER BY reminder_date ASC",
    ["active"]
  );

  return rows;
};

const markAsDone = async (id) => {
  await createRemindersTable();

  const [result] = await pool.query(
    "UPDATE reminders SET status = ? WHERE id = ?",
    ["done", id]
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

const remove = async (id) => {
  await createRemindersTable();

  const [rows] = await pool.query(
    "SELECT * FROM reminders WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  await pool.query(
    "DELETE FROM reminders WHERE id = ?",
    [id]
  );

  return rows[0];
};

module.exports = {
  createRemindersTable,
  findAll,
  create,
  findByPetId,
  findActive,
  markAsDone,
  remove
};