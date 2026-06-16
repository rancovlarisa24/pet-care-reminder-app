const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Calea fișierului SQLite este configurabilă prin env (SQLITE_FILE),
// pentru a putea fi montată într-un volum Docker persistent.
const dbPath = process.env.SQLITE_FILE || path.join(__dirname, '../../notifications.db');

// Ne asigurăm că directorul există (necesar când fișierul e într-un volum montat).
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const initializeDatabase = () => {
  // Create notifications table if it doesn't exist.
  // Schema corespunde documentației: status (pending/sent/read), channel și
  // marcaje temporale separate (created_at, sent_at, read_at).
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      reminder_id TEXT NOT NULL,
      channel TEXT DEFAULT 'in-app',
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      sent_at TEXT,
      read_at TEXT
    )
  `);

  console.log('✓ Database initialized');
};

const connectToDatabase = async () => {
  try {
    initializeDatabase();
    console.log('✓ Connected to SQLite database');
    return db;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectToDatabase, db };
