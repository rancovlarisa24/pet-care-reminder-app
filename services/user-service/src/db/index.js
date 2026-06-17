// db/index.js - configurarea conexiunii la baza de date PostgreSQL a User Service.
// Toate datele de conectare vin din variabile de mediu (setate în docker-compose),
// cu valori implicite pentru rularea locală în afara containerului.
const { Pool } = require('pg');

// Pool-ul gestionează automat un set de conexiuni reutilizabile către PostgreSQL,
// pentru a nu deschide o conexiune nouă la fiecare cerere.
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
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { pool, initDb };
