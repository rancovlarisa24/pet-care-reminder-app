// reminderRoutes.js - endpoint-urile REST expuse de Reminder Service (montate la /api/reminders).
// Toate rutele necesită autentificare: un utilizator vede/gestionează DOAR reminderele lui.
const express = require("express");
const router = express.Router();

const reminderController = require("../controllers/reminderController");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth); // protejează toate rutele de mai jos

router.post("/", reminderController.createReminder);                  // POST   /api/reminders          - creează memento
router.get("/", reminderController.getAllReminders);                  // GET    /api/reminders          - reminderele userului
router.get("/active", reminderController.getActiveReminders);         // GET    /api/reminders/active   - doar cele active
router.get("/pet/:petId", reminderController.getRemindersByPetId);    // GET    /api/reminders/pet/:id  - după animal
router.put("/:id/done", reminderController.markReminderAsDone);       // PUT    /api/reminders/:id/done - marchează ca realizat
router.delete("/:id", reminderController.deleteReminder);             // DELETE /api/reminders/:id      - șterge memento

module.exports = router;