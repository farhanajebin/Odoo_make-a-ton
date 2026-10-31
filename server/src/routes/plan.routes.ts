import { Router } from 'express';
import {
  activatePlan,
  archivePlan,
  createPlan,
  getPlanById,
  getPlanHistory,
  getPlanPricing,
  listPlans,
  pausePlan,
  pricePreview,
  resumePlan,
  updatePlan,
} from '../controllers/plan.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

router.get('/', requireRole('ADMIN', 'STAFF'), listPlans);
router.post('/', requireRole('ADMIN', 'STAFF'), createPlan);
router.post('/price-preview', requireRole('ADMIN', 'STAFF'), pricePreview);
router.get('/:id/pricing', requireRole('ADMIN', 'STAFF'), getPlanPricing);
router.get('/:id/history', requireRole('ADMIN', 'STAFF'), getPlanHistory);
router.get('/:id', requireRole('ADMIN', 'STAFF'), getPlanById);
router.patch('/:id', requireRole('ADMIN', 'STAFF'), updatePlan);
router.patch('/:id/activate', requireRole('ADMIN', 'STAFF'), activatePlan);
router.patch('/:id/pause', requireRole('ADMIN', 'STAFF'), pausePlan);
router.patch('/:id/resume', requireRole('ADMIN', 'STAFF'), resumePlan);
router.patch('/:id/archive', requireRole('ADMIN', 'STAFF'), archivePlan);

export default router;
