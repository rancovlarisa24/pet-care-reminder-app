// notificationClient.js - client REST prin care Reminder Service cere
// Notification Service s\u0103 creeze o notificare pentru un memento.
// Comunicarea se face exclusiv prin API-ul REST al Notification Service.
const axios = require("axios");

// Trimite o cerere de creare notificare. Prime\u0219te memento-ul \u0219i userId-ul
// proprietarului animalului, astfel \u00eenc\u00e2t notificarea s\u0103 ajung\u0103 la utilizatorul corect.
const createNotificationForReminder = async (reminder, userId) => {
  const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;

  if (!notificationServiceUrl) {
    console.log("NOTIFICATION_SERVICE_URL is not configured. Skipping notification creation.");
    return;
  }

  try {
    await axios.post(`${notificationServiceUrl}/api/notifications`, {
      userId: userId || 1,        // owner-ul animalului (fallback 1 \u00een mod demo)
      reminderId: reminder.id,
      channel: "in-app",
      message: `Reminder: ${reminder.title}`,
      status: "pending"
    });

    console.log("Notification request sent successfully.");
  } catch (error) {
    console.log("Notification Service unavailable. Continuing without notification.");
  }
};

module.exports = {
  createNotificationForReminder
};