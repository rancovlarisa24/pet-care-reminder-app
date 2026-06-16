const axios = require("axios");

const verifyPetExists = async (petId) => {
  const petServiceUrl = process.env.PET_SERVICE_URL;

  if (!petServiceUrl) {
    console.log("PET_SERVICE_URL is not configured. Skipping pet validation.");
    return true;
  }

  try {
    await axios.get(`${petServiceUrl}/pets/${petId}`);
    return true;
  } catch (error) {
    console.log("Pet Service unavailable or pet not found. Continuing in demo mode.");
    return true;
  }
};

module.exports = {
  verifyPetExists
};