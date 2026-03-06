import { Request, Response } from 'express';
import inventoryRepository from '../repositories/inventoryRepository';
import guideRepository from '../repositories/guideRepository';
import { logger } from '../utils/logger';

// Helper to parse ID
const parseId = (id: string): number | null => {
  const parsed = parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

// Get all inventory items
export const getAllInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('inventory.get_all', { requestId: req.requestId });
    const inventory = inventoryRepository.findAll();
    logger.info('inventory.get_all.success', { requestId: req.requestId, count: inventory.length });
    res.status(200).json({ success: true, data: inventory });
  } catch (error: any) {
    logger.error('inventory.get_all.error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get inventory by ID
export const getInventoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inventoryId = parseId(id);
    
    if (!inventoryId) {
      res.status(400).json({ success: false, message: 'Invalid inventory ID' });
      return;
    }

    logger.info('inventory.get_by_id', { requestId: req.requestId, inventoryId });
    const inventory = inventoryRepository.findById(inventoryId);

    if (!inventory) {
      logger.warn('inventory.not_found', { requestId: req.requestId, inventoryId });
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }

    logger.info('inventory.get_by_id.success', { requestId: req.requestId, inventoryId });
    res.status(200).json({ success: true, data: inventory });
  } catch (error: any) {
    logger.error('inventory.get_by_id.error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get inventory by guide ID
export const getInventoryByGuideId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guideId } = req.params;
    const parsedGuideId = parseId(guideId);
    
    if (!parsedGuideId) {
      res.status(400).json({ success: false, message: 'Invalid guide ID' });
      return;
    }

    logger.info('inventory.get_by_guide', { requestId: req.requestId, guideId: parsedGuideId });
    const inventory = inventoryRepository.findByGuideId(parsedGuideId);

    if (!inventory) {
      logger.warn('inventory.guide_not_found', { requestId: req.requestId, guideId: parsedGuideId });
      res.status(404).json({ success: false, message: 'Inventory for this guide not found' });
      return;
    }

    logger.info('inventory.get_by_guide.success', { requestId: req.requestId, guideId: parsedGuideId });
    res.status(200).json({ success: true, data: inventory });
  } catch (error: any) {
    logger.error('inventory.get_by_guide.error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create inventory item
export const createInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guideId, warehouseLocation, stockQuantity, reorderLevel, reorderQuantity, status, notes } = req.body;

    if (!guideId || stockQuantity === undefined || reorderLevel === undefined || reorderQuantity === undefined) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    // Check if guide exists
    const guide = guideRepository.findById(guideId);
    if (!guide) {
      res.status(404).json({ success: false, message: 'Guide not found' });
      return;
    }

    // Check if inventory already exists for this guide
    const existingInventory = inventoryRepository.findByGuideId(guideId);
    if (existingInventory) {
      res.status(400).json({ success: false, message: 'Inventory already exists for this guide' });
      return;
    }

    logger.info('inventory.create', { requestId: req.requestId, guideId });
    const inventory = inventoryRepository.create({
      guideId,
      warehouseLocation,
      stockQuantity,
      reorderLevel,
      reorderQuantity,
      status: status || 'in-stock',
      notes,
    });

    logger.info('inventory.create.success', { requestId: req.requestId, inventoryId: inventory.id });
    res.status(201).json({ success: true, data: inventory });
  } catch (error: any) {
    logger.error('inventory.create.error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update inventory item
export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inventoryId = parseId(id);
    
    if (!inventoryId) {
      res.status(400).json({ success: false, message: 'Invalid inventory ID' });
      return;
    }

    const inventory = inventoryRepository.findById(inventoryId);
    if (!inventory) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }

    const { warehouseLocation, stockQuantity, reorderLevel, reorderQuantity, status, notes } = req.body;

    logger.info('inventory.update', { requestId: req.requestId, inventoryId });
    const updatedInventory = inventoryRepository.update(inventoryId, {
      warehouseLocation,
      stockQuantity,
      reorderLevel,
      reorderQuantity,
      status,
      notes,
    });

    logger.info('inventory.update.success', { requestId: req.requestId, inventoryId });
    res.status(200).json({ success: true, data: updatedInventory });
  } catch (error: any) {
    logger.error('inventory.update.error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Adjust stock (add or remove)
export const adjustStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inventoryId = parseId(id);
    
    if (!inventoryId) {
      res.status(400).json({ success: false, message: 'Invalid inventory ID' });
      return;
    }

    const { adjustment, reason } = req.body;

    if (adjustment === undefined || typeof adjustment !== 'number') {
      res.status(400).json({ success: false, message: 'Invalid adjustment value' });
      return;
    }

    const inventory = inventoryRepository.findById(inventoryId);
    if (!inventory) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }

    logger.info('inventory.adjust_stock', { requestId: req.requestId, inventoryId, adjustment });
    
    try {
      const updatedInventory = inventoryRepository.adjustStock(inventoryId, adjustment, reason);
      logger.info('inventory.adjust_stock.success', { requestId: req.requestId, inventoryId, adjustment });
      res.status(200).json({ 
        success: true, 
        data: updatedInventory, 
        message: `Stock adjusted by ${adjustment}` 
      });
    } catch (adjustError: any) {
      res.status(400).json({ success: false, message: adjustError.message });
    }
  } catch (error: any) {
    logger.error('inventory.adjust_stock.error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get low stock items
export const getLowStockItems = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('inventory.get_low_stock', { requestId: req.requestId });
    const inventory = inventoryRepository.findLowStock();
    logger.info('inventory.get_low_stock.success', { requestId: req.requestId, count: inventory.length });
    res.status(200).json({ success: true, data: inventory });
  } catch (error: any) {
    logger.error('inventory.get_low_stock.error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete inventory item
export const deleteInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inventoryId = parseId(id);
    
    if (!inventoryId) {
      res.status(400).json({ success: false, message: 'Invalid inventory ID' });
      return;
    }

    const inventory = inventoryRepository.findById(inventoryId);
    if (!inventory) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }

    logger.info('inventory.delete', { requestId: req.requestId, inventoryId });
    inventoryRepository.delete(inventoryId);
    logger.info('inventory.delete.success', { requestId: req.requestId, inventoryId });
    res.status(200).json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    logger.error('inventory.delete.error', { requestId: req.requestId, error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};
