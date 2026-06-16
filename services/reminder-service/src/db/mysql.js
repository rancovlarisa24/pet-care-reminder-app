// db/mysql.js - configurarea conexiunii la baza de date MySQL a Reminder Service.
// Folosește un pool de conexiuni (mai eficient decât o conexiune nouă per cerere).
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "reminders_db",
  waitForConnections: true,
  connectionLimit: 10, // maxim 10 conexiuni simultane în pool
  queueLimit: 0
});

module.exports = pool;