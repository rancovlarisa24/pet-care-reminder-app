const express = require('express');
const userController = require('../controllers');

const router = express.Router();

// POST /users   - creare utilizator
router.post('/', userController.createUser);
// GET  /users   - listare utilizatori
router.get('/', userController.listUsers);
// GET  /users/:id - obținere utilizator după ID
router.get('/:id', userController.getUser);

module.exports = router;
