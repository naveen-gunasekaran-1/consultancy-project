import { Request, Response } from 'express';
import guideRepository from '../repositories/guideRepository';

const parseId = (id: string): number | null => {
  const value = parseInt(id, 10);
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }
  return value;
};

const parseDescription = (description?: string): { subject: string; publisher: string } => {
  if (!description) {
    return { subject: '', publisher: 'Unknown' };
  }
  const [subject, publisher] = description.split(' - ');
  return {
    subject: subject || '',
    publisher: publisher || 'Unknown',
  };
};

const mapGuide = (guide: any) => {
  const parsed = parseDescription(guide.description);
  return {
    ...guide,
    _id: String(guide.id),
    class: guide.category || '',
    subject: parsed.subject,
    quantity: guide.stock,
    publisher: parsed.publisher,
    isActive: Boolean(guide.isActive),
  };
};

export const getAllGuides = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  const guides = guideRepository.findAll().map(mapGuide);
  const total = guides.length;
  
  // Apply pagination in memory
  const skip = (page - 1) * limit;
  const paginatedGuides = guides.slice(skip, skip + limit);
  
  res.status(200).json({
    success: true,
    count: paginatedGuides.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: paginatedGuides,
  });
};

export const getGuideById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const guideId = parseId(id);
  if (!guideId) {
    res.status(400).json({ message: 'Invalid guide ID format' });
    return;
  }

  const guide = guideRepository.findById(guideId);
  
  if (!guide) {
    res.status(404).json({ message: 'Guide not found' });
    return;
  }
  
  res.status(200).json({
    success: true,
    data: mapGuide(guide),
  });
};

export const createGuide = async (req: Request, res: Response): Promise<void> => {
  const { name, class: className, subject, price, quantity, publisher } = req.body;
  
  if (!name || !className || !subject || price === undefined || quantity === undefined) {
    res.status(400).json({ 
      message: 'Missing required fields: name, class, subject, price, and quantity are required' 
    });
    return;
  }

  if (price < 0) {
    res.status(400).json({ message: 'Price must be a positive number' });
    return;
  }

  if (quantity < 0) {
    res.status(400).json({ message: 'Quantity must be a positive number' });
    return;
  }
  
  const guide = guideRepository.create({
    name: name.trim(),
    description: `${subject.trim()}${publisher ? ` - ${publisher.trim()}` : ''}`,
    category: className.trim(),
    price: parseFloat(price),
    stock: parseInt(quantity),
  });
  
  res.status(201).json({
    success: true,
    message: 'Guide added successfully',
    data: mapGuide(guide),
  });
};

export const updateGuide = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const guideId = parseId(id);
  if (!guideId) {
    res.status(400).json({ message: 'Invalid guide ID format' });
    return;
  }

  const updateData = req.body;
  
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
  if (updateData.class) {
    updateData.category = String(updateData.class).trim();
    delete updateData.class;
  }
  if (updateData.subject || updateData.publisher) {
    const subject = updateData.subject ? String(updateData.subject).trim() : '';
    const publisher = updateData.publisher ? String(updateData.publisher).trim() : '';
    updateData.description = `${subject}${publisher ? ` - ${publisher}` : ''}`;
    delete updateData.subject;
    delete updateData.publisher;
  }
  if (updateData.quantity !== undefined) {
    updateData.stock = parseInt(updateData.quantity, 10);
    delete updateData.quantity;
  }
  
  const guide = guideRepository.update(guideId, updateData);
  
  if (!guide) {
    res.status(404).json({ message: 'Guide not found' });
    return;
  }
  
  res.status(200).json({
    success: true,
    message: 'Guide updated successfully',
    data: mapGuide(guide),
  });
};

export const deleteGuide = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const guideId = parseId(id);
  if (!guideId) {
    res.status(400).json({ message: 'Invalid guide ID format' });
    return;
  }

  const guide = guideRepository.findById(guideId);
  
  if (!guide) {
    res.status(404).json({ message: 'Guide not found' });
    return;
  }
  
  guideRepository.delete(guideId);
  
  res.status(200).json({
    success: true,
    message: 'Guide deleted successfully',
  });
};

export const searchGuides = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;
  
  if (!query || typeof query !== 'string') {
    res.status(400).json({ message: 'Search query is required' });
    return;
  }

  // Search across multiple fields (case-insensitive)
  const allGuides = guideRepository.findAll();
  const searchTerm = query.toLowerCase();
  const guides = allGuides
    .map(mapGuide)
    .filter((guide) =>
      guide.name.toLowerCase().includes(searchTerm) ||
      guide.subject.toLowerCase().includes(searchTerm) ||
      guide.class.toLowerCase().includes(searchTerm) ||
      guide.publisher.toLowerCase().includes(searchTerm)
    );
  
  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides,
  });
};
