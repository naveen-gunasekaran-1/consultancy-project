import { Router } from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from '../controllers/invoiceController';

const router = Router();

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices
 * @access  Protected
 */
router.get('/', getAllInvoices);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get invoice by ID
 * @access  Protected
 */
router.get('/:id', getInvoiceById);

/**
 * @route   POST /api/invoices
 * @desc    Create new invoice
 * @access  Protected
 */
router.post('/', createInvoice);

/**
 * @route   PUT /api/invoices/:id/status
 * @desc    Update invoice status
 * @access  Protected
 */
router.put('/:id/status', updateInvoiceStatus);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete invoice
 * @access  Protected
 */
router.delete('/:id', deleteInvoice);

export default router;
