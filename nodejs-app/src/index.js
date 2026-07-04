// ============================================================
// src/index.js — Application Entry Point
// Starts the Express server
// ============================================================
const app = require('./app');
const config = require('./config/env');

app.listen(config.port, () => {
  console.log('========================================');
  console.log(`  DevOps Node App`);
  console.log(`  Environment : ${config.env}`);
  console.log(`  Port        : ${config.port}`);
  console.log(`  Version     : ${require('../package.json').version}`);
  console.log('========================================');
});
