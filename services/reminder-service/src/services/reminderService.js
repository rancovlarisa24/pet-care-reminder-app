const reminderRepository = require("../repositories/reminderRepository");
const { verifyPetExists } = require("./petClient");
const { createNotificationForReminder } = require("./notificationClient");

const getAllReminders = async () => {
  const reminders = await reminderRepository.findAll();
  return reminders;
};

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

  await createNotificationForReminder(createdReminder);

  return createdReminder;
};

const getRemindersByPetId = async (petId) => {
  if (!petId) {
    throw new Error("petId is required");
  }

  const reminders = await reminderRepository.findByPetId(petId);
  return reminders;
};

const getActiveReminders = async () => {
  const reminders = await reminderRepository.findActive();
  return reminders;
};

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