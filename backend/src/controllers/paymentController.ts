import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Invoice from '../models/Invoice';
import { logger } from '../utils/logger';

const PAYMENT_METHODS = ['cash', 'upi', 'bank', 'cheque', 'credit_card'] as const;

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  try {
    const payments = await Payment.find()
      .populate('invoiceId')
      .sort({ createdAt: -1 });
    
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
  } catch (error) {
    logger.error('getAllPayments', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;
  
  try {
    const payment = await Payment.findById(id).populate('invoiceId');
    
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
      data: payment,
    });
  } catch (error) {
    logger.error('getPaymentById', {
      requestId,
      paymentId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error fetching payment' });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { invoiceId, amount, paymentMethod, transactionId, notes } = req.body;
  
  try {
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

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ success: false, message: 'Amount must be a positive number' });
      return;
    }

    // Check if invoice exists
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      logger.warn('createPayment', {
        requestId,
        invoiceId,
        message: 'Invoice not found',
      });
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    // Check transaction ID uniqueness if provided
    if (transactionId) {
      const existingPayment = await Payment.findOne({ transactionId });
      if (existingPayment) {
        res.status(400).json({ success: false, message: 'Transaction ID already exists' });
        return;
      }
    }

    const payment = await Payment.create({
      invoiceId,
      amount,
      paymentMethod,
      transactionId,
      paymentDate: new Date(),
      notes,
      isActive: true,
    });
    
    const duration = Date.now() - startTime;
    logger.info('createPayment', {
      requestId,
      paymentId: payment._id,
      invoiceId,
      amount,
      paymentMethod,
      duration,
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    logger.error('createPayment', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error creating payment' });
  }
};

export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;
  const { paymentMethod, transactionId, notes } = req.body;
  
  try {
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
    
    const payment = await Payment.findByIdAndUpdate(id, updateData, { new: true });
    
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
      data: payment,
    });
  } catch (error) {
    logger.error('updatePaymentMethod', {
      requestId,
      paymentId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error updating payment' });
  }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { id } = req.params;
  
  try {
    const payment = await Payment.findByIdAndDelete(id);
    
    if (!payment) {
      logger.warn('deletePayment', {
        requestId,
        paymentId: id,
        message: 'Payment not found',
      });
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }
    
    const duration = Date.now() - startTime;
    logger.info('deletePayment', {
      requestId,
      paymentId: id,
      duration,
    });
    
    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
      data: payment,
    });
  } catch (error) {
    logger.error('deletePayment', {
      requestId,
      paymentId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error deleting payment' });
  }
};

export const getPaymentsByInvoice = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { invoiceId } = req.params;
  
  try {
    const payments = await Payment.find({ invoiceId }).sort({ paymentDate: -1 });
    
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
  } catch (error) {
    logger.error('getPaymentsByInvoice', {
      requestId,
      invoiceId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
};
