import { Request, Response } from 'express';
import workerRepository from '../repositories/workerRepository';
import { logger } from '../utils/logger';

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string): boolean => /^[0-9+\-()\s]{7,20}$/.test(phone);
const VALID_ROLES = ['sales', 'manager', 'admin', 'support'];

const parseId = (id: string): number | null => {
  const value = parseInt(id, 10);
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }
  return value;
};

const mapWorker = (worker: any) => ({
  ...worker,
  _id: String(worker.id),
  isActive: Boolean(worker.isActive),
});

export const getAllWorkers = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  const workers = workerRepository.findAll().map(mapWorker);

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
};

export const getWorkerById = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;

  const workerId = parseId(id);
  if (!workerId) {
    res.status(400).json({ success: false, message: 'Invalid worker ID format' });
    return;
  }

  const worker = workerRepository.findById(workerId);

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
    data: mapWorker(worker),
  });
};

export const createWorker = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  const { name, email, phone, address, role, commissionRate } = req.body;

  // Email is now optional
  if (!name || !phone || !address || !role) {
    logger.warn('createWorker', {
      requestId,
      message: 'Missing required fields',
      providedFields: { name, email, phone, address, role },
    });
    res.status(400).json({
      success: false,
      message: 'name, phone, address, and role are required',
    });
    return;
  }

  // Only validate email format if provided
  if (email && !isValidEmail(email)) {
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
      message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
    });
    return;
  }

  // Only check email uniqueness if email is provided
  if (email) {
    const existingWorker = workerRepository.findByEmail(String(email).toLowerCase().trim());
    if (existingWorker) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }
  }

  let commRate = 0;
  if (commissionRate !== undefined) {
    commRate = Number(commissionRate);
    if (Number.isNaN(commRate) || commRate < 0 || commRate > 100) {
      res.status(400).json({
        success: false,
        message: 'Commission rate must be between 0 and 100',
      });
      return;
    }
  }

  const worker = workerRepository.create({
    name: String(name).trim(),
    email: email ? String(email).toLowerCase().trim() : '',
    phone: String(phone).trim(),
    address: String(address).trim(),
    role: String(role),
    commissionRate: commRate,
    totalEarnings: 0,
    performanceScore: 0,
  });

  const duration = Date.now() - startTime;
  logger.info('createWorker', {
    requestId,
    workerId: worker.id,
    name: worker.name,
    role: worker.role,
    email: worker.email,
    duration,
  });

  res.status(201).json({
    success: true,
    message: 'Worker created successfully',
    data: mapWorker(worker),
  });
};

export const updateWorker = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;

  const workerId = parseId(id);
  if (!workerId) {
    res.status(400).json({ success: false, message: 'Invalid worker ID format' });
    return;
  }

  const current = workerRepository.findById(workerId);
  if (!current) {
    logger.warn('updateWorker', {
      requestId,
      workerId: id,
      message: 'Worker not found',
    });
    res.status(404).json({ success: false, message: 'Worker not found' });
    return;
  }

  const updateData: Record<string, any> = {};

  if (req.body.name !== undefined) {
    updateData.name = String(req.body.name).trim();
    if (!updateData.name) {
      res.status(400).json({ success: false, message: 'Name cannot be empty' });
      return;
    }
  }

  if (req.body.email !== undefined) {
    updateData.email = String(req.body.email).toLowerCase().trim();
    // Only validate email format if provided and not empty
    if (updateData.email && !isValidEmail(updateData.email)) {
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }
    // Only check email uniqueness if email is provided and not empty
    if (updateData.email) {
      const existingWorker = workerRepository.findByEmail(updateData.email);
      if (existingWorker && existingWorker.id !== workerId) {
        res.status(400).json({ success: false, message: 'Email already registered' });
        return;
      }
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
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
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
        message: 'Commission rate must be between 0 and 100',
      });
      return;
    }
  }

  if (req.body.performanceScore !== undefined) {
    updateData.performanceScore = Number(req.body.performanceScore);
    if (Number.isNaN(updateData.performanceScore) || updateData.performanceScore < 0 || updateData.performanceScore > 100) {
      res.status(400).json({
        success: false,
        message: 'Performance score must be between 0 and 100',
      });
      return;
    }
  }

  if (req.body.isActive !== undefined) {
    updateData.isActive = req.body.isActive ? 1 : 0;
  }

  const worker = workerRepository.update(workerId, updateData);

  if (!worker) {
    logger.warn('updateWorker', {
      requestId,
      workerId: id,
      message: 'Worker not found after update',
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
    data: mapWorker(worker),
  });
};

export const updateWorkerEarnings = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;
  const { commissionAmount } = req.body;

  const workerId = parseId(id);
  if (!workerId) {
    res.status(400).json({ success: false, message: 'Invalid worker ID format' });
    return;
  }

  const amount = Number(commissionAmount);
  if (Number.isNaN(amount) || amount < 0) {
    res.status(400).json({ success: false, message: 'Commission amount must be a positive number' });
    return;
  }

  const worker = workerRepository.addEarnings(workerId, amount);
  if (!worker) {
    logger.warn('updateWorkerEarnings', {
      requestId,
      workerId: id,
      message: 'Worker not found',
    });
    res.status(404).json({ success: false, message: 'Worker not found' });
    return;
  }

  const duration = Date.now() - startTime;
  logger.info('updateWorkerEarnings', {
    requestId,
    workerId: id,
    commissionAmount: amount,
    newTotalEarnings: worker.totalEarnings,
    duration,
  });

  res.status(200).json({
    success: true,
    message: 'Worker earnings updated',
    data: mapWorker(worker),
  });
};

export const deleteWorker = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;

  const workerId = parseId(id);
  if (!workerId) {
    res.status(400).json({ success: false, message: 'Invalid worker ID format' });
    return;
  }

  const worker = workerRepository.findById(workerId);
  if (!worker) {
    logger.warn('deleteWorker', {
      requestId,
      workerId: id,
      message: 'Worker not found',
    });
    res.status(404).json({ success: false, message: 'Worker not found' });
    return;
  }

  workerRepository.delete(workerId);

  const duration = Date.now() - startTime;
  logger.info('deleteWorker', {
    requestId,
    workerId: id,
    duration,
  });

  res.status(200).json({
    success: true,
    message: 'Worker deactivated successfully',
    data: mapWorker({ ...worker, isActive: 0 }),
  });
};
