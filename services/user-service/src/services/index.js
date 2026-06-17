// services/index.js - logica de business (regulile aplicației) pentru autentificare.
// Aici se fac validările, se criptează parola (bcrypt) și se verifică datele de
// autentificare; accesul la DB este delegat către repository.
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories');

// Expresie regulată simplă pentru validarea formatului unui email.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Înregistrează un utilizator nou: validează datele, criptează parola și salvează.
// Aruncă: 400 date invalide, 409 dacă emailul există deja.
async function register({ name, email, password }) {
  if (!name || !email || !password) {
    const err = new Error('name, email and password are required');
    err.status = 400;
    throw err;
  }
  if (!EMAIL_REGEX.test(email)) {
    const err = new Error('email is invalid');
    err.status = 400;
    throw err;
  }
  if (String(password).length < 6) {
    const err = new Error('password must be at least 6 characters');
    err.status = 400;
    throw err;
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('email already in use');
    err.status = 409;
    throw err;
  }

  // Parola NU se salvează niciodată în clar - doar hash-ul bcrypt.
  const passwordHash = await bcrypt.hash(String(password), 10);
  return userRepository.create({ name, email, passwordHash });
}

// Autentifică un utilizator: verifică emailul și compară parola cu hash-ul salvat.
// Aruncă: 400 date lipsă, 401 dacă datele sunt greșite.
async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('email and password are required');
    err.status = 400;
    throw err;
  }

  const row = await userRepository.findByEmailWithHash(email);
  // Mesaj generic (nu dezvăluim dacă emailul există) pentru securitate.
  if (!row) {
    const err = new Error('invalid email or password');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(String(password), row.password_hash);
  if (!ok) {
    const err = new Error('invalid email or password');
    err.status = 401;
    throw err;
  }

  return { id: row.id, name: row.name, email: row.email, created_at: row.created_at };
}

// Returnează un utilizator după id; aruncă 404 dacă nu este găsit. Folosit la /me.
async function getById(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    const err = new Error('user not found');
    err.status = 404;
    throw err;
  }
  return user;
}

module.exports = { register, login, getById };
