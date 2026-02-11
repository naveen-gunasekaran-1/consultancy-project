import { Router } from 'express';
import {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
} from '../controllers/workerController';

const router = Router();

/**
 * @route   GET /api/workers
 * @desc    Get all workers
 * @access  Protected
 */
router.get('/', getAllWorkers);

/**
 * @route   GET /api/workers/:id
 * @desc    Get worker by ID
 * @access  Protected
 */
router.get('/:id', getWorkerById);

/**
 * @route   POST /api/workers
 * @desc    Create new worker
 * @access  Protected (Admin only)
 */
router.post('/', createWorker);

/**
 * @route   PUT /api/workers/:id
 * @desc    Update worker
 * @access  Protected (Admin only)
 */
router.put('/:id', updateWorker);

/**
 * @route   DELETE /api/workers/:id
 * @desc    Delete/Deactivate worker
 * @access  Protected (Admin only)
 */
router.delete('/:id', deleteWorker);

export default router;
