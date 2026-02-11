import { Router } from 'express';
import {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
  searchGuides,
} from '../controllers/guideController';

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
 * @access  Protected
 */
router.post('/', createGuide);

/**
 * @route   PUT /api/guides/:id
 * @desc    Update guide
 * @access  Protected
 */
router.put('/:id', updateGuide);

/**
 * @route   DELETE /api/guides/:id
 * @desc    Delete guide
 * @access  Protected
 */
router.delete('/:id', deleteGuide);

export default router;
