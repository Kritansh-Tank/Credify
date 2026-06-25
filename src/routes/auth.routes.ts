import { Router } from 'express';
import { body } from 'express-validator';
import { login, signup, changePassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const passwordRules = body('password')
  .isLength({ min: 8, max: 16 }).withMessage('Password must be 8–16 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character');

const nameRules = body('name')
  .isLength({ min: 20, max: 60 }).withMessage('Name must be 20–60 characters');

const emailRules = body('email')
  .isEmail().withMessage('Must be a valid email address');

const addressRules = body('address')
  .isLength({ max: 400 }).withMessage('Address must be at most 400 characters');

// POST /api/auth/login
router.post('/login', [
  emailRules,
  body('password').notEmpty().withMessage('Password is required'),
], login);

// POST /api/auth/signup
router.post('/signup', [
  nameRules,
  emailRules,
  addressRules,
  passwordRules,
], signup);

// PATCH /api/auth/password
router.patch('/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRules.withMessage('New password must be 8–16 chars, 1 uppercase, 1 special character')
    .optional(false),
  body('newPassword')
    .isLength({ min: 8, max: 16 }).withMessage('New password must be 8–16 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[^A-Za-z0-9]/).withMessage('New password must contain at least one special character'),
], changePassword);

export default router;
