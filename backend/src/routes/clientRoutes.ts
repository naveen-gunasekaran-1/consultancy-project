import { Router } from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';

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
 * @access  Protected
 */
router.post('/', createClient);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  Protected
 */
router.put('/:id', updateClient);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client
 * @access  Protected
 */
router.delete('/:id', deleteClient);

export default router;
