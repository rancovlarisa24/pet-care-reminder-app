// repositories/index.js - stratul de acces la date (Data Access Layer).
// Aici se află TOATE interogările SQL către tabelul users. Restul codului
// nu scrie SQL direct, ci apelează aceste funcții.
const { pool } = require('../db');

// Inserează un utilizator nou (cu parola deja criptată) și returnează rândul creat.
// NU returnează niciodată password_hash către restul aplicației.
async function create({ name, email, passwordHash }) {
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name, email, passwordHash]
  );
  return result.rows[0];
}

// Caută un utilizator după id; returnează null dacă nu există (fără hash).
async function findById(id) {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Caută un utilizator după email (fără hash) - folosit pentru a verifica duplicatele.
async function findByEmail(email) {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

// Caută un utilizator după email INCLUSIV password_hash - folosit DOAR la login,
// pentru a putea compara parola introdusă cu hash-ul salvat.
async function findByEmailWithHash(email) {
  const result = await pool.query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

module.exports = { create, findById, findByEmail, findByEmailWithHash };
