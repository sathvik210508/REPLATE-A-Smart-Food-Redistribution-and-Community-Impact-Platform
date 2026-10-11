import express from 'express';
import { isMongoConnected } from '../config/db.js';
import { store } from '../services/store.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    platform: 'REPLATE Food Redistribution Platform',
    team: 'Team NovaNex',
    institution: 'CBIT Hyderabad',
    hackathon: 'IETE IDEATHON 2026',
    sdgGoal: 'SDG 2 — Zero Hunger',
    database: {
      type: isMongoConnected ? 'MongoDB Active Cluster' : 'Local File Persistence Engine (server/data/db.json)',
      isMongoConnected,
      uriConfigured: Boolean(process.env.MONGODB_URI),
    },
    counts: {
      users: store.getUsers().length,
      organizations: store.getOrganizations().length,
      donations: store.getDonations().length,
      requests: store.getRequests().length,
      events: store.getEvents().length,
      notifications: store.getNotifications().length,
    },
  });
});

router.post('/seed', async (req, res) => {
  try {
    await store.seedDefaults();
    res.json({
      success: true,
      message: 'REPLATE demonstration database refreshed successfully with authentic CBIT / Hyderabad records.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to re-seed database.', error: err.message });
  }
});

export default router;
