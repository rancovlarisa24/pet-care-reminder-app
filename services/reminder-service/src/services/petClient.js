// petClient.js - client REST prin care Reminder Service comunică cu Pet Service.
// NU accesează direct baza de date a Pet Service, ci doar API-ul lui (principiul
// microserviciilor: comunicare exclusiv prin REST).
const axios = require("axios");

// Verifică (best-effort) că animalul există înainte de a crea un memento.
// În mod demo, dacă Pet Service nu răspunde, nu blochează crearea memento-ului.
const verifyPetExists = async (petId) => {
  const petServiceUrl = process.env.PET_SERVICE_URL;

  if (!petServiceUrl) {
    console.log("PET_SERVICE_URL is not configured. Skipping pet validation.");
    return true;
  }

  try {
    await axios.get(`${petServiceUrl}/api/pets/${petId}`);
    return true;
  } catch (error) {
    console.log("Pet Service unavailable or pet not found. Continuing in demo mode.");
    return true;
  }
};

// Returnează userId-ul proprietarului animalului, pentru a lega notificarea de utilizator.
const getPetOwnerId = async (petId) => {
  const petServiceUrl = process.env.PET_SERVICE_URL;

  if (!petServiceUrl) {
    return null;
  }

  try {
    const response = await axios.get(`${petServiceUrl}/api/pets/${petId}`);
    const pet = response.data && response.data.data ? response.data.data : response.data;
    return pet ? pet.userId : null;
  } catch (error) {
    console.log("Pet Service unavailable. Could not resolve pet owner.");
    return null;
  }
};

module.exports = {
  verifyPetExists,
  getPetOwnerId
};