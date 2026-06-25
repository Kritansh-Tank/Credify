import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { getStores, submitRating, modifyRating } from '../controllers/user.controller.js';

const router = Router();

router.use(authenticateToken, requireRole('user'));

// GET /api/stores?search=&sortBy=&sortOrder=
router.get('/stores', getStores);

// POST /api/ratings
router.post('/ratings', [
  body('store_id').isUUID().withMessage('Valid store_id is required'),
  body('value').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], submitRating);

// PATCH /api/ratings/:storeId
router.patch('/ratings/:storeId', [
  body('value').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], modifyRating);

export default router;
