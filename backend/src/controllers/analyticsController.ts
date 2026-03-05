import { Request, Response } from 'express';
import invoiceRepository from '../repositories/invoiceRepository';
import paymentRepository from '../repositories/paymentRepository';
import guideRepository from '../repositories/guideRepository';
import clientRepository from '../repositories/clientRepository';
import { logger } from '../utils/logger';

const inDateRange = (value: string, start: Date, end: Date): boolean => {
  const date = new Date(value);
  return date >= start && date <= end;
};

// Get dashboard analytics summary
export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const allInvoices = invoiceRepository.findAll();

    const todayInvoices = allInvoices.filter((inv) => inDateRange(inv.createdAt, today, new Date()));
    const salesToday = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const monthInvoices = allInvoices.filter((inv) => inDateRange(inv.createdAt, startOfMonth, new Date()));
    const salesThisMonth = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalInvoices = allInvoices.length;
    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    res.status(200).json({
      success: true,
      data: {
        salesToday,
        salesThisMonth,
        totalRevenue,
        totalInvoices,
        averageInvoiceValue,
      },
    });
  } catch (error: any) {
    logger.error('Error getting dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
      error: error.message,
    });
  }
};

// Get sales trend data
export const getSalesTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'week' } = req.query;
    const today = new Date();

    let startDate: Date;
    let groupBy: 'day' | 'month';

    if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      groupBy = 'day';
    } else {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      groupBy = 'month';
    }

    const invoices = invoiceRepository
      .findAll()
      .filter((invoice) => new Date(invoice.createdAt) >= startDate)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const salesByDate: Record<string, number> = {};

    invoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const dateKey =
        groupBy === 'day'
          ? date.toISOString().split('T')[0]
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      salesByDate[dateKey] = (salesByDate[dateKey] || 0) + invoice.total;
    });

    const trend = Object.entries(salesByDate).map(([date, sales]) => ({
      date,
      sales: Math.round(sales * 100) / 100,
    }));

    res.status(200).json({
      success: true,
      data: { period, trend },
    });
  } catch (error: any) {
    logger.error('Error getting sales trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales trend',
      error: error.message,
    });
  }
};

// Get top selling products/guides
export const getTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const invoices = invoiceRepository.findAll();

    const guideSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const guideId = String(item.guideId);
        if (!guideSales[guideId]) {
          guideSales[guideId] = {
            name: item.guideName || 'Unknown',
            quantity: 0,
            revenue: 0,
          };
        }
        guideSales[guideId].quantity += item.quantity;
        guideSales[guideId].revenue += item.total;
      });
    });

    const topProducts = Object.entries(guideSales)
      .map(([id, data]) => ({
        guideId: id,
        name: data.name,
        quantity: data.quantity,
        revenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, Number(limit));

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error: any) {
    logger.error('Error getting top products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top products',
      error: error.message,
    });
  }
};

// Get top clients by revenue
export const getTopClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const invoices = invoiceRepository.findAll();

    const clientStats: Record<string, { name: string; email: string; invoiceCount: number; totalRevenue: number }> = {};

    invoices.forEach((invoice) => {
      const clientId = String(invoice.clientId);
      const client = clientRepository.findById(invoice.clientId);
      if (!client) {
        return;
      }

      if (!clientStats[clientId]) {
        clientStats[clientId] = {
          name: client.name || 'Unknown',
          email: client.email || '',
          invoiceCount: 0,
          totalRevenue: 0,
        };
      }
      clientStats[clientId].invoiceCount += 1;
      clientStats[clientId].totalRevenue += invoice.total;
    });

    const topClients = Object.entries(clientStats)
      .map(([id, data]) => ({
        clientId: id,
        name: data.name,
        email: data.email,
        invoiceCount: data.invoiceCount,
        totalRevenue: Math.round(data.totalRevenue * 100) / 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, Number(limit));

    res.status(200).json({
      success: true,
      data: topClients,
    });
  } catch (error: any) {
    logger.error('Error getting top clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top clients',
      error: error.message,
    });
  }
};

// Get payment insights
export const getPaymentInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = invoiceRepository.findAll();

    const statusCounts = {
      paid: invoices.filter((i) => i.status === 'paid').length,
      pending: invoices.filter((i) => ['draft', 'sent', 'overdue'].includes(i.status)).length,
      overdue: invoices.filter((i) => i.status === 'overdue').length,
    };

    const payments = paymentRepository.findAll();
    const paymentMethods: Record<string, number> = {};

    payments.forEach((payment) => {
      const method = payment.paymentMethod.toLowerCase();
      paymentMethods[method] = (paymentMethods[method] || 0) + payment.amount;
    });

    const totalPaidAmount = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    const totalPendingAmount = invoices
      .filter((i) => ['draft', 'sent', 'overdue'].includes(i.status))
      .reduce((sum, i) => sum + i.total, 0);

    res.status(200).json({
      success: true,
      data: {
        statusCounts,
        totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
        totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
        paymentMethods: Object.entries(paymentMethods).map(([method, amount]) => ({
          method,
          amount: Math.round(amount * 100) / 100,
        })),
      },
    });
  } catch (error: any) {
    logger.error('Error getting payment insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment insights',
      error: error.message,
    });
  }
};

// Get inventory insights
export const getInventoryInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const guides = guideRepository.findAll();
    const totalProducts = guides.length;

    const invoices = invoiceRepository.findAll();

    const guideSales: Record<string, { name: string; quantity: number }> = {};

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const guideId = String(item.guideId);
        if (!guideSales[guideId]) {
          guideSales[guideId] = {
            name: item.guideName || 'Unknown',
            quantity: 0,
          };
        }
        guideSales[guideId].quantity += item.quantity;
      });
    });

    const mostSoldProduct = Object.entries(guideSales).sort(([, a], [, b]) => b.quantity - a.quantity)[0];

    const lowStockItems = guideRepository
      .getLowStock()
      .map((g) => ({ name: g.name, stock: g.stock, minStock: g.minStock }));

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems.slice(0, 5),
        mostSoldProduct: mostSoldProduct
          ? {
              name: mostSoldProduct[1].name,
              quantity: mostSoldProduct[1].quantity,
            }
          : null,
      },
    });
  } catch (error: any) {
    logger.error('Error getting inventory insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory insights',
      error: error.message,
    });
  }
};
