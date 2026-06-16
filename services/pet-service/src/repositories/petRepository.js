const Pet = require('../models/petModel');

const create = async (petData) => {
  const pet = await Pet.create(petData);
  return pet;
};

const findAll = async () => {
  return Pet.find();
};

const findById = async (id) => {
  return Pet.findById(id);
};

const findByUserId = async (userId) => {
  return Pet.find({ userId });
};

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
