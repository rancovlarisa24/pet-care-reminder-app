const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../notifications.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const initializeDatabase = () => {
  // Create notifications table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      reminderId TEXT NOT NULL,
      userId INTEGER NOT NULL,
      message TEXT NOT NULL,
      sent INTEGER DEFAULT 0,
      read INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
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
