import express from 'express';
import { register, login, logout, getMe, refreshAccessToken, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, changePassword);

export default router;