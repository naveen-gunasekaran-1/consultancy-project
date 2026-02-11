import { Router } from 'express';
import {
  getSalesTrends,
  getStockPrediction,
  getRecommendations,
} from '../controllers/aiController';

const router = Router();

/**
 * @route   GET /api/ai/sales-trends
 * @desc    Get AI analysis of sales trends
 * @access  Protected
 */
router.get('/sales-trends', getSalesTrends);

/**
 * @route   GET /api/ai/stock-prediction
 * @desc    Get AI prediction for stock requirements
 * @access  Protected
 */
router.get('/stock-prediction', getStockPrediction);

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get AI-based recommendations
 * @access  Protected
 */
router.get('/recommendations', getRecommendations);

export default router;
