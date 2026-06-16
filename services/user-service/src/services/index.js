// services/index.js - logica de business (regulile aplicației) pentru utilizatori.
// Aici se fac validările și se aruncă erori cu cod HTTP potrivit; accesul la DB
// este delegat către repository.
const userRepository = require('../repositories');

// Expresie regulată simplă pentru validarea formatului unui email.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Creează un utilizator nou după ce validează datele primite.
// Aruncă: 400 dacă lipsesc câmpuri / email invalid, 409 dacă emailul există deja.
async function createUser({ name, email }) {
  if (!name || !email) {
    const err = new Error('name and email are required');
    err.status = 400;
    throw err;
  }
  if (!EMAIL_REGEX.test(email)) {
    const err = new Error('email is invalid');
    err.status = 400;
    throw err;
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('email already in use');
    err.status = 409;
    throw err;
  }

  return userRepository.create({ name, email });
}

// Returnează lista tuturor utilizatorilor.
async function listUsers() {
  return userRepository.findAll();
}

// Returnează un utilizator după id; aruncă 404 dacă nu este găsit.
async function getUser(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    const err = new Error('user not found');
    err.status = 404;
    throw err;
  }
  return user;
}

module.exports = { createUser, listUsers, getUser };
