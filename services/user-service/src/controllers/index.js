// controllers/index.js - stratul HTTP pentru autentificare: primește request-ul,
// apelează service-ul și trimite răspunsul (utilizator + token JWT). Erorile sunt
// pasate mai departe cu next(err) către error handler-ul centralizat din index.js.
const userService = require('../services');
const { signToken } = require('../auth/jwt');

// POST /api/auth/register - creează un cont nou și răspunde cu utilizatorul + token.
async function register(req, res, next) {
  try {
    const user = await userService.register(req.body);
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login - verifică datele și răspunde cu utilizatorul + token.
async function login(req, res, next) {
  try {
    const user = await userService.login(req.body);
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me - returnează utilizatorul curent (din token). Necesită autentificare.
async function me(req, res, next) {
  try {
    const user = await userService.getById(req.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
