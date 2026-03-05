import { Router } from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   GET /api/clients
 * @desc    Get all clients
 * @access  Protected
 */
router.get('/', getAllClients);

/**
 * @route   GET /api/clients/:id
 * @desc    Get client by ID
 * @access  Protected
 */
router.get('/:id', getClientById);

/**
 * @route   POST /api/clients
 * @desc    Create new client
 * @access  Protected (Admin only)
 */
router.post('/', adminMiddleware, createClient);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  Protected (Admin only)
 */
router.put('/:id', adminMiddleware, updateClient);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client
 * @access  Protected (Admin only)
 */
router.delete('/:id', adminMiddleware, deleteClient);

export default router;
