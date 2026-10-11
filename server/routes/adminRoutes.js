import express from 'express';
import {
  getAllUsers,
  toggleUserStatus,
  setOrganizationVerification,
  getAllAuditLogs,
  resetAndSeedData,
} from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/organizations/:id/verify', setOrganizationVerification);
router.get('/audit-logs', getAllAuditLogs);
router.post('/seed-data', resetAndSeedData);

export default router;
