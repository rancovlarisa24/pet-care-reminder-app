// notificationClient.js - client REST prin care Reminder Service cere
// Notification Service să creeze o notificare pentru un memento.
// Comunicarea se face exclusiv prin API-ul REST al Notification Service.
const axios = require("axios");

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "dev-internal-key";

// Trimite o cerere generică de creare notificare (server-to-server, cu cheia
// internă). `dedupe` cere serviciului să NU creeze un duplicat dacă există deja
// o notificare de același tip pentru acel memento.
const postNotification = async ({ reminder, userId, type, message, dedupe }) => {
  const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;

  if (!notificationServiceUrl) {
    console.log("NOTIFICATION_SERVICE_URL is not configured. Skipping notification.");
    return false;
  }

  try {
    await axios.post(
      `${notificationServiceUrl}/api/notifications`,
      {
        userId,
        reminderId: reminder.id,
        channel: "in-app",
        type,
        message,
        dedupe: dedupe === true,
      },
      { headers: { "X-Internal-Key": INTERNAL_API_KEY } }
    );
    return true;
  } catch (error) {
    console.log("Notification Service unavailable. Continuing without notification.");
    return false;
  }
};

// Notificare temporizată generată de scheduler (upcoming/due/overdue).
// Folosește dedupe ca fiecare etapă să fie anunțată o singură dată.
const createTimedNotification = async (reminder, userId, type, message) => {
  return postNotification({ reminder, userId, type, message, dedupe: true });
};

module.exports = {
  createTimedNotification,
};