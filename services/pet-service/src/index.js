const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const petRoutes = require('./routes');
const { connectToDatabase } = require('./db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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
