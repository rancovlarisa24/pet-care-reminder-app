const userRepository = require('../repositories');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

async function listUsers() {
  return userRepository.findAll();
}

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
