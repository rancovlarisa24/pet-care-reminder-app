const mongoose = require('mongoose');

const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(mongoUri);

  console.log('Connected to MongoDB');
};

module.exports = { connectToDatabase };
