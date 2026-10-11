import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { store } from './services/store.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('----------------------------------------------------');
  console.log('  REPLATE — Food Redistribution Platform Backend    ');
  console.log('  Team NovaNex | CBIT Hyderabad | IETE IDEATHON 2026');
  console.log('----------------------------------------------------');

  // Attempt database connection
  await connectDB();

  // Initialize data persistence store & initial dataset
  await store.init();

  app.listen(PORT, () => {
    console.log(`[REPLATE Server] Running on http://localhost:${PORT}`);
    console.log(`[REPLATE Server] API health at http://localhost:${PORT}/api/system/status`);
  });
}

startServer();
