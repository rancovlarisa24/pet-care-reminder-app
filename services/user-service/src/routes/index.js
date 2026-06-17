// routes/index.js - rutele de autentificare (montate la /api/auth).
const express = require('express');
const authController = require('../controllers');
const { authMiddleware } = require('../auth/jwt');

const router = express.Router();

// POST /api/auth/register - înregistrare cont nou (nume, email, parolă)
router.post('/register', authController.register);
// POST /api/auth/login    - autentificare (email, parolă) -> token JWT
router.post('/login', authController.login);
// GET  /api/auth/me       - datele utilizatorului curent (necesită token)
router.get('/me', authMiddleware, authController.me);

module.exports = router;
