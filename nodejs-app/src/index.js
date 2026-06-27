// ============================================================
// src/index.js — Application Entry Point
// Starts the Express server
// ============================================================

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`  DevOps Node App`);
  console.log(`  Environment : ${ENV}`);
  console.log(`  Port        : ${PORT}`);
  console.log(`  Version     : ${require('../package.json').version}`);
  console.log('========================================');
});
