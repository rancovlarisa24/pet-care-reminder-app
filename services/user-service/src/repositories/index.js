// repositories/index.js - stratul de acces la date (Data Access Layer).
// Aici se află TOATE interogările SQL către tabelul users. Restul codului
// nu scrie SQL direct, ci apelează aceste funcții.
const { pool } = require('../db');

// Inserează un utilizator nou și returnează rândul creat (cu id-ul generat).
async function create({ name, email }) {
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
    [name, email]
  );
  return result.rows[0];
}

// Returnează toți utilizatorii, ordonați după id.
async function findAll() {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users ORDER BY id'
  );
  return result.rows;
}

// Caută un utilizator după id; returnează null dacă nu există.
async function findById(id) {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Caută un utilizator după email; folosit pentru a verifica emailurile duplicate.
async function findByEmail(email) {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

module.exports = { create, findAll, findById, findByEmail };
