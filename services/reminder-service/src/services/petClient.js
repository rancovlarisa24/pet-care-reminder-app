// petClient.js - client REST prin care Reminder Service comunică cu Pet Service.
// NU accesează direct baza de date a Pet Service, ci doar API-ul lui (principiul
// microserviciilor: comunicare exclusiv prin REST). Apelurile sunt server-to-server,
// deci folosesc cheia internă (X-Internal-Key) în loc de un token de utilizator.
const axios = require("axios");

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "dev-internal-key";

// Verifică faptul că animalul există ȘI aparține utilizatorului care creează reminderul.
// Aruncă eroare dacă animalul nu există, nu aparține userului sau Pet Service e indisponibil
// (fail-closed: nu permitem crearea de remindere pentru animale neverificabile).
const getOwnedPet = async (petId, userId) => {
  const petServiceUrl = process.env.PET_SERVICE_URL;

  if (!petServiceUrl) {
    throw new Error("PET_SERVICE_URL is not configured");
  }

  let response;
  try {
    response = await axios.get(`${petServiceUrl}/api/pets/${petId}`, {
      headers: { "X-Internal-Key": INTERNAL_API_KEY }
    });
  } catch (error) {
    throw new Error("pet not found or pet service unavailable");
  }

  const pet = response.data && response.data.data ? response.data.data : response.data;

  if (!pet || Number(pet.userId) !== Number(userId)) {
    throw new Error("pet not found");
  }

  return pet;
};

module.exports = {
  getOwnedPet
};