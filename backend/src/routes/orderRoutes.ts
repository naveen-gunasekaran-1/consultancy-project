import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getPendingOrders,
  downloadOrderPDF,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All order routes require authentication
router.use(authMiddleware);

// GET all orders
router.get('/', getAllOrders);

// GET pending orders
router.get('/pending', getPendingOrders);

// GET order PDF
router.get('/:id/pdf', downloadOrderPDF);

// POST create new order
router.post('/', createOrder);

// GET specific order
router.get('/:id', getOrderById);

// PUT update order
router.put('/:id', updateOrder);

// DELETE order
router.delete('/:id', deleteOrder);

export default router;
