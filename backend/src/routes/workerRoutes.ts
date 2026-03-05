import { Router } from 'express';
import {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  updateWorkerEarnings,
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
 * @access  Protected
 */
router.post('/', createWorker);

/**
 * @route   PUT /api/workers/:id
 * @desc    Update worker details
 * @access  Protected
 */
router.put('/:id', updateWorker);

/**
 * @route   PUT /api/workers/:id/earnings
 * @desc    Update worker earnings with commission
 * @access  Protected
 */
router.put('/:id/earnings', updateWorkerEarnings);

/**
 * @route   DELETE /api/workers/:id
 * @desc    Delete/Deactivate worker
 * @access  Protected
 */
router.delete('/:id', deleteWorker);

export default router;
