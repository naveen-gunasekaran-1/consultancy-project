import { Request, Response } from 'express';
import Worker from '../models/Worker';

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);
const isValidPhone = (phone: string): boolean => /^[0-9+\-()\s]{7,20}$/.test(phone);

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

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid worker ID format' });
      return;
    }
    
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
    const name = String(req.body.name || '').trim();
    const role = String(req.body.role || '').trim();
    const phone = String(req.body.phone || '').trim();
    const salary = Number(req.body.salary);
    const joinDateRaw = req.body.joinDate;

    if (!name || !role || !phone || Number.isNaN(salary)) {
      res.status(400).json({ message: 'Name, role, phone, and salary are required' });
      return;
    }

    if (!isValidPhone(phone)) {
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }

    if (salary < 0) {
      res.status(400).json({ message: 'Salary must be zero or positive' });
      return;
    }

    let joinDate: Date | undefined;
    if (joinDateRaw) {
      const parsedDate = new Date(joinDateRaw);
      if (Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({ message: 'Invalid join date' });
        return;
      }
      joinDate = parsedDate;
    }

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
    const updateData: Record<string, unknown> = {};

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid worker ID format' });
      return;
    }

    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.role !== undefined) updateData.role = String(req.body.role).trim();
    if (req.body.phone !== undefined) updateData.phone = String(req.body.phone).trim();
    if (req.body.salary !== undefined) updateData.salary = Number(req.body.salary);
    if (req.body.joinDate !== undefined) updateData.joinDate = req.body.joinDate;
    if (req.body.isActive !== undefined) updateData.isActive = Boolean(req.body.isActive);

    if (typeof updateData.phone === 'string' && !isValidPhone(updateData.phone)) {
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }

    if (typeof updateData.salary === 'number' && updateData.salary < 0) {
      res.status(400).json({ message: 'Salary must be zero or positive' });
      return;
    }

    if (typeof updateData.joinDate === 'string' || updateData.joinDate instanceof Date) {
      const parsedDate = new Date(updateData.joinDate as string);
      if (Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({ message: 'Invalid join date' });
        return;
      }
      updateData.joinDate = parsedDate;
    }
    
    const worker = await Worker.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
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

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid worker ID format' });
      return;
    }
    
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
