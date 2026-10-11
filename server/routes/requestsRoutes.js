import express from 'express';
import {
  createRequest,
  getMyRequests,
  updateRequestStatus,
} from '../controllers/requestsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', authMiddleware, getMyRequests);
router.post('/donation/:id', authMiddleware, requireRole(['ngo', 'admin']), createRequest);
router.patch('/:id/status', authMiddleware, updateRequestStatus);

export default router;
