const express = require('express');
const userRoutes = require('./routes');
const { initDb } = require('./db');

const app = express();
app.use(express.json());

// Health check pentru verificare rapidă / Docker
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'user-service' })
);

app.use('/users', userRoutes);

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
