const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'petcare',
  password: process.env.PGPASSWORD || 'petcare',
  database: process.env.PGDATABASE || 'users_db',
});

// Creează tabelul users dacă nu există (rulat la pornirea serviciului)
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { pool, initDb };
