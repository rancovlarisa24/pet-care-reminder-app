// controllers/index.js - stratul HTTP: primește request-ul, apelează service-ul
// și trimite răspunsul. Erorile sunt pasate mai departe cu next(err) către
// error handler-ul centralizat din index.js.
const userService = require('../services');

// POST /api/users - creează un utilizator și răspunde cu 201 + utilizatorul creat.
async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

// GET /api/users - returnează lista tuturor utilizatorilor.
async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id - returnează un utilizator după id (sau 404).
async function getUser(req, res, next) {
  try {
    const user = await userService.getUser(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser, listUsers, getUser };
