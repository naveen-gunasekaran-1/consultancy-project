import { Router } from 'express';
import {
  getDashboardAnalytics,
  getSalesTrend,
  getTopProducts,
  getTopClients,
  getPaymentInsights,
  getInventoryInsights,
} from '../controllers/analyticsController';

const router = Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard summary metrics
 * @access  Protected
 */
router.get('/dashboard', getDashboardAnalytics);

/**
 * @route   GET /api/analytics/sales-trend
 * @desc    Get sales trend data (daily/monthly)
 * @access  Protected
 */
router.get('/sales-trend', getSalesTrend);

/**
 * @route   GET /api/analytics/top-products
 * @desc    Get top selling products
 * @access  Protected
 */
router.get('/top-products', getTopProducts);

/**
 * @route   GET /api/analytics/top-clients
 * @desc    Get top clients by revenue
 * @access  Protected
 */
router.get('/top-clients', getTopClients);

/**
 * @route   GET /api/analytics/payment-insights
 * @desc    Get payment status and method distribution
 * @access  Protected
 */
router.get('/payment-insights', getPaymentInsights);

/**
 * @route   GET /api/analytics/inventory-insights
 * @desc    Get inventory summary and insights
 * @access  Protected
 */
router.get('/inventory-insights', getInventoryInsights);

export default router;
