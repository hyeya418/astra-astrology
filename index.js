'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { getSwe } = require('./src/natalChart');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://astra-astrology-rust.vercel.app',
    'https://astra-astrology-git-main-hyeya418s-projects.vercel.app',
    /\.vercel\.app$/,
  ],
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// Initialize Swiss Ephemeris once at startup
try {
  getSwe();
  console.log('✓ Swiss Ephemeris WASM initialized');
} catch (err) {
  console.error('✗ Failed to initialize Swiss Ephemeris:', err.message);
  process.exit(1);
}

// Routes
app.use('/chart', require('./routes/chart'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Natal chart server running on port ${PORT}`);
});

module.exports = app;
