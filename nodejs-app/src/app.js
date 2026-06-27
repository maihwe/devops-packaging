// ============================================================
// src/app.js — Express App Configuration
// Separated from index.js so tests can import app without
// starting the server (a standard Node.js best practice)
// ============================================================

const express = require('express');
const cors = require('cors');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'DevOps Node App is running!',
    environment: process.env.NODE_ENV || 'development',
    version: require('../package.json').version,
  });
});

// Health check route (used by staging/prod to verify the app is alive)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
