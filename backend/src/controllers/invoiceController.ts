import { Request, Response } from 'express';
import Invoice from '../models/Invoice';

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement pagination and filtering
    const invoices = await Invoice.find()
      .populate('clientId')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
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
    const { clientId, items } = req.body;
    
    // TODO: Implement proper calculation logic
    // Calculate total amount from items
    let totalAmount = 0;
    const processedItems = items.map((item: any) => {
      const subtotal = item.quantity * item.price;
      totalAmount += subtotal;
      return {
        ...item,
        subtotal,
      };
    });
    
    // TODO: Generate unique invoice number
    const invoiceNo = `INV-${Date.now()}`;
    
    const invoice = await Invoice.create({
      invoiceNo,
      clientId,
      items: processedItems,
      totalAmount,
      date: new Date(),
    });
    
    // TODO: Update stock quantity after invoice creation
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
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
