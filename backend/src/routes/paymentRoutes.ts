import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
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
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Protected
 */
router.get('/:id', getPaymentById);

/**
 * @route   GET /api/payments/invoice/:invoiceId
 * @desc    Get payments by invoice ID
 * @access  Protected
 */
router.get('/invoice/:invoiceId', getPaymentsByInvoice);

/**
 * @route   POST /api/payments
 * @desc    Create new payment record
 * @access  Protected
 */
router.post('/', createPayment);

/**
 * @route   PUT /api/payments/:id/status
 * @desc    Update payment status
 * @access  Protected
 */
router.put('/:id/status', updatePaymentStatus);

export default router;
