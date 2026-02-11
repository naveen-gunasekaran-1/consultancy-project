import { Router } from 'express';
import {
  getStockReport,
  getSalesReport,
  getPaymentReport,
  getClientReport,
  getDashboardStats,
} from '../controllers/reportController';

const router = Router();

/**
 * @route   GET /api/reports/stock
 * @desc    Get stock report
 * @access  Protected
 */
router.get('/stock', getStockReport);

/**
 * @route   GET /api/reports/sales
 * @desc    Get sales report
 * @access  Protected
 */
router.get('/sales', getSalesReport);

/**
 * @route   GET /api/reports/payments
 * @desc    Get payment report
 * @access  Protected
 */
router.get('/payments', getPaymentReport);

/**
 * @route   GET /api/reports/clients
 * @desc    Get client report
 * @access  Protected
 */
router.get('/clients', getClientReport);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Get dashboard statistics
 * @access  Protected
 */
router.get('/dashboard', getDashboardStats);

export default router;
