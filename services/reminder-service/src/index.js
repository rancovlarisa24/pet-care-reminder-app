// index.js - punctul de pornire al Reminder Service (microserviciul de memento-uri).
// Configurează Express, montează rutele la /api/reminders și pornește serverul (3003).
// Acest serviciu comunică prin REST cu Pet Service și Notification Service.
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // încarcă variabilele de mediu din .env

const reminderRoutes = require("./routes/reminderRoutes");
const { startScheduler } = require("./scheduler/notificationScheduler");

const app = express();

app.use(cors());          // permite cererile din browser către acest API
app.use(express.json());  // parsează body-ul JSON al cererilor

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Reminder Service"
  });
});

app.get("/", (req, res) => {
  res.json({
    service: "Reminder Service",
    status: "running"
  });
});

app.use("/api/reminders", reminderRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Reminder Service running on port ${PORT}`);
  // Pornim scheduler-ul de notificări temporizate (upcoming/due/overdue).
  startScheduler();
});