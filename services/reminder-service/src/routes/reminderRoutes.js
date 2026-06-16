const express = require("express");
const router = express.Router();

const reminderController = require("../controllers/reminderController");

router.post("/", reminderController.createReminder);
router.get("/", reminderController.getAllReminders);
router.get("/active", reminderController.getActiveReminders);
router.get("/pet/:petId", reminderController.getRemindersByPetId);
router.put("/:id/done", reminderController.markReminderAsDone);
router.delete("/:id", reminderController.deleteReminder);

module.exports = router;