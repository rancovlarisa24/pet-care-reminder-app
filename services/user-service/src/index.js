// index.js - punctul de pornire al User Service (microserviciul de utilizatori).
// Configureaz\u0103 serverul Express, monteaz\u0103 rutele la /api/users, ini\u021bializeaz\u0103
// baza de date PostgreSQL \u0219i pornește serverul pe portul configurat (3001).
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes');
const { initDb } = require('./db');

const app = express();
app.use(cors());           // permite cererile din browser (frontend) c\u0103tre acest API
app.use(express.json());   // parseaz\u0103 automat body-ul JSON al cererilor

// Health check pentru verificare rapidă / Docker
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'user-service' })
);

app.use('/api/users', userRoutes);

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
