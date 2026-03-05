import { Router } from 'express';
import {
  getFinancialReport,
  getSalesReport,
  getWorkerPerformanceReport,
  getDashboardStats,
} from '../controllers/reportController';

const router = Router();

/**
 * @route   GET /api/reports/dashboard
 * @desc    Get comprehensive dashboard statistics
 * @access  Protected
 */
router.get('/dashboard', getDashboardStats);

/**
 * @route   GET /api/reports/financial
 * @desc    Get financial report with revenue and payment data
 * @access  Protected
 */
router.get('/financial', getFinancialReport);

/**
 * @route   GET /api/reports/sales
 * @desc    Get sales report with top items and clients
 * @access  Protected
 */
router.get('/sales', getSalesReport);

/**
 * @route   GET /api/reports/worker-performance
 * @desc    Get worker performance report
 * @access  Protected
 */
router.get('/worker-performance', getWorkerPerformanceReport);

export default router;
