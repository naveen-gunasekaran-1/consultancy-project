import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Guide from '../models/Guide';
import { generateInvoiceNumber } from '../utils/helpers';

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Invoice.countDocuments();
    
    const invoices = await Invoice.find()
      .populate('clientId')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: invoices,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices', error });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id).populate('clientId');
    
    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error });
  }
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, items, discount = 0, notes } = req.body;
    
    // Validation
    if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ 
        message: 'Client ID and at least one item are required' 
      });
      return;
    }

    // Validate ObjectId format
    if (!clientId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }

    // Process items and calculate total
    let totalAmount = 0;
    const processedItems: any[] = [];

    // Validate all items and check stock availability
    for (const item of items) {
      if (!item.guideId || !item.quantity || !item.price) {
        res.status(400).json({ 
          message: 'Each item must have guideId, quantity, and price' 
        });
        return;
      }

      // Validate guide ID format
      if (!item.guideId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ message: 'Invalid guide ID format' });
        return;
      }

      const quantity = parseInt(item.quantity);
      const price = parseFloat(item.price);

      if (quantity <= 0) {
        res.status(400).json({ message: 'Quantity must be greater than zero' });
        return;
      }

      if (price < 0) {
        res.status(400).json({ message: 'Price cannot be negative' });
        return;
      }

      // Check if guide exists and has enough stock
      const guide = await Guide.findById(item.guideId);
      
      if (!guide) {
        res.status(404).json({ 
          message: `Guide with ID ${item.guideId} not found` 
        });
        return;
      }

      if (guide.quantity < quantity) {
        res.status(400).json({ 
          message: `Insufficient stock for ${guide.name}. Available: ${guide.quantity}, Requested: ${quantity}` 
        });
        return;
      }

      const subtotal = quantity * price;
      totalAmount += subtotal;
      
      processedItems.push({
        guideId: item.guideId,
        name: guide.name,
        quantity,
        price,
        subtotal,
      });
    }

    // Apply discount
    const discountAmount = (totalAmount * parseFloat(discount as any || 0)) / 100;
    const finalAmount = totalAmount - discountAmount;

    // Generate unique invoice number
    const invoiceNo = generateInvoiceNumber();
    
    // Create invoice
    const invoice = await Invoice.create({
      invoiceNo,
      clientId,
      items: processedItems,
      totalAmount: finalAmount,
      discount: parseFloat(discount as any || 0),
      notes: notes || '',
      date: new Date(),
      status: 'unpaid',
    });

    // Deduct stock quantities
    for (const item of items) {
      await Guide.findByIdAndUpdate(
        item.guideId,
        { $inc: { quantity: -parseInt(item.quantity) } }
      );
    }
    
    // Populate client data
    const populatedInvoice = await Invoice.findById(invoice._id).populate('clientId');
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedInvoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Error creating invoice', error });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // TODO: Implement invoice update logic
    res.status(200).json({
      success: true,
      message: 'Invoice update - TODO',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice', error });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByIdAndDelete(id);
    
    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    
    // TODO: Restore stock quantity if invoice is deleted
    
    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error });
  }
};
