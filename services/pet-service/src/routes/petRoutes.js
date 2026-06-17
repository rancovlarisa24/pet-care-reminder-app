// petRoutes.js - definește endpoint-urile REST expuse de Pet Service (montate la /api/pets).
// Toate rutele necesită autentificare: un utilizator vede/gestionează DOAR animalele lui.
const express = require('express');
const router = express.Router();

const petController = require('../controllers/petController');
const { requireAuth, requireAuthOrInternal } = require('../middleware/auth');

router.post('/', requireAuth, petController.createPet);              // POST   /api/pets     - adaugă animal (owner = userul logat)
router.get('/', requireAuth, petController.getAllPets);              // GET    /api/pets     - animalele userului logat
router.get('/:id', requireAuthOrInternal, petController.getPetById); // GET    /api/pets/:id - un animal (owner sau serviciu intern)
router.delete('/:id', requireAuth, petController.deletePet);         // DELETE /api/pets/:id - șterge animal (doar al lui)

module.exports = router;
