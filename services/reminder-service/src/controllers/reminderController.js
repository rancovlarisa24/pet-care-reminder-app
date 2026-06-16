const reminderService = require("../services/reminderService");

const getAllReminders = async (req, res) => {
  try {
    const reminders = await reminderService.getAllReminders();

    return res.json({
      message: "List of reminders",
      data: reminders
    });
  } catch (error) {
    console.error("GET /reminders error:", error);

    return res.status(500).json({
      message: "Failed to get reminders",
      error: error.message
    });
  }
};

const createReminder = async (req, res) => {
  try {
    const createdReminder = await reminderService.createReminder(req.body);

    return res.status(201).json({
      message: "Reminder created successfully",
      data: createdReminder
    });
  } catch (error) {
    console.error("POST /reminders error:", error);

    return res.status(400).json({
      message: "Failed to create reminder",
      error: error.message
    });
  }
};

const getRemindersByPetId = async (req, res) => {
  try {
    const { petId } = req.params;

    const reminders = await reminderService.getRemindersByPetId(petId);

    return res.json({
      message: `Reminders for pet ${petId}`,
      data: reminders
    });
  } catch (error) {
    console.error("GET /reminders/pet/:petId error:", error);

    return res.status(500).json({
      message: "Failed to get reminders by petId",
      error: error.message
    });
  }
};

const getActiveReminders = async (req, res) => {
  try {
    const reminders = await reminderService.getActiveReminders();

    return res.json({
      message: "Active reminders",
      data: reminders
    });
  } catch (error) {
    console.error("GET /reminders/active error:", error);

    return res.status(500).json({
      message: "Failed to get active reminders",
      error: error.message
    });
  }
};

const markReminderAsDone = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedReminder = await reminderService.markReminderAsDone(id);

    return res.json({
      message: "Reminder marked as done",
      data: updatedReminder
    });
  } catch (error) {
    console.error("PUT /reminders/:id/done error:", error);

    return res.status(404).json({
      message: "Failed to mark reminder as done",
      error: error.message
    });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReminder = await reminderService.deleteReminder(id);

    return res.json({
      message: "Reminder deleted successfully",
      data: deletedReminder
    });
  } catch (error) {
    console.error("DELETE /reminders/:id error:", error);

    return res.status(404).json({
      message: "Failed to delete reminder",
      error: error.message
    });
  }
};

module.exports = {
  getAllReminders,
  createReminder,
  getRemindersByPetId,
  getActiveReminders,
  markReminderAsDone,
  deleteReminder
};