// petRepository.js - stratul de acces la date pentru animale (operații pe MongoDB).
const Pet = require('../models/petModel');

// Creează și salvează un animal nou în baza de date.
const create = async (petData) => {
  const pet = await Pet.create(petData);
  return pet;
};

// Returnează toate animalele.
const findAll = async () => {
  return Pet.find();
};

// Caută un animal după id-ul său MongoDB.
const findById = async (id) => {
  return Pet.findById(id);
};

// Returnează toate animalele unui anumit utilizator.
const findByUserId = async (userId) => {
  return Pet.find({ userId });
};

// Șterge un animal după id.
const remove = async (id) => {
  return Pet.findByIdAndDelete(id);
};

module.exports = {
  create,
  findAll,
  findById,
  findByUserId,
  remove
};
