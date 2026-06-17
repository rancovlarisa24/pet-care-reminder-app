// petService.js - logica de business pentru animale: validează datele primite
// înainte de a le trimite către repository (stratul de acces la MongoDB).
// Toate operațiile sunt legate de proprietar (userId), pentru izolarea datelor.
const petRepository = require('../repositories/petRepository');

// Creează un animal nou pentru utilizatorul logat (userId vine din token, nu din body).
const createPet = async (petData, userId) => {
  const { name, type, breed, age } = petData;

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

// Returnează un animal după id. Un utilizator vede doar animalele lui; un apel
// intern (isInternal) poate citi orice animal (ex: Reminder Service verifică owner-ul).
const getPetById = async (id, userId, isInternal = false) => {
  if (!id) {
    throw new Error('id is required');
  }

  const pet = await petRepository.findById(id);

  if (!pet) {
    throw new Error('Pet not found');
  }

  if (!isInternal && Number(pet.userId) !== Number(userId)) {
    // Nu dezvăluim existența animalului altui utilizator.
    throw new Error('Pet not found');
  }

  return pet;
};

// Returnează animalele unui anumit utilizator (după userId).
const getPetsByUserId = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  return petRepository.findByUserId(Number(userId));
};

// Șterge un animal al utilizatorului logat; aruncă eroare dacă nu există sau nu îi aparține.
const deletePet = async (id, userId) => {
  if (!id) {
    throw new Error('id is required');
  }

  const pet = await petRepository.findById(id);

  if (!pet || Number(pet.userId) !== Number(userId)) {
    throw new Error('Pet not found');
  }

  return petRepository.remove(id);
};

module.exports = {
  createPet,
  getPetById,
  getPetsByUserId,
  deletePet
};
