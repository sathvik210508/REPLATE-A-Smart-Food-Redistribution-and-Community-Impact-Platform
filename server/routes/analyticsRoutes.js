import express from 'express';
import {
  getImpactAnalytics,
  getDonorAnalytics,
  getNgoAnalytics,
  getAdminAnalytics,
} from '../controllers/analyticsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/impact', getImpactAnalytics);
router.get('/donor', authMiddleware, requireRole(['donor', 'admin']), getDonorAnalytics);
router.get('/ngo', authMiddleware, requireRole(['ngo', 'admin']), getNgoAnalytics);
router.get('/admin', authMiddleware, requireRole(['admin']), getAdminAnalytics);

export default router;
