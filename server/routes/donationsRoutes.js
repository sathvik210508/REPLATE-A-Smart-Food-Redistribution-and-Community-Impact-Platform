import express from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
  getRecommendedMatches,
} from '../controllers/donationsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDonations);
router.get('/matches/recommended', authMiddleware, getRecommendedMatches);
router.get('/:id', getDonationById);
router.post('/', authMiddleware, requireRole(['donor', 'admin']), createDonation);
router.patch('/:id/status', authMiddleware, updateDonationStatus);

export default router;
