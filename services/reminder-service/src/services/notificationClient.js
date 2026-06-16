const axios = require("axios");

const createNotificationForReminder = async (reminder) => {
  const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;

  if (!notificationServiceUrl) {
    console.log("NOTIFICATION_SERVICE_URL is not configured. Skipping notification creation.");
    return;
  }

  try {
    await axios.post(`${notificationServiceUrl}/notifications`, {
      userId: 1,
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