import { Router } from 'express';
import {
  getFinancialReport,
  getSalesReport,
  getWorkerPerformanceReport,
  getWorkerSalesReport,
  getDashboardStats,
  downloadFinancialReportPDF,
  downloadWorkerPerformancePDF,
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
 * @route   GET /api/reports/financial/pdf
 * @desc    Download financial report as PDF
 * @access  Protected
 */
router.get('/financial/pdf', downloadFinancialReportPDF);

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

/**
 * @route   GET /api/reports/worker-performance/pdf
 * @desc    Download worker performance report as PDF
 * @access  Protected
 */
router.get('/worker-performance/pdf', downloadWorkerPerformancePDF);

/**
 * @route   GET /api/reports/worker/:workerId/sales
 * @desc    Get individual worker sales report
 * @access  Protected
 */
router.get('/worker/:workerId/sales', getWorkerSalesReport);

export default router;
