import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Guide from '../models/Guide';
import Client from '../models/Client';
import { generateInvoiceNumber } from '../utils/helpers';
import { logger } from '../utils/logger';
import { InvoicePDFGenerator } from '../utils/invoicePDFGenerator';

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('invoice.get_all', { requestId: req.requestId });
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const total = await Invoice.countDocuments();
    
    const invoices = await Invoice.find()
      .populate('clientId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    logger.info('invoice.get_all.success', {
      requestId: req.requestId,
      count: invoices.length,
      total,
    });
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: invoices,
    });
  } catch (error) {
    logger.error('invoice.get_all.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error fetching invoices', error });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    logger.info('invoice.get_by_id', { requestId: req.requestId, invoiceId: id });
    
    const invoice = await Invoice.findById(id)
      .populate('clientId')
      .populate('items.guideId');
    
    if (!invoice) {
      logger.warn('invoice.get_by_id.not_found', {
        requestId: req.requestId,
        invoiceId: id,
      });
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    logger.error('invoice.get_by_id.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error fetching invoice', error });
  }
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, items, taxPercentage = 0, dueDate, notes } = req.body;
    
    logger.info('invoice.create', {
      requestId: req.requestId,
      clientId,
      itemCount: items?.length,
    });
    
    if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
      logger.warn('invoice.create.validation_failed', {
        requestId: req.requestId,
        reason: 'missing_required_fields',
      });
      res.status(400).json({ 
        message: 'Client ID and at least one item are required' 
      });
      return;
    }

    if (!clientId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn('invoice.create.validation_failed', {
        requestId: req.requestId,
        reason: 'invalid_client_id',
      });
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }

    const client = await Client.findById(clientId);
    if (!client) {
      logger.warn('invoice.create.failed', {
        requestId: req.requestId,
        reason: 'client_not_found',
      });
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    let subtotal = 0;
    const processedItems: any[] = [];

    for (const item of items) {
      if (!item.guideId || !item.quantity || !item.unitPrice) {
        logger.warn('invoice.create.validation_failed', {
          requestId: req.requestId,
          reason: 'invalid_item_fields',
        });
        res.status(400).json({ 
          message: 'Each item must have guideId, quantity, and unitPrice' 
        });
        return;
      }

      if (!item.guideId.match(/^[0-9a-fA-F]{24}$/)) {
        logger.warn('invoice.create.validation_failed', {
          requestId: req.requestId,
          reason: 'invalid_guide_id',
        });
        res.status(400).json({ message: 'Invalid guide ID format' });
        return;
      }

      const quantity = parseInt(item.quantity);
      const price = parseFloat(item.unitPrice);

      if (quantity <= 0) {
        logger.warn('invoice.create.validation_failed', {
          requestId: req.requestId,
          reason: 'invalid_quantity',
        });
        res.status(400).json({ message: 'Quantity must be greater than zero' });
        return;
      }

      if (price < 0) {
        logger.warn('invoice.create.validation_failed', {
          requestId: req.requestId,
          reason: 'invalid_price',
        });
        res.status(400).json({ message: 'Price cannot be negative' });
        return;
      }

      const guide = await Guide.findById(item.guideId);
      
      if (!guide) {
        logger.warn('invoice.create.failed', {
          requestId: req.requestId,
          reason: 'guide_not_found',
          guideId: item.guideId,
        });
        res.status(404).json({ 
          message: `Guide with ID ${item.guideId} not found` 
        });
        return;
      }

      const itemTotal = quantity * price;
      subtotal += itemTotal;
      
      processedItems.push({
        guideId: item.guideId,
        guideName: guide.name,
        quantity,
        unitPrice: price,
        total: itemTotal,
      });
    }

    const tax = Math.round((subtotal * taxPercentage) / 100 * 100) / 100;
    const total = subtotal + tax;

    const invoiceNumber = await generateInvoiceNumber();
    
    const invoice = await Invoice.create({
      invoiceNumber,
      clientId,
      items: processedItems,
      subtotal,
      tax,
      taxPercentage,
      total,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: notes || '',
      status: 'draft',
    });

    const populatedInvoice = await Invoice.findById(invoice._id).populate('clientId');
    
    logger.info('invoice.create.success', {
      requestId: req.requestId,
      invoiceId: invoice._id,
      invoiceNumber,
      total,
    });
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedInvoice,
    });
  } catch (error) {
    logger.error('invoice.create.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error creating invoice', error });
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    logger.info('invoice.update_status', {
      requestId: req.requestId,
      invoiceId: id,
      newStatus: status,
    });

    if (!['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }

    logger.info('invoice.update_status.success', {
      requestId: req.requestId,
      invoiceId: id,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Invoice status updated',
      data: invoice,
    });
  } catch (error) {
    logger.error('invoice.update_status.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error updating invoice', error });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('invoice.delete', {
      requestId: req.requestId,
      invoiceId: id,
    });
    
    const invoice = await Invoice.findByIdAndDelete(id);
    
    if (!invoice) {
      logger.warn('invoice.delete.not_found', {
        requestId: req.requestId,
        invoiceId: id,
      });
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }

    logger.info('invoice.delete.success', {
      requestId: req.requestId,
      invoiceId: id,
    });
    
    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    logger.error('invoice.delete.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error deleting invoice', error });
  }
};

export const downloadInvoicePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('invoice.download_pdf', {
      requestId: req.requestId,
      invoiceId: id,
    });

    const invoice = await Invoice.findById(id).populate('clientId');

    if (!invoice) {
      logger.warn('invoice.download_pdf.not_found', {
        requestId: req.requestId,
        invoiceId: id,
      });
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }

    const client = invoice.clientId as any;
    const pdfStream = InvoicePDFGenerator.generate({
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAddress: client.address,
      clientCity: client.city,
      clientState: client.state,
      clientZipCode: client.zipCode,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      taxPercentage: invoice.taxPercentage,
      total: invoice.total,
      notes: invoice.notes,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${invoice.invoiceNumber}.pdf"`);

    logger.info('invoice.download_pdf.success', {
      requestId: req.requestId,
      invoiceId: id,
      invoiceNumber: invoice.invoiceNumber,
    });

    pdfStream.pipe(res);
  } catch (error) {
    logger.error('invoice.download_pdf.error', {
      requestId: req.requestId,
      invoiceId: req.params.id,
      error,
    });
    res.status(500).json({ message: 'Error generating PDF', error });
  }
};
