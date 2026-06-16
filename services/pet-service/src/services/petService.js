const petRepository = require('../repositories/petRepository');

const createPet = async (petData) => {
  const { userId, name, type, breed, age } = petData;

  if (userId === undefined || userId === null) {
    throw new Error('userId is required');
  }

  if (!Number.isInteger(Number(userId))) {
    throw new Error('userId must be an integer');
  }

  if (!name || !type || !breed) {
    throw new Error('name, type, and breed are required');
  }

  if (age === undefined || age === null || !Number.isInteger(Number(age))) {
    throw new Error('age must be an integer');
  }

  const pet = await petRepository.create({
    userId: Number(userId),
    name,
    type,
    breed,
    age: Number(age),
    notes: petData.notes || ''
  });

  return pet;
};

const getAllPets = async () => {
  return petRepository.findAll();
};

const getPetById = async (id) => {
  if (!id) {
    throw new Error('id is required');
  }

  const pet = await petRepository.findById(id);

  if (!pet) {
    throw new Error('Pet not found');
  }

  return pet;
};

const getPetsByUserId = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  return petRepository.findByUserId(Number(userId));
};

const deletePet = async (id) => {
  if (!id) {
    throw new Error('id is required');
  }

  const pet = await petRepository.remove(id);

  if (!pet) {
    throw new Error('Pet not found');
  }

  return pet;
};

module.exports = {
  createPet,
  getAllPets,
  getPetById,
  getPetsByUserId,
  deletePet
};
