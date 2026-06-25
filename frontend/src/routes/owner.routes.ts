import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { getOwnerDashboard } from '../controllers/owner.controller';

const router = Router();

router.use(authenticateToken, requireRole('owner'));

// GET /api/owner/dashboard
router.get('/dashboard', getOwnerDashboard);

export default router;
