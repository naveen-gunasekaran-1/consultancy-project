import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Guide from '../models/Guide';
import Client from '../models/Client';
import Worker from '../models/Worker';
import { logger } from '../utils/logger';

export const getFinancialReport = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { startDate, endDate } = req.query;
  
  try {
    // Date filtering
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate as string);
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.$gte = thirtyDaysAgo;
    }
    
    if (endDate) {
      dateFilter.$lte = new Date(endDate as string);
    } else {
      dateFilter.$lte = new Date();
    }
    
    // Get invoices in date range
    const invoices = await Invoice.find({ createdAt: dateFilter });
    
    // Calculate financial metrics
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
    const totalSubtotal = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    
    // Get payments
    const payments = await Payment.find({ 
      paymentDate: dateFilter,
      isActive: true 
    });
    const totalPaymentsReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = totalRevenue - totalPaymentsReceived;
    
    // Invoice status breakdown
    const draftInvoices = invoices.filter(i => i.status === 'draft').length;
    const sentInvoices = invoices.filter(i => i.status === 'sent').length;
    const paidInvoices = invoices.filter(i => i.status === 'paid').length;
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
    
    // Payment method breakdown
    const paymentMethodBreakdown: any = {};
    payments.forEach(p => {
      if (!paymentMethodBreakdown[p.paymentMethod]) {
        paymentMethodBreakdown[p.paymentMethod] = 0;
      }
      paymentMethodBreakdown[p.paymentMethod] += p.amount;
    });
    
    const duration = Date.now() - startTime;
    logger.info('getFinancialReport', {
      requestId,
      periodStart: dateFilter.$gte,
      periodEnd: dateFilter.$lte,
      totalRevenue,
      totalPayments: totalPaymentsReceived,
      duration,
    });
    
    res.status(200).json({
      success: true,
      data: {
        period: { startDate: dateFilter.$gte, endDate: dateFilter.$lte },
        revenue: {
          subtotal: parseFloat(totalSubtotal.toFixed(2)),
          tax: parseFloat(totalTax.toFixed(2)),
          total: parseFloat(totalRevenue.toFixed(2)),
        },
        payments: {
          received: parseFloat(totalPaymentsReceived.toFixed(2)),
          pending: parseFloat(pendingAmount.toFixed(2)),
          collectionRate: totalRevenue > 0 ? ((totalPaymentsReceived / totalRevenue) * 100).toFixed(2) : '0.00',
        },
        invoiceStatus: {
          draft: draftInvoices,
          sent: sentInvoices,
          paid: paidInvoices,
          overdue: overdueInvoices,
        },
        paymentMethods: paymentMethodBreakdown,
        invoiceCount: invoices.length,
        paymentCount: payments.length,
      },
    });
  } catch (error) {
    logger.error('getFinancialReport', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error generating financial report' });
  }
};

export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { startDate, endDate } = req.query;
  
  try {
    // Date filtering
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate as string);
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.$gte = thirtyDaysAgo;
    }
    
    if (endDate) {
      dateFilter.$lte = new Date(endDate as string);
    } else {
      dateFilter.$lte = new Date();
    }
    
    // Get invoices in date range
    const invoices = await Invoice.find({ createdAt: dateFilter }).populate('clientId');
    
    // Calculate sales stats
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const averageInvoiceValue = invoices.length > 0 ? totalSales / invoices.length : 0;
    
    // Count items sold
    const itemStats: any = {};
    invoices.forEach(invoice => {
      invoice.items.forEach((item: any) => {
        const key = item.name || 'Unknown';
        if (!itemStats[key]) {
          itemStats[key] = { name: key, quantity: 0, revenue: 0 };
        }
        itemStats[key].quantity += item.quantity;
        itemStats[key].revenue += item.subtotal;
      });
    });
    
    // Top selling items
    const topItems = Object.values(itemStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Top clients by sales
    const clientSales: any = {};
    invoices.forEach(invoice => {
      const clientId = (invoice.clientId as any)?._id?.toString();
      const clientName = (invoice.clientId as any)?.name || 'Unknown';
      
      if (clientId) {
        if (!clientSales[clientId]) {
          clientSales[clientId] = { name: clientName, sales: 0, invoiceCount: 0 };
        }
        clientSales[clientId].sales += invoice.total;
        clientSales[clientId].invoiceCount += 1;
      }
    });
    
    const topClients = Object.values(clientSales)
      .sort((a: any, b: any) => b.sales - a.sales)
      .slice(0, 5);
    
    const duration = Date.now() - startTime;
    logger.info('getSalesReport', {
      requestId,
      periodStart: dateFilter.$gte,
      periodEnd: dateFilter.$lte,
      totalSales,
      invoiceCount: invoices.length,
      duration,
    });
    
    res.status(200).json({
      success: true,
      data: {
        period: { startDate: dateFilter.$gte, endDate: dateFilter.$lte },
        summary: {
          totalSales: parseFloat(totalSales.toFixed(2)),
          invoiceCount: invoices.length,
          averageInvoiceValue: parseFloat(averageInvoiceValue.toFixed(2)),
        },
        topItems: topItems.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          revenue: parseFloat(item.revenue.toFixed(2)),
        })),
        topClients: topClients.map((client: any) => ({
          name: client.name,
          sales: parseFloat(client.sales.toFixed(2)),
          invoiceCount: client.invoiceCount,
        })),
      },
    });
  } catch (error) {
    logger.error('getSalesReport', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error generating sales report' });
  }
};

export const getWorkerPerformanceReport = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  try {
    // Get all active workers
    const workers = await Worker.find({ isActive: true });
    
    // Get all payments to calculate commissions
    const payments = await Payment.find({ isActive: true });
    
    // Calculate worker earnings
    const workerStats = workers.map(worker => {
      const workerPayments = payments.filter(p => {
        // You could track payment-to-worker relationship in the model
        return true; // Simplified for now
      });
      
      const totalCommission = (worker.commissionRate / 100) * workerPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        role: worker.role,
        performanceScore: worker.performanceScore,
        totalEarnings: worker.totalEarnings,
        commissionRate: worker.commissionRate,
        joinDate: worker.joinDate,
      };
    });
    
    // Sort by performance and earnings
    const topPerformers = [...workerStats]
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5);
    
    const topEarners = [...workerStats]
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5);
    
    // Summary statistics
    const activeWorkersCount = workers.length;
    const avgPerformanceScore = workers.length > 0 
      ? workers.reduce((sum, w) => sum + w.performanceScore, 0) / workers.length 
      : 0;
    const totalWorkerEarnings = workers.reduce((sum, w) => sum + w.totalEarnings, 0);
    
    const duration = Date.now() - startTime;
    logger.info('getWorkerPerformanceReport', {
      requestId,
      activeWorkers: activeWorkersCount,
      totalEarnings: totalWorkerEarnings,
      duration,
    });
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          activeWorkers: activeWorkersCount,
          averagePerformanceScore: parseFloat(avgPerformanceScore.toFixed(2)),
          totalWorkerEarnings: parseFloat(totalWorkerEarnings.toFixed(2)),
        },
        topPerformers: topPerformers.map(w => ({
          name: w.name,
          role: w.role,
          performanceScore: w.performanceScore,
          totalEarnings: parseFloat(w.totalEarnings.toFixed(2)),
        })),
        topEarners: topEarners.map(w => ({
          name: w.name,
          role: w.role,
          totalEarnings: parseFloat(w.totalEarnings.toFixed(2)),
          commissionRate: w.commissionRate,
        })),
        allWorkers: workerStats.map(w => ({
          name: w.name,
          email: w.email,
          role: w.role,
          performanceScore: w.performanceScore,
          totalEarnings: parseFloat(w.totalEarnings.toFixed(2)),
          commissionRate: w.commissionRate,
        })),
      },
    });
  } catch (error) {
    logger.error('getWorkerPerformanceReport', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error generating worker performance report' });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-index'] as string || 'unknown';
  
  try {
    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    // Today's sales
    const todayInvoices = await Invoice.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const todayInvoiceCount = todayInvoices.length;
    
    // Month sales
    const monthInvoices = await Invoice.find({
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });
    const monthSales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    // Pending payments
    const allInvoices = await Invoice.find();
    const payments = await Payment.find({ isActive: true });
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = totalRevenue - totalPaid;
    
    // Low stock alerts
    const lowStockThreshold = 10;
    const lowStockCount = await Guide.countDocuments({
      quantity: { $gt: 0, $lt: lowStockThreshold }
    });
    
    // Additional stats
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ isActive: true });
    const totalWorkers = await Worker.countDocuments({ isActive: true });
    const activeInvoices = allInvoices.filter(i => i.status !== 'paid').length;
    
    const duration = Date.now() - startTime;
    logger.info('getDashboardStats', {
      requestId,
      todaySales,
      monthSales,
      totalClients,
      totalWorkers,
      duration,
    });
    
    res.status(200).json({
      success: true,
      data: {
        sales: {
          today: parseFloat(todaySales.toFixed(2)),
          todayInvoices: todayInvoiceCount,
          thisMonth: parseFloat(monthSales.toFixed(2)),
          pending: parseFloat(Math.max(0, pendingPayments).toFixed(2)),
        },
        clients: {
          total: totalClients,
          active: activeClients,
        },
        workers: {
          total: totalWorkers,
        },
        invoices: {
          total: allInvoices.length,
          active: activeInvoices,
          paid: allInvoices.filter(i => i.status === 'paid').length,
          overdue: allInvoices.filter(i => i.status === 'overdue').length,
        },
        payments: {
          received: parseFloat(totalPaid.toFixed(2)),
          pending: parseFloat(Math.max(0, pendingPayments).toFixed(2)),
          collectionRate: totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(2) : '0.00',
        },
        inventory: {
          lowStockAlerts: lowStockCount,
        },
      },
    });
  } catch (error) {
    logger.error('getDashboardStats', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
};
