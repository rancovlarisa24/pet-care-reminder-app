// index.js - punctul de pornire al User Service (microserviciul de utilizatori).
// Configurează serverul Express, montează rutele de autentificare la /api/auth,
// inițializează baza de date PostgreSQL și pornește serverul pe portul 3001.
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes');
const { initDb } = require('./db');

const app = express();
app.use(cors());           // permite cererile din browser (frontend) către acest API
app.use(express.json());   // parsează automat body-ul JSON al cererilor

// Health check pentru verificare rapidă / Docker
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'user-service' })
);

app.use('/api/auth', authRoutes);

// Error handler centralizat
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'internal error' });
});

const PORT = Number(process.env.PORT) || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`user-service listening on ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });
