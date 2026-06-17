// petController.js - stratul HTTP al Pet Service: primește cererile, apelează
// logica din petService și formatează răspunsul ({ message, data }).
// userId vine ÎNTOTDEAUNA din token (req.userId), niciodată din body - astfel un
// utilizator nu poate crea/citi animale pe contul altcuiva.
const petService = require('../services/petService');

// POST /api/pets - creează un animal nou pentru utilizatorul logat.
const createPet = async (req, res) => {
  try {
    const pet = await petService.createPet(req.body, req.userId);
    return res.status(201).json({ message: 'Pet created successfully', data: pet });
  } catch (error) {
    console.error('POST /api/pets error:', error);
    return res.status(400).json({ message: 'Failed to create pet', error: error.message });
  }
};

// GET /api/pets - returnează DOAR animalele utilizatorului logat.
const getAllPets = async (req, res) => {
  try {
    const pets = await petService.getPetsByUserId(req.userId);
    return res.json({ message: 'List of pets', data: pets });
  } catch (error) {
    console.error('GET /api/pets error:', error);
    return res.status(500).json({ message: 'Failed to get pets', error: error.message });
  }
};

// GET /api/pets/:id - returnează un animal după id.
// Un utilizator vede doar animalele lui; un serviciu intern (req.isInternal) le poate citi pe toate.
const getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await petService.getPetById(id, req.userId, req.isInternal);
    return res.json({ message: 'Pet found', data: pet });
  } catch (error) {
    console.error('GET /api/pets/:id error:', error);
    return res.status(404).json({ message: 'Failed to get pet', error: error.message });
  }
};

// DELETE /api/pets/:id - șterge un animal al utilizatorului logat.
const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await petService.deletePet(id, req.userId);
    return res.json({ message: 'Pet deleted successfully', data: pet });
  } catch (error) {
    console.error('DELETE /api/pets/:id error:', error);
    return res.status(404).json({ message: 'Failed to delete pet', error: error.message });
  }
};

module.exports = {
  createPet,
  getAllPets,
  getPetById,
  deletePet
};
