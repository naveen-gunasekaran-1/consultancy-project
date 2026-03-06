import { Router } from 'express';
import { login, verifyToken, logout, getProfile, updateProfile } from '../controllers/authController';
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

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Protected
 */
router.put('/profile', authMiddleware, updateProfile);

export default router;
