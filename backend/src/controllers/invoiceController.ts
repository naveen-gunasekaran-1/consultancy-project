import { Request, Response } from 'express';
import invoiceRepository from '../repositories/invoiceRepository';
import clientRepository from '../repositories/clientRepository';
import guideRepository from '../repositories/guideRepository';
import { logger } from '../utils/logger';
import { InvoicePDFGenerator } from '../utils/invoicePDFGenerator';

const VALID_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

const parseId = (id: string | number): number | null => {
  const value = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }
  return value;
};

const mapClient = (client: any) => ({
  ...client,
  _id: String(client.id),
  isActive: Boolean(client.isActive),
});

const mapInvoice = (invoice: any, client?: any) => ({
  ...invoice,
  _id: String(invoice.id),
  invoiceDate: invoice.createdAt,
  clientId: client ? mapClient(client) : String(invoice.clientId),
  items: (invoice.items || []).map((item: any) => ({
    ...item,
    _id: String(item.id),
    guideId: String(item.guideId),
  })),
  isActive: Boolean(invoice.isActive),
});

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('invoice.get_all', { requestId: req.requestId });

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const allInvoices = invoiceRepository.findAll();
    const total = allInvoices.length;
    const pagedInvoices = allInvoices.slice(skip, skip + limit);

    const invoices = pagedInvoices.map((invoice) => {
      const client = clientRepository.findById(invoice.clientId);
      return mapInvoice(invoice, client);
    });

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

    const invoiceId = parseId(id);
    if (!invoiceId) {
      res.status(400).json({ message: 'Invalid invoice ID format' });
      return;
    }

    const invoice = invoiceRepository.findById(invoiceId);

    if (!invoice) {
      logger.warn('invoice.get_by_id.not_found', {
        requestId: req.requestId,
        invoiceId: id,
      });
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }

    const client = clientRepository.findById(invoice.clientId);

    res.status(200).json({
      success: true,
      data: mapInvoice(invoice, client),
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
        message: 'Client ID and at least one item are required',
      });
      return;
    }

    const parsedClientId = parseId(clientId);
    if (!parsedClientId) {
      logger.warn('invoice.create.validation_failed', {
        requestId: req.requestId,
        reason: 'invalid_client_id',
      });
      res.status(400).json({ message: 'Invalid client ID format' });
      return;
    }

    const client = clientRepository.findById(parsedClientId);
    if (!client) {
      logger.warn('invoice.create.failed', {
        requestId: req.requestId,
        reason: 'client_not_found',
      });
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    const processedItems: Array<{
      guideId: number;
      guideName: string;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const item of items) {
      if (!item.guideId || !item.quantity || item.unitPrice === undefined) {
        logger.warn('invoice.create.validation_failed', {
          requestId: req.requestId,
          reason: 'invalid_item_fields',
        });
        res.status(400).json({
          message: 'Each item must have guideId, quantity, and unitPrice',
        });
        return;
      }

      const parsedGuideId = parseId(item.guideId);
      if (!parsedGuideId) {
        logger.warn('invoice.create.validation_failed', {
          requestId: req.requestId,
          reason: 'invalid_guide_id',
        });
        res.status(400).json({ message: 'Invalid guide ID format' });
        return;
      }

      const quantity = parseInt(String(item.quantity), 10);
      const price = parseFloat(String(item.unitPrice));

      if (quantity <= 0) {
        logger.warn('invoice.create.validation_failed', {
          requestId: req.requestId,
          reason: 'invalid_quantity',
        });
        res.status(400).json({ message: 'Quantity must be greater than zero' });
        return;
      }

      if (price < 0 || Number.isNaN(price)) {
        logger.warn('invoice.create.validation_failed', {
          requestId: req.requestId,
          reason: 'invalid_price',
        });
        res.status(400).json({ message: 'Price cannot be negative' });
        return;
      }

      const guide = guideRepository.findById(parsedGuideId);
      if (!guide) {
        logger.warn('invoice.create.failed', {
          requestId: req.requestId,
          reason: 'guide_not_found',
          guideId: item.guideId,
        });
        res.status(404).json({
          message: `Guide with ID ${item.guideId} not found`,
        });
        return;
      }

      processedItems.push({
        guideId: parsedGuideId,
        guideName: guide.name,
        quantity,
        unitPrice: price,
      });
    }

    const parsedTaxPercentage = Number(taxPercentage);
    if (Number.isNaN(parsedTaxPercentage) || parsedTaxPercentage < 0 || parsedTaxPercentage > 100) {
      res.status(400).json({ message: 'Tax percentage must be between 0 and 100' });
      return;
    }

    const computedDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const invoice = invoiceRepository.create({
      clientId: parsedClientId,
      items: processedItems,
      taxPercentage: parsedTaxPercentage,
      dueDate: computedDueDate,
      notes: notes || '',
    });

    logger.info('invoice.create.success', {
      requestId: req.requestId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: mapInvoice(invoice, client),
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

    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const invoiceId = parseId(id);
    if (!invoiceId) {
      res.status(400).json({ message: 'Invalid invoice ID format' });
      return;
    }

    const invoice = invoiceRepository.updateStatus(invoiceId, status);

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
      data: mapInvoice(invoice),
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

    const invoiceId = parseId(id);
    if (!invoiceId) {
      res.status(400).json({ message: 'Invalid invoice ID format' });
      return;
    }

    const invoice = invoiceRepository.findById(invoiceId);

    if (!invoice) {
      logger.warn('invoice.delete.not_found', {
        requestId: req.requestId,
        invoiceId: id,
      });
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }

    invoiceRepository.delete(invoiceId);

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

    const invoiceId = parseId(id);
    if (!invoiceId) {
      res.status(400).json({ message: 'Invalid invoice ID format' });
      return;
    }

    const invoice = invoiceRepository.findById(invoiceId);

    if (!invoice) {
      logger.warn('invoice.download_pdf.not_found', {
        requestId: req.requestId,
        invoiceId: id,
      });
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }

    const client = clientRepository.findById(invoice.clientId);
    if (!client) {
      res.status(404).json({ message: 'Client not found for invoice' });
      return;
    }

    const pdfStream = InvoicePDFGenerator.generate({
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: new Date(invoice.createdAt),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.createdAt),
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone || '',
      clientAddress: client.address || '',
      clientCity: client.city || '',
      clientState: client.state || '',
      clientZipCode: client.zipCode || '',
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
