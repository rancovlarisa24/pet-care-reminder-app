// index.js - punctul de pornire al Pet Service (microserviciul de animale).
// Configurează Express, montează rutele la /api/pets, se conectează la MongoDB
// și pornește serverul pe portul 3002.
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const petRoutes = require('./routes');
const { connectToDatabase } = require('./db');

dotenv.config(); // încarcă variabilele din fișierul .env (dacă există)

const app = express();

app.use(cors());            // permite cererile din browser către acest API
app.use(express.json());    // parsează body-ul JSON al cererilor
app.use(morgan('dev'));     // loghează în consolă fiecare cerere HTTP

app.get('/', (req, res) => {
  res.json({ service: 'Pet Service', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Pet Service' });
});

app.use('/api/pets', petRoutes);

const PORT = process.env.PORT || 3002;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Pet Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
