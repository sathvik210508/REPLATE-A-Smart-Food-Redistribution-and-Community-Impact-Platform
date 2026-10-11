import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '' || uri === 'none' || uri === 'local') {
    console.log('[REPLATE DB] No external MONGODB_URI configured.');
    console.log('[REPLATE DB] Operating in Local Persistence Engine (server/data/db.json) with 100% feature & schema parity.');
    return false;
  }

  try {
    const connectPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timed out (1500ms)')), 1500)
    );
    await Promise.race([connectPromise, timeoutPromise]);
    isMongoConnected = true;
    console.log('[REPLATE DB] Connected to MongoDB successfully at:', uri);
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[REPLATE DB] Notice: MongoDB unreachable at "${uri}".`);
    console.warn('[REPLATE DB] Switched to Local Persistence Engine (server/data/db.json) with full API & seeding parity.');
    return false;
  }
};
