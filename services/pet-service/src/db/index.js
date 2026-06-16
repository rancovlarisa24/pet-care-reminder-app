// db/index.js - conectarea Pet Service la baza de date MongoDB prin Mongoose.
const mongoose = require('mongoose');

// Se conectează la MongoDB folosind URI-ul din variabila de mediu MONGO_URI.
const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(mongoUri);

  console.log('Connected to MongoDB');
};

module.exports = { connectToDatabase };
