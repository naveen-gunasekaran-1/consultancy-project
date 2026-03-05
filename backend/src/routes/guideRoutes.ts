import { Router } from 'express';
import {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
  searchGuides,
} from '../controllers/guideController';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   GET /api/guides
 * @desc    Get all guides
 * @access  Protected
 */
router.get('/', getAllGuides);

/**
 * @route   GET /api/guides/search
 * @desc    Search guides
 * @access  Protected
 */
router.get('/search', searchGuides);

/**
 * @route   GET /api/guides/:id
 * @desc    Get guide by ID
 * @access  Protected
 */
router.get('/:id', getGuideById);

/**
 * @route   POST /api/guides
 * @desc    Create new guide
 * @access  Protected (Admin only)
 */
router.post('/', adminMiddleware, createGuide);

/**
 * @route   PUT /api/guides/:id
 * @desc    Update guide
 * @access  Protected (Admin only)
 */
router.put('/:id', adminMiddleware, updateGuide);

/**
 * @route   DELETE /api/guides/:id
 * @desc    Delete guide
 * @access  Protected (Admin only)
 */
router.delete('/:id', adminMiddleware, deleteGuide);

export default router;
