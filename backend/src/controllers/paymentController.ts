import { Request, Response } from 'express';
import paymentRepository from '../repositories/paymentRepository';
import invoiceRepository from '../repositories/invoiceRepository';
import { logger } from '../utils/logger';

const PAYMENT_METHODS = ['cash', 'upi', 'bank', 'cheque', 'credit_card'] as const;

const parseId = (id: string | number): number | null => {
  const value = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }
  return value;
};

const mapPayment = (payment: any) => {
  const invoice = invoiceRepository.findById(payment.invoiceId);
  return {
    ...payment,
    _id: String(payment.id),
    invoiceId: invoice
      ? {
          _id: String(invoice.id),
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
        }
      : String(payment.invoiceId),
    isActive: Boolean(payment.isActive),
  };
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  const payments = paymentRepository.findAll().map(mapPayment);
  
  const duration = Date.now() - startTime;
  logger.info('getAllPayments', {
    requestId,
    count: payments.length,
    duration,
  });
  
  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;

  const paymentId = parseId(id);
  if (!paymentId) {
    res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    return;
  }
  
  const payment = paymentRepository.findById(paymentId);
  
  if (!payment) {
    logger.warn('getPaymentById', {
      requestId,
      paymentId: id,
      message: 'Payment not found',
    });
    res.status(404).json({ success: false, message: 'Payment not found' });
    return;
  }
  
  const duration = Date.now() - startTime;
  logger.info('getPaymentById', {
    requestId,
    paymentId: id,
    duration,
  });
  
  res.status(200).json({
    success: true,
    data: mapPayment(payment),
  });
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { invoiceId, amount, paymentMethod, transactionId, notes } = req.body;
  
  // Validation
  if (!invoiceId || !amount || !paymentMethod) {
    logger.warn('createPayment', {
      requestId,
      message: 'Missing required fields',
      providedFields: { invoiceId, amount, paymentMethod },
    });
    res.status(400).json({ success: false, message: 'invoiceId, amount, and paymentMethod are required' });
    return;
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    res.status(400).json({ 
      success: false, 
      message: `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}` 
    });
    return;
  }

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    return;
  }

  // Check if invoice exists
  const parsedInvoiceId = parseId(invoiceId);
  if (!parsedInvoiceId) {
    res.status(400).json({ success: false, message: 'Invalid invoice ID format' });
    return;
  }

  const invoice = invoiceRepository.findById(parsedInvoiceId);
  if (!invoice) {
    logger.warn('createPayment', {
      requestId,
      invoiceId: parsedInvoiceId,
      message: 'Invoice not found',
    });
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }

  const payment = paymentRepository.create({
    invoiceId: parsedInvoiceId,
    amount: parsedAmount,
    paymentMethod,
    transactionId,
    notes,
  });
  
  const duration = Date.now() - startTime;
  logger.info('createPayment', {
    requestId,
    paymentId: payment.id,
    invoiceId,
    amount: parsedAmount,
    paymentMethod,
    duration,
  });
  
  res.status(201).json({
    success: true,
    message: 'Payment recorded successfully',
    data: mapPayment(payment),
  });
};

export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;
  const { paymentMethod, transactionId, notes } = req.body;

  const paymentId = parseId(id);
  if (!paymentId) {
    res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    return;
  }
  
  if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
    res.status(400).json({ 
      success: false, 
      message: `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}` 
    });
    return;
  }

  const updateData: any = {};
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  if (transactionId) updateData.transactionId = transactionId;
  if (notes !== undefined) updateData.notes = notes;
  
  const payment = paymentRepository.update(paymentId, updateData);
  
  if (!payment) {
    logger.warn('updatePaymentMethod', {
      requestId,
      paymentId: id,
      message: 'Payment not found',
    });
    res.status(404).json({ success: false, message: 'Payment not found' });
    return;
  }
  
  const duration = Date.now() - startTime;
  logger.info('updatePaymentMethod', {
    requestId,
    paymentId: id,
    updates: Object.keys(updateData),
    duration,
  });
  
  res.status(200).json({
    success: true,
    message: 'Payment updated successfully',
    data: mapPayment(payment),
  });
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;

  const paymentId = parseId(id);
  if (!paymentId) {
    res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    return;
  }
  
  const payment = paymentRepository.findById(paymentId);
  
  if (!payment) {
    logger.warn('deletePayment', {
      requestId,
      paymentId: id,
      message: 'Payment not found',
    });
    res.status(404).json({ success: false, message: 'Payment not found' });
    return;
  }
  
  paymentRepository.delete(paymentId);
  
  const duration = Date.now() - startTime;
  logger.info('deletePayment', {
    requestId,
    paymentId: id,
    duration,
  });
  
  res.status(200).json({
    success: true,
    message: 'Payment deleted successfully',
    data: mapPayment(payment),
  });
};

export const getPaymentsByInvoice = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { invoiceId } = req.params;

  const parsedInvoiceId = parseId(invoiceId);
  if (!parsedInvoiceId) {
    res.status(400).json({ success: false, message: 'Invalid invoice ID format' });
    return;
  }
  
  const payments = paymentRepository.findByInvoiceId(parsedInvoiceId).map(mapPayment);
  
  const duration = Date.now() - startTime;
  logger.info('getPaymentsByInvoice', {
    requestId,
    invoiceId,
    count: payments.length,
    duration,
  });
  
  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
};
