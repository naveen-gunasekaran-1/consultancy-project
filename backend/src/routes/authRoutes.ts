import { Router } from 'express';
import { login, verifyToken, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Protected
 */
router.get('/verify', authMiddleware, verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate current session token
 * @access  Protected
 */
router.post('/logout', authMiddleware, logout);

export default router;
