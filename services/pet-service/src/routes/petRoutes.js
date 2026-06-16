// petRoutes.js - definește endpoint-urile REST expuse de Pet Service (montate la /api/pets).
const express = require('express');
const router = express.Router();

const petController = require('../controllers/petController');

router.post('/', petController.createPet);                 // POST   /api/pets        - adaugă animal
router.get('/', petController.getAllPets);                 // GET    /api/pets        - toate animalele
router.get('/user/:userId', petController.getPetsByUserId); // GET   /api/pets/user/:id - animalele unui user
router.get('/:id', petController.getPetById);              // GET    /api/pets/:id    - un animal după id
router.delete('/:id', petController.deletePet);            // DELETE /api/pets/:id    - șterge animal

module.exports = router;
