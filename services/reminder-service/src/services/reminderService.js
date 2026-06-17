// reminderService.js - logica de business pentru memento-uri și ORCHESTRAREA
// comunicării cu celelalte microservicii (Pet Service și Notification Service).
// Toate operațiile sunt legate de utilizatorul logat (userId din token).
const reminderRepository = require("../repositories/reminderRepository");
const { getOwnedPet } = require("./petClient");

// Returnează reminderele utilizatorului logat.
const getAllReminders = async (userId) => {
  return reminderRepository.findAllByUser(userId);
};

// Creează un memento nou pentru utilizatorul logat. Pași:
//  1. validează câmpurile obligatorii (petId, title, reminderDate)
//  2. verifică prin REST că animalul există ȘI aparține utilizatorului (Pet Service)
//  3. salvează memento-ul în MySQL (legat de user_id)
// NU se trimite nicio notificare la creare: notificările apar doar când se
// apropie/vine/trece data reminderului (generate de scheduler).
const createReminder = async (reminderData, userId) => {
  if (!reminderData.petId) {
    throw new Error("petId is required");
  }

  if (!reminderData.title) {
    throw new Error("title is required");
  }

  if (!reminderData.reminderDate) {
    throw new Error("reminderDate is required");
  }

  // Verifică proprietatea animalului: nu poți crea remindere pentru animalul altcuiva.
  await getOwnedPet(reminderData.petId, userId);

  const createdReminder = await reminderRepository.create({ ...reminderData, userId });

  return createdReminder;
};

// Returnează reminderele unui animal (doar cele ale utilizatorului logat).
const getRemindersByPetId = async (petId, userId) => {
  if (!petId) {
    throw new Error("petId is required");
  }

  return reminderRepository.findByPetId(petId, userId);
};

// Returnează reminderele active ale utilizatorului logat.
const getActiveReminders = async (userId) => {
  return reminderRepository.findActiveByUser(userId);
};

// Marchează un memento al utilizatorului ca realizat; aruncă eroare dacă nu există/nu îi aparține.
const markReminderAsDone = async (id, userId) => {
  if (!id) {
    throw new Error("reminder id is required");
  }

  const updatedReminder = await reminderRepository.markAsDone(id, userId);

  if (!updatedReminder) {
    throw new Error("reminder not found");
  }

  return updatedReminder;
};

// Șterge un memento al utilizatorului; aruncă eroare dacă nu există/nu îi aparține.
const deleteReminder = async (id, userId) => {
  if (!id) {
    throw new Error("reminder id is required");
  }

  const deletedReminder = await reminderRepository.remove(id, userId);

  if (!deletedReminder) {
    throw new Error("reminder not found");
  }

  return deletedReminder;
};

module.exports = {
  getAllReminders,
  createReminder,
  getRemindersByPetId,
  getActiveReminders,
  markReminderAsDone,
  deleteReminder
};