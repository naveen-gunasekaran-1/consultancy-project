import { Request, Response } from 'express';
import Guide from '../models/Guide';

export const getAllGuides = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement pagination
    const guides = await Guide.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching guides', error });
  }
};

export const getGuideById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // TODO: Implement proper error handling for invalid ID
    const guide = await Guide.findById(id);
    
    if (!guide) {
      res.status(404).json({ message: 'Guide not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching guide', error });
  }
};

export const createGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, class: className, subject, price, quantity, publisher } = req.body;
    
    // TODO: Implement validation
    const guide = await Guide.create({
      name,
      class: className,
      subject,
      price,
      quantity,
      publisher,
    });
    
    res.status(201).json({
      success: true,
      message: 'Guide added successfully',
      data: guide,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating guide', error });
  }
};

export const updateGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // TODO: Implement validation
    const guide = await Guide.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!guide) {
      res.status(404).json({ message: 'Guide not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Guide updated successfully',
      data: guide,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating guide', error });
  }
};

export const deleteGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const guide = await Guide.findByIdAndDelete(id);
    
    if (!guide) {
      res.status(404).json({ message: 'Guide not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Guide deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting guide', error });
  }
};

export const searchGuides = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    // TODO: Implement advanced search with filters
    // Placeholder response
    res.status(200).json({
      success: true,
      data: [],
      message: 'Search functionality - TODO',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching guides', error });
  }
};
