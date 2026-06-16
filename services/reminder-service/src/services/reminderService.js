// reminderService.js - logica de business pentru memento-uri și ORCHESTRAREA
// comunicării cu celelalte microservicii (Pet Service și Notification Service).
const reminderRepository = require("../repositories/reminderRepository");
const { verifyPetExists, getPetOwnerId } = require("./petClient");
const { createNotificationForReminder } = require("./notificationClient");

// Returnează toate memento-urile.
const getAllReminders = async () => {
  const reminders = await reminderRepository.findAll();
  return reminders;
};

// Creează un memento nou. Pași:
//  1. validează câmpurile obligatorii (petId, title, reminderDate)
//  2. verifică prin REST că animalul există (Pet Service)
//  3. salvează memento-ul în MySQL
//  4. află cine deține animalul (owner-ul) și creează o notificare pentru el
const createReminder = async (reminderData) => {
  if (!reminderData.petId) {
    throw new Error("petId is required");
  }

  if (!reminderData.title) {
    throw new Error("title is required");
  }

  if (!reminderData.reminderDate) {
    throw new Error("reminderDate is required");
  }

  await verifyPetExists(reminderData.petId);

  const createdReminder = await reminderRepository.create(reminderData);

  const ownerId = await getPetOwnerId(reminderData.petId);
  await createNotificationForReminder(createdReminder, ownerId);

  return createdReminder;
};

// Returnează memento-urile unui anumit animal.
const getRemindersByPetId = async (petId) => {
  if (!petId) {
    throw new Error("petId is required");
  }

  const reminders = await reminderRepository.findByPetId(petId);
  return reminders;
};

// Returnează doar memento-urile active.
const getActiveReminders = async () => {
  const reminders = await reminderRepository.findActive();
  return reminders;
};

// Marchează un memento ca realizat; aruncă eroare dacă nu este găsit.
const markReminderAsDone = async (id) => {
  if (!id) {
    throw new Error("reminder id is required");
  }

  const updatedReminder = await reminderRepository.markAsDone(id);

  if (!updatedReminder) {
    throw new Error("reminder not found");
  }

  return updatedReminder;
};

// Șterge un memento; aruncă eroare dacă nu este găsit.
const deleteReminder = async (id) => {
  if (!id) {
    throw new Error("reminder id is required");
  }

  const deletedReminder = await reminderRepository.remove(id);

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