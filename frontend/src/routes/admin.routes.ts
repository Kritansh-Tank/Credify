import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getDashboard,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
} from '../controllers/admin.controller';

const router = Router();

// Apply auth + admin role to all admin routes
router.use(authenticateToken, requireRole('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', getDashboard);

// GET /api/admin/users
router.get('/users', getUsers);

// GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// POST /api/admin/users
router.post('/users', [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20–60 characters'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('address').isLength({ max: 400 }).withMessage('Address must be at most 400 characters'),
  body('password')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be 8–16 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
  body('role').isIn(['admin', 'user', 'owner']).withMessage('Role must be admin, user, or owner'),
  body('store_id').optional().isUUID().withMessage('store_id must be a valid UUID'),
], createUser);

// GET /api/admin/stores
router.get('/stores', getStores);

// POST /api/admin/stores
router.post('/stores', [
  body('name').isLength({ min: 1, max: 60 }).withMessage('Store name is required (max 60 chars)'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('address').isLength({ max: 400 }).withMessage('Address must be at most 400 characters'),
], createStore);

export default router;
