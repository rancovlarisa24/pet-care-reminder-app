const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    notes: { type: String, default: '' }
  },
  { collection: 'pets', timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema);
