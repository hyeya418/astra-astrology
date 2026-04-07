'use strict';

require('dotenv').config();

const express = require('express');
const { getSwe } = require('./src/natalChart');

const app = express();
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
