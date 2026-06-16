const petService = require('../services/petService');

const createPet = async (req, res) => {
  try {
    const pet = await petService.createPet(req.body);
    return res.status(201).json({ message: 'Pet created successfully', data: pet });
  } catch (error) {
    console.error('POST /api/pets error:', error);
    return res.status(400).json({ message: 'Failed to create pet', error: error.message });
  }
};

const getAllPets = async (req, res) => {
  try {
    const pets = await petService.getAllPets();
    return res.json({ message: 'List of pets', data: pets });
  } catch (error) {
    console.error('GET /api/pets error:', error);
    return res.status(500).json({ message: 'Failed to get pets', error: error.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await petService.getPetById(id);
    return res.json({ message: 'Pet found', data: pet });
  } catch (error) {
    console.error('GET /api/pets/:id error:', error);
    return res.status(404).json({ message: 'Failed to get pet', error: error.message });
  }
};

const getPetsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const pets = await petService.getPetsByUserId(userId);
    return res.json({ message: `Pets for user ${userId}`, data: pets });
  } catch (error) {
    console.error('GET /api/pets/user/:userId error:', error);
    return res.status(500).json({ message: 'Failed to get pets by userId', error: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await petService.deletePet(id);
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
  getPetsByUserId,
  deletePet
};
