import { Request, Response } from 'express';
import Guide from '../models/Guide';

export const getAllGuides = async (req: Request, res: Response): Promise<void> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Guide.countDocuments();
    
    // Fetch guides with pagination
    const guides = await Guide.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: guides.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: guides,
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ message: 'Error fetching guides', error });
  }
};

export const getGuideById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: 'Invalid guide ID format' });
      return;
    }
    
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
    console.error('Error fetching guide:', error);
    res.status(500).json({ message: 'Error fetching guide', error });
  }
};

export const createGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, class: className, subject, price, quantity, publisher } = req.body;
    
    // Validation
    if (!name || !className || !subject || price === undefined || quantity === undefined) {
      res.status(400).json({ 
        message: 'Missing required fields: name, class, subject, price, and quantity are required' 
      });
      return;
    }

    // Validate price and quantity are positive numbers
    if (price < 0) {
      res.status(400).json({ message: 'Price must be a positive number' });
      return;
    }

    if (quantity < 0) {
      res.status(400).json({ message: 'Quantity must be a positive number' });
      return;
    }

    // Check for duplicate guide
    const existingGuide = await Guide.findOne({ 
      name: name.trim(), 
      class: className.trim(),
      subject: subject.trim()
    });

    if (existingGuide) {
      res.status(400).json({ 
        message: 'A guide with the same name, class, and subject already exists' 
      });
      return;
    }
    
    const guide = await Guide.create({
      name: name.trim(),
      class: className.trim(),
      subject: subject.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      publisher: publisher?.trim() || 'Unknown',
    });
    
    res.status(201).json({
      success: true,
      message: 'Guide added successfully',
      data: guide,
    });
  } catch (error) {
    console.error('Error creating guide:', error);
    res.status(500).json({ message: 'Error creating guide', error });
  }
};

export const updateGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: 'Invalid guide ID format' });
      return;
    }

    // Validate price and quantity if provided
    if (updateData.price !== undefined && updateData.price < 0) {
      res.status(400).json({ message: 'Price must be a positive number' });
      return;
    }

    if (updateData.quantity !== undefined && updateData.quantity < 0) {
      res.status(400).json({ message: 'Quantity must be zero or positive' });
      return;
    }

    // Trim string fields
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.class) updateData.class = updateData.class.trim();
    if (updateData.subject) updateData.subject = updateData.subject.trim();
    if (updateData.publisher) updateData.publisher = updateData.publisher.trim();
    
    const guide = await Guide.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    });
    
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
    console.error('Error updating guide:', error);
    res.status(500).json({ message: 'Error updating guide', error });
  }
};

export const deleteGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: 'Invalid guide ID format' });
      return;
    }
    
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
    console.error('Error deleting guide:', error);
    res.status(500).json({ message: 'Error deleting guide', error });
  }
};

export const searchGuides = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    // Search across multiple fields
    const guides = await Guide.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
        { class: { $regex: query, $options: 'i' } },
        { publisher: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (error) {
    console.error('Error searching guides:', error);
    res.status(500).json({ message: 'Error searching guides', error });
  }
};
