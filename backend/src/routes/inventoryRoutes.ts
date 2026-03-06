import express from 'express';
import {
  getAllInventory,
  getInventoryById,
  getInventoryByGuideId,
  createInventory,
  updateInventory,
  adjustStock,
  getLowStockItems,
  deleteInventory,
} from '../controllers/inventoryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllInventory);
router.get('/low-stock', getLowStockItems);
router.get('/:id', getInventoryById);
router.get('/guide/:guideId', getInventoryByGuideId);
router.post('/', createInventory);
router.put('/:id', updateInventory);
router.post('/:id/adjust', adjustStock);
router.delete('/:id', deleteInventory);

export default router;
