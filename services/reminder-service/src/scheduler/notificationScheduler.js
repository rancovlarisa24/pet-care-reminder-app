// notificationScheduler.js - rulează periodic și generează notificări temporizate
// pentru reminderele active: "se apropie" (upcoming), "astăzi" (due) și
// "restant" (overdue). Notification Service deduplică pe (reminder_id, type),
// deci fiecare etapă este anunțată o singură dată, fără spam.
const reminderRepository = require("../repositories/reminderRepository");
const { getOwnedPet } = require("../services/petClient");
const { createTimedNotification } = require("../services/notificationClient");
const { computeStage, buildMessage } = require("../utils/notificationMessages");

// Cât de des verificăm reminderele (ms). Implicit 60s; configurabil prin env.
const INTERVAL_MS = Number(process.env.SCHEDULER_INTERVAL_MS) || 60000;

// Citește numele animalului (best-effort, cu mic cache pe rulare). Dacă Pet
// Service nu răspunde, întoarcem null și mesajul folosește un text generic.
const getPetNameSafe = async (petId, userId, cache) => {
  const key = `${petId}:${userId}`;
  if (cache.has(key)) return cache.get(key);
  let name = null;
  try {
    const pet = await getOwnedPet(petId, userId);
    name = pet && pet.name ? pet.name : null;
  } catch {
    name = null;
  }
  cache.set(key, name);
  return name;
};

// O singură trecere prin toate reminderele active.
const runOnce = async () => {
  let reminders;
  try {
    reminders = await reminderRepository.findAllActive();
  } catch (error) {
    console.log("Scheduler: nu pot citi reminderele:", error.message);
    return;
  }

  const petCache = new Map();
  let generated = 0;

  for (const reminder of reminders) {
    const stage = computeStage(reminder.reminder_date);
    if (!stage) continue; // încă prea departe în viitor

    const petName = await getPetNameSafe(reminder.pet_id, reminder.user_id, petCache);
    const message = buildMessage(reminder, petName, stage.type);

    const created = await createTimedNotification(reminder, reminder.user_id, stage.type, message);
    if (created) generated += 1;
  }

  if (generated > 0) {
    console.log(`Scheduler: ${generated} notificare(i) temporizată(e) generată(e).`);
  }
};

// Pornește scheduler-ul: o trecere imediată la start, apoi la fiecare interval.
const startScheduler = () => {
  console.log(`Scheduler notificări pornit (la fiecare ${INTERVAL_MS / 1000}s).`);
  runOnce().catch((e) => console.log("Scheduler eroare:", e.message));
  setInterval(() => {
    runOnce().catch((e) => console.log("Scheduler eroare:", e.message));
  }, INTERVAL_MS);
};

module.exports = { startScheduler, runOnce };
