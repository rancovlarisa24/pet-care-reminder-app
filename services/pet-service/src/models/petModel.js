// petModel.js - schema Mongoose pentru un animal de companie.
// Definește structura documentelor din colecția 'pets' și ce câmpuri sunt obligatorii.
// Câmpul userId leagă animalul de utilizatorul care îl deține (din User Service).
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true }, // id-ul proprietarului (din User Service)
    name: { type: String, required: true },
    type: { type: String, required: true },   // specia (ex: dog, cat)
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    notes: { type: String, default: '' }
  },
  { collection: 'pets', timestamps: true } // timestamps adaugă createdAt și updatedAt
);

module.exports = mongoose.model('Pet', petSchema);
