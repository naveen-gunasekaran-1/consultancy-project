import { Request, Response } from 'express';
import Payment from '../models/Payment';

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find()
      .populate('invoiceId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id).populate('invoiceId');
    
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId, amount, status, paymentMethod, notes } = req.body;
    
    const payment = await Payment.create({
      invoiceId,
      amount,
      status: status || 'PENDING',
      paymentDate: status === 'PAID' ? new Date() : undefined,
      paymentMethod,
      notes,
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment record created',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentMethod, notes } = req.body;
    
    const updateData: any = { status };
    
    if (status === 'PAID') {
      updateData.paymentDate = new Date();
    }
    
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (notes) updateData.notes = notes;
    
    const payment = await Payment.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error });
  }
};

export const getPaymentsByInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    
    const payments = await Payment.find({ invoiceId });
    
    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};
