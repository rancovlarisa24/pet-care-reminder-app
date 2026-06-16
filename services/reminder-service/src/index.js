const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const reminderRoutes = require("./routes/reminderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "Reminder Service",
    status: "running"
  });
});

app.use("/reminders", reminderRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Reminder Service running on port ${PORT}`);
});