import { Router } from 'express';
import {
  createStaffMember,
  getStaffList,
  updateStaffStatus,
  getAuditLogs,
} from '../controllers/admin.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Centralized Admin Security Barrier: Every admin endpoint strictly requires ADMIN role
router.use(authenticateUser);
router.use(requireRole('ADMIN'));

router.post('/staff', createStaffMember);
router.get('/staff', getStaffList);
router.patch('/staff/:id/status', updateStaffStatus);
router.get('/audit-logs', getAuditLogs);

export default router;
