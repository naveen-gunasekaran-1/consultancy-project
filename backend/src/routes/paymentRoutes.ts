import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentMethod,
  deletePayment,
  getPaymentsByInvoice,
} from '../controllers/paymentController';

const router = Router();

/**
 * @route   GET /api/payments
 * @desc    Get all payments
 * @access  Protected
 */
router.get('/', getAllPayments);

/**
 * @route   GET /api/payments/invoice/:invoiceId
 * @desc    Get payments by invoice ID
 * @access  Protected
 */
router.get('/invoice/:invoiceId', getPaymentsByInvoice);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Protected
 */
router.get('/:id', getPaymentById);

/**
 * @route   POST /api/payments
 * @desc    Create new payment record
 * @access  Protected
 */
router.post('/', createPayment);

/**
 * @route   PUT /api/payments/:id
 * @desc    Update payment method
 * @access  Protected
 */
router.put('/:id', updatePaymentMethod);

/**
 * @route   DELETE /api/payments/:id
 * @desc    Delete payment record
 * @access  Protected
 */
router.delete('/:id', deletePayment);

export default router;
