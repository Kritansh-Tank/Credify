import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { getOwnerDashboard } from '../controllers/owner.controller.js';

const router = Router();

router.use(authenticateToken, requireRole('owner'));

// GET /api/owner/dashboard
router.get('/dashboard', getOwnerDashboard);

export default router;
