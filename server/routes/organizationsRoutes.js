import express from 'express';
import {
  getOrganizations,
  getOrganizationById,
  updateOrganization,
} from '../controllers/organizationsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);
router.patch('/:id', authMiddleware, updateOrganization);

export default router;
