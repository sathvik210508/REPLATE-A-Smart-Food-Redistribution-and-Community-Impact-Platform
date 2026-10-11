import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { store } from '../services/store.js';

async function runSeed() {
  console.log('[Seed Script] Connecting to database...');
  await connectDB();
  console.log('[Seed Script] Seeding default records for REPLATE...');
  await store.seedDefaults();
  console.log('[Seed Script] Seeding finished successfully!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed Script] Fatal error:', err);
  process.exit(1);
});
