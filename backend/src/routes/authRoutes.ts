import { Router } from 'express';
import { login, register, verifyToken } from '../controllers/authController';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public (TODO: Should be protected for admin only)
 */
router.post('/register', register);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Protected
 */
router.get('/verify', verifyToken);

export default router;
