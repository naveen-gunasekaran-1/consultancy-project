import { Request, Response } from 'express';
import invoiceRepository from '../repositories/invoiceRepository';
import paymentRepository from '../repositories/paymentRepository';
import guideRepository from '../repositories/guideRepository';
import clientRepository from '../repositories/clientRepository';
import workerRepository from '../repositories/workerRepository';
import { logger } from '../utils/logger';

const inDateRange = (value: string, start: Date, end: Date): boolean => {
  const date = new Date(value);
  return date >= start && date <= end;
};

const getDateRange = (startDate?: string, endDate?: string): { start: Date; end: Date } => {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  return { start, end };
};

export const getFinancialReport = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const { startDate, endDate } = req.query;

  try {
    const { start, end } = getDateRange(startDate as string | undefined, endDate as string | undefined);

    const invoices = invoiceRepository.findAll().filter((invoice) => inDateRange(invoice.createdAt, start, end));

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
    const totalSubtotal = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);

    const payments = paymentRepository.findAll().filter((payment) => inDateRange(payment.paymentDate, start, end));
    const totalPaymentsReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = totalRevenue - totalPaymentsReceived;

    const draftInvoices = invoices.filter((i) => i.status === 'draft').length;
    const sentInvoices = invoices.filter((i) => i.status === 'sent').length;
    const paidInvoices = invoices.filter((i) => i.status === 'paid').length;
    const overdueInvoices = invoices.filter((i) => i.status === 'overdue').length;

    const paymentMethodBreakdown: Record<string, number> = {};
    payments.forEach((p) => {
      if (!paymentMethodBreakdown[p.paymentMethod]) {
        paymentMethodBreakdown[p.paymentMethod] = 0;
      }
      paymentMethodBreakdown[p.paymentMethod] += p.amount;
    });

    const duration = Date.now() - startTime;
    logger.info('getFinancialReport', {
      requestId,
      periodStart: start,
      periodEnd: end,
      totalRevenue,
      totalPayments: totalPaymentsReceived,
      duration,
    });

    res.status(200).json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
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
    const { start, end } = getDateRange(startDate as string | undefined, endDate as string | undefined);

    const invoices = invoiceRepository.findAll().filter((invoice) => inDateRange(invoice.createdAt, start, end));

    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const averageInvoiceValue = invoices.length > 0 ? totalSales / invoices.length : 0;

    const itemStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    invoices.forEach((invoice) => {
      invoice.items.forEach((item: any) => {
        const key = item.guideName || 'Unknown';
        if (!itemStats[key]) {
          itemStats[key] = { name: key, quantity: 0, revenue: 0 };
        }
        itemStats[key].quantity += item.quantity;
        itemStats[key].revenue += item.total;
      });
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const clientSales: Record<string, { name: string; sales: number; invoiceCount: number }> = {};
    invoices.forEach((invoice) => {
      const clientId = String(invoice.clientId);
      const client = clientRepository.findById(invoice.clientId);
      const clientName = client?.name || 'Unknown';

      if (!clientSales[clientId]) {
        clientSales[clientId] = { name: clientName, sales: 0, invoiceCount: 0 };
      }
      clientSales[clientId].sales += invoice.total;
      clientSales[clientId].invoiceCount += 1;
    });

    const topClients = Object.values(clientSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    const duration = Date.now() - startTime;
    logger.info('getSalesReport', {
      requestId,
      periodStart: start,
      periodEnd: end,
      totalSales,
      invoiceCount: invoices.length,
      duration,
    });

    res.status(200).json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        summary: {
          totalSales: parseFloat(totalSales.toFixed(2)),
          invoiceCount: invoices.length,
          averageInvoiceValue: parseFloat(averageInvoiceValue.toFixed(2)),
        },
        topItems: topItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          revenue: parseFloat(item.revenue.toFixed(2)),
        })),
        topClients: topClients.map((client) => ({
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
    const workers = workerRepository.findAll();

    const workerStats = workers.map((worker) => ({
      _id: String(worker.id),
      name: worker.name,
      email: worker.email,
      role: worker.role,
      performanceScore: worker.performanceScore,
      totalEarnings: worker.totalEarnings,
      commissionRate: worker.commissionRate,
      joinDate: worker.joinDate,
    }));

    const topPerformers = [...workerStats]
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5);

    const topEarners = [...workerStats]
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5);

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
        topPerformers: topPerformers.map((w) => ({
          name: w.name,
          role: w.role,
          performanceScore: w.performanceScore,
          totalEarnings: parseFloat(w.totalEarnings.toFixed(2)),
        })),
        topEarners: topEarners.map((w) => ({
          name: w.name,
          role: w.role,
          totalEarnings: parseFloat(w.totalEarnings.toFixed(2)),
          commissionRate: w.commissionRate,
        })),
        allWorkers: workerStats.map((w) => ({
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
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59);

    const allInvoices = invoiceRepository.findAll();

    const todayInvoices = allInvoices.filter((inv) => inDateRange(inv.createdAt, todayStart, todayEnd));
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const todayInvoiceCount = todayInvoices.length;

    const monthInvoices = allInvoices.filter((inv) => inDateRange(inv.createdAt, monthStart, monthEnd));
    const monthSales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const payments = paymentRepository.findAll();
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = totalRevenue - totalPaid;

    const lowStockCount = guideRepository.getLowStock().length;

    const totalClients = clientRepository.count();
    const totalWorkers = workerRepository.count();
    const activeInvoices = allInvoices.filter((i) => i.status !== 'paid').length;

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
          active: totalClients,
        },
        workers: {
          total: totalWorkers,
        },
        invoices: {
          total: allInvoices.length,
          active: activeInvoices,
          paid: allInvoices.filter((i) => i.status === 'paid').length,
          overdue: allInvoices.filter((i) => i.status === 'overdue').length,
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
