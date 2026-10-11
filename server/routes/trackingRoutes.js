import express from 'express';
import { getEventsByDonation, addTrackingEvent } from '../controllers/trackingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id/events', getEventsByDonation);
router.post('/:id/events', authMiddleware, addTrackingEvent);

export default router;
