import { Request, Response } from 'express';
import Worker from '../models/Worker';
import { logger } from '../utils/logger';

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string): boolean => /^[0-9+\-()\s]{7,20}$/.test(phone);
const VALID_ROLES = ['sales', 'manager', 'admin', 'support'];

export const getAllWorkers = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  try {
    const workers = await Worker.find({ isActive: true }).sort({ createdAt: -1 });
    
    const duration = Date.now() - startTime;
    logger.info('getAllWorkers', {
      requestId,
      count: workers.length,
      duration,
    });
    
    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    logger.error('getAllWorkers', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error fetching workers' });
  }
};

export const getWorkerById = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid worker ID format' });
      return;
    }
    
    const worker = await Worker.findById(id);
    
    if (!worker) {
      logger.warn('getWorkerById', {
        requestId,
        workerId: id,
        message: 'Worker not found',
      });
      res.status(404).json({ success: false, message: 'Worker not found' });
      return;
    }
    
    const duration = Date.now() - startTime;
    logger.info('getWorkerById', {
      requestId,
      workerId: id,
      duration,
    });
    
    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    logger.error('getWorkerById', {
      requestId,
      workerId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error fetching worker' });
  }
};

export const createWorker = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  try {
    const { name, email, phone, address, role, commissionRate } = req.body;

    // Validation
    if (!name || !email || !phone || !address || !role) {
      logger.warn('createWorker', {
        requestId,
        message: 'Missing required fields',
        providedFields: { name, email, phone, address, role },
      });
      res.status(400).json({ 
        success: false, 
        message: 'name, email, phone, address, and role are required' 
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }

    if (!isValidPhone(phone)) {
      res.status(400).json({ success: false, message: 'Invalid phone format' });
      return;
    }

    if (!VALID_ROLES.includes(role)) {
      res.status(400).json({ 
        success: false, 
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` 
      });
      return;
    }

    // Check email uniqueness
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    let commRate = 0;
    if (commissionRate) {
      commRate = Number(commissionRate);
      if (Number.isNaN(commRate) || commRate < 0 || commRate > 100) {
        res.status(400).json({ 
          success: false, 
          message: 'Commission rate must be between 0 and 100' 
        });
        return;
      }
    }

    const worker = await Worker.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      role,
      commissionRate: commRate,
      totalEarnings: 0,
      performanceScore: 0,
      isActive: true,
    });
    
    const duration = Date.now() - startTime;
    logger.info('createWorker', {
      requestId,
      workerId: worker._id,
      name: worker.name,
      role: worker.role,
      email: worker.email,
      duration,
    });
    
    res.status(201).json({
      success: true,
      message: 'Worker created successfully',
      data: worker,
    });
  } catch (error) {
    logger.error('createWorker', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error creating worker' });
  }
};

export const updateWorker = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid worker ID format' });
      return;
    }

    const updateData: Record<string, any> = {};

    // Update fields with validation
    if (req.body.name !== undefined) {
      updateData.name = String(req.body.name).trim();
      if (!updateData.name) {
        res.status(400).json({ success: false, message: 'Name cannot be empty' });
        return;
      }
    }

    if (req.body.email !== undefined) {
      updateData.email = String(req.body.email).toLowerCase().trim();
      if (!isValidEmail(updateData.email)) {
        res.status(400).json({ success: false, message: 'Invalid email format' });
        return;
      }
      // Check uniqueness
      const existingWorker = await Worker.findOne({ email: updateData.email, _id: { $ne: id } });
      if (existingWorker) {
        res.status(400).json({ success: false, message: 'Email already registered' });
        return;
      }
    }

    if (req.body.phone !== undefined) {
      updateData.phone = String(req.body.phone).trim();
      if (!isValidPhone(updateData.phone)) {
        res.status(400).json({ success: false, message: 'Invalid phone format' });
        return;
      }
    }

    if (req.body.address !== undefined) {
      updateData.address = String(req.body.address).trim();
      if (!updateData.address) {
        res.status(400).json({ success: false, message: 'Address cannot be empty' });
        return;
      }
    }

    if (req.body.role !== undefined) {
      if (!VALID_ROLES.includes(req.body.role)) {
        res.status(400).json({ 
          success: false, 
          message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` 
        });
        return;
      }
      updateData.role = req.body.role;
    }

    if (req.body.commissionRate !== undefined) {
      updateData.commissionRate = Number(req.body.commissionRate);
      if (Number.isNaN(updateData.commissionRate) || updateData.commissionRate < 0 || updateData.commissionRate > 100) {
        res.status(400).json({ 
          success: false, 
          message: 'Commission rate must be between 0 and 100' 
        });
        return;
      }
    }

    if (req.body.performanceScore !== undefined) {
      updateData.performanceScore = Number(req.body.performanceScore);
      if (Number.isNaN(updateData.performanceScore) || updateData.performanceScore < 0 || updateData.performanceScore > 100) {
        res.status(400).json({ 
          success: false, 
          message: 'Performance score must be between 0 and 100' 
        });
        return;
      }
    }

    if (req.body.isActive !== undefined) {
      updateData.isActive = Boolean(req.body.isActive);
    }
    
    const worker = await Worker.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!worker) {
      logger.warn('updateWorker', {
        requestId,
        workerId: id,
        message: 'Worker not found',
      });
      res.status(404).json({ success: false, message: 'Worker not found' });
      return;
    }
    
    const duration = Date.now() - startTime;
    logger.info('updateWorker', {
      requestId,
      workerId: id,
      updates: Object.keys(updateData),
      duration,
    });
    
    res.status(200).json({
      success: true,
      message: 'Worker updated successfully',
      data: worker,
    });
  } catch (error) {
    logger.error('updateWorker', {
      requestId,
      workerId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error updating worker' });
  }
};

export const updateWorkerEarnings = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;
  const { commissionAmount } = req.body;

  try {
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid worker ID format' });
      return;
    }

    if (typeof commissionAmount !== 'number' || commissionAmount < 0) {
      res.status(400).json({ success: false, message: 'Commission amount must be a positive number' });
      return;
    }

    const worker = await Worker.findById(id);
    if (!worker) {
      logger.warn('updateWorkerEarnings', {
        requestId,
        workerId: id,
        message: 'Worker not found',
      });
      res.status(404).json({ success: false, message: 'Worker not found' });
      return;
    }

    worker.totalEarnings = (worker.totalEarnings || 0) + commissionAmount;
    await worker.save();

    const duration = Date.now() - startTime;
    logger.info('updateWorkerEarnings', {
      requestId,
      workerId: id,
      commissionAmount,
      newTotalEarnings: worker.totalEarnings,
      duration,
    });
    
    res.status(200).json({
      success: true,
      message: 'Worker earnings updated',
      data: worker,
    });
  } catch (error) {
    logger.error('updateWorkerEarnings', {
      requestId,
      workerId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error updating worker earnings' });
  }
};

export const deleteWorker = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid worker ID format' });
      return;
    }
    
    // Soft delete - mark as inactive
    const worker = await Worker.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!worker) {
      logger.warn('deleteWorker', {
        requestId,
        workerId: id,
        message: 'Worker not found',
      });
      res.status(404).json({ success: false, message: 'Worker not found' });
      return;
    }
    
    const duration = Date.now() - startTime;
    logger.info('deleteWorker', {
      requestId,
      workerId: id,
      duration,
    });
    
    res.status(200).json({
      success: true,
      message: 'Worker deactivated successfully',
      data: worker,
    });
  } catch (error) {
    logger.error('deleteWorker', {
      requestId,
      workerId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error deleting worker' });
  }
};
