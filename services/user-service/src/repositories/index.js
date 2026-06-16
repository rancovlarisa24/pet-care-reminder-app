const { pool } = require('../db');

async function create({ name, email }) {
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
    [name, email]
  );
  return result.rows[0];
}

async function findAll() {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users ORDER BY id'
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

module.exports = { create, findAll, findById, findByEmail };
