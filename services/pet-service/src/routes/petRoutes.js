const express = require('express');
const router = express.Router();

const petController = require('../controllers/petController');

router.post('/', petController.createPet);
router.get('/', petController.getAllPets);
router.get('/user/:userId', petController.getPetsByUserId);
router.get('/:id', petController.getPetById);
router.delete('/:id', petController.deletePet);

module.exports = router;
