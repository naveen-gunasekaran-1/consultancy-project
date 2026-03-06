import { Request, Response } from 'express';
import orderRepository from '../repositories/orderRepository';
import guideRepository from '../repositories/guideRepository';
import { logger } from '../utils/logger';
import { OrderPDFGenerator } from '../utils/orderPDFGenerator';

const isValidPhone = (phone: string): boolean => /^[0-9+\-()\s]{7,20}$/.test(phone);

const parseId = (id: string | number): number | null => {
  const value = typeof id === 'number' ? id : parseInt(String(id), 10);
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }
  return value;
};

const mapOrder = (order: any) => ({
  ...order,
  _id: String(order.id),
  isActive: Boolean(order.isActive),
});

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('order.get_all', { requestId: req.requestId });

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const allOrders = orderRepository.findAll();
    const total = allOrders.length;
    const pagedOrders = allOrders.slice(skip, skip + limit);

    logger.info('order.get_all.success', {
      requestId: req.requestId,
      count: pagedOrders.length,
      total,
    });

    res.status(200).json({
      success: true,
      count: pagedOrders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: pagedOrders.map(mapOrder),
    });
  } catch (error) {
    logger.error('order.get_all.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('order.get_by_id', { requestId: req.requestId, orderId: id });

    const orderId = parseId(id);
    if (!orderId) {
      res.status(400).json({ message: 'Invalid order ID format' });
      return;
    }

    const order = orderRepository.findById(orderId);

    if (!order) {
      logger.warn('order.get_by_id.not_found', {
        requestId: req.requestId,
        orderId: id,
      });
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: mapOrder(order),
    });
  } catch (error) {
    logger.error('order.get_by_id.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverName, driverPhone, vehicleNumber, guideId, quantity, amount, notes } = req.body;

    logger.info('order.create', {
      requestId: req.requestId,
      driverName,
      guideId,
      quantity,
    });

    if (!driverName || !driverPhone || !guideId || !quantity || amount === undefined) {
      logger.warn('order.create.validation_failed', {
        requestId: req.requestId,
        reason: 'missing_required_fields',
      });
      res.status(400).json({
        message: 'driverName, driverPhone, guideId, quantity, and amount are required',
      });
      return;
    }

    if (!isValidPhone(driverPhone)) {
      logger.warn('order.create.validation_failed', {
        requestId: req.requestId,
        reason: 'invalid_phone',
      });
      res.status(400).json({ message: 'Invalid phone format' });
      return;
    }

    const parsedGuideId = parseId(guideId);
    if (!parsedGuideId) {
      res.status(400).json({ message: 'Invalid guide ID format' });
      return;
    }

    const guide = guideRepository.findById(parsedGuideId);
    if (!guide) {
      logger.warn('order.create.failed', {
        requestId: req.requestId,
        reason: 'guide_not_found',
        guideId,
      });
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const parsedQuantity = parseInt(String(quantity), 10);
    const parsedAmount = parseFloat(String(amount));

    if (parsedQuantity <= 0) {
      res.status(400).json({ message: 'Quantity must be greater than zero' });
      return;
    }

    if (parsedAmount < 0 || Number.isNaN(parsedAmount)) {
      res.status(400).json({ message: 'Amount cannot be negative' });
      return;
    }

    const order = orderRepository.create({
      driverName: String(driverName).trim(),
      driverPhone: String(driverPhone).trim(),
      vehicleNumber: vehicleNumber ? String(vehicleNumber).trim() : undefined,
      guideId: parsedGuideId,
      productName: guide.name,
      quantity: parsedQuantity,
      amount: parsedAmount,
      balanceAmount: parsedAmount,
      notes: notes ? String(notes).trim() : undefined,
    });

    logger.info('order.create.success', {
      requestId: req.requestId,
      orderId: order.id,
      driverName: order.driverName,
      total: order.amount,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: mapOrder(order),
    });
  } catch (error) {
    logger.error('order.create.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error creating order', error });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amountReceived, paymentStatus, paymentMethod, notes } = req.body;

    logger.info('order.update', {
      requestId: req.requestId,
      orderId: id,
      amountReceived,
      paymentStatus,
    });

    const orderId = parseId(id);
    if (!orderId) {
      res.status(400).json({ message: 'Invalid order ID format' });
      return;
    }

    const order = orderRepository.findById(orderId);
    if (!order) {
      logger.warn('order.update.not_found', {
        requestId: req.requestId,
        orderId: id,
      });
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const updateData: any = {};

    if (amountReceived !== undefined) {
      const parsedAmount = parseFloat(String(amountReceived));
      if (parsedAmount < 0 || Number.isNaN(parsedAmount)) {
        res.status(400).json({ message: 'Amount received cannot be negative' });
        return;
      }
      if (parsedAmount > order.amount) {
        res.status(400).json({ message: 'Amount received cannot exceed order amount' });
        return;
      }
      updateData.amountReceived = parsedAmount;
      updateData.balanceAmount = order.amount - parsedAmount;
    }

    if (paymentStatus !== undefined) {
      if (!['pending', 'partial', 'paid'].includes(paymentStatus)) {
        res.status(400).json({ message: 'Invalid payment status' });
        return;
      }
      updateData.paymentStatus = paymentStatus;
    }

    if (paymentMethod !== undefined) {
      updateData.paymentMethod = paymentMethod ? String(paymentMethod).trim() : null;
    }

    if (notes !== undefined) {
      updateData.notes = notes ? String(notes).trim() : null;
    }

    const updatedOrder = orderRepository.update(orderId, updateData);

    logger.info('order.update.success', {
      requestId: req.requestId,
      orderId: id,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder ? mapOrder(updatedOrder) : null,
    });
  } catch (error) {
    logger.error('order.update.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error updating order', error });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('order.delete', {
      requestId: req.requestId,
      orderId: id,
    });

    const orderId = parseId(id);
    if (!orderId) {
      res.status(400).json({ message: 'Invalid order ID format' });
      return;
    }

    const order = orderRepository.findById(orderId);
    if (!order) {
      logger.warn('order.delete.not_found', {
        requestId: req.requestId,
        orderId: id,
      });
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    orderRepository.delete(orderId);

    logger.info('order.delete.success', {
      requestId: req.requestId,
      orderId: id,
    });

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    logger.error('order.delete.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error deleting order', error });
  }
};

export const getPendingOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('order.get_pending', { requestId: req.requestId });

    const pendingOrders = orderRepository.getPendingOrders();
    const totalBalance = orderRepository.getTotalPendingBalance();

    logger.info('order.get_pending.success', {
      requestId: req.requestId,
      count: pendingOrders.length,
      totalBalance,
    });

    res.status(200).json({
      success: true,
      count: pendingOrders.length,
      totalBalance,
      data: pendingOrders.map(mapOrder),
    });
  } catch (error) {
    logger.error('order.get_pending.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error fetching pending orders', error });
  }
};

export const downloadOrderPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('order.download_pdf', {
      requestId: req.requestId,
      orderId: id,
    });

    const orderId = parseId(id);
    if (!orderId) {
      res.status(400).json({ message: 'Invalid order ID format' });
      return;
    }

    const order = orderRepository.findById(orderId);
    if (!order) {
      logger.warn('order.download_pdf.not_found', {
        requestId: req.requestId,
        orderId: id,
      });
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Get guide details
    const guide = guideRepository.findById(order.guideId);
    if (!guide) {
      logger.warn('order.download_pdf.guide_not_found', {
        requestId: req.requestId,
        guideId: order.guideId,
      });
      res.status(404).json({ message: 'Guide not found for this order' });
      return;
    }

    const pdfStream = OrderPDFGenerator.generate({
      orderId: order.id,
      orderDate: new Date(order.dispatchDate),
      driverName: order.driverName,
      driverPhone: order.driverPhone,
      vehicleNumber: order.vehicleNumber || 'N/A',
      guideName: guide.name,
      quantity: order.quantity,
      price: order.amount / order.quantity,
      total: order.amount,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="order_receipt_${order.id}.pdf"`);

    logger.info('order.download_pdf.success', {
      requestId: req.requestId,
      orderId: order.id,
    });

    pdfStream.pipe(res);
    pdfStream.on('end', () => {
      logger.info('order.download_pdf.stream_complete', {
        requestId: req.requestId,
        orderId: order.id,
      });
    });
  } catch (error) {
    logger.error('order.download_pdf.error', {
      requestId: req.requestId,
      error,
    });
    res.status(500).json({ message: 'Error generating order PDF', error });
  }
};
