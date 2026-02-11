import { Request, Response } from 'express';
import Worker from '../models/Worker';

export const getAllWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workers', error });
  }
};

export const getWorkerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const worker = await Worker.findById(id);
    
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker', error });
  }
};

export const createWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, role, phone, salary, joinDate } = req.body;
    
    const worker = await Worker.create({
      name,
      role,
      phone,
      salary,
      joinDate: joinDate || new Date(),
      isActive: true,
    });
    
    res.status(201).json({
      success: true,
      message: 'Worker added successfully',
      data: worker,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating worker', error });
  }
};

export const updateWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const worker = await Worker.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Worker updated successfully',
      data: worker,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating worker', error });
  }
};

export const deleteWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Soft delete - mark as inactive
    const worker = await Worker.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Worker deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting worker', error });
  }
};
