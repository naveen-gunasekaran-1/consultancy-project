import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Guide from '../models/Guide';
import Client from '../models/Client';

export const getStockReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all guides
    const guides = await Guide.find();
    
    // Calculate stock statistics
    const totalGuides = guides.length;
    const lowStockThreshold = 10;
    const lowStockItems = guides.filter(g => g.quantity > 0 && g.quantity < lowStockThreshold);
    const outOfStockItems = guides.filter(g => g.quantity === 0);
    
    // Calculate total inventory value
    const totalValue = guides.reduce((sum, guide) => sum + (guide.price * guide.quantity), 0);
    
    const report = {
      totalGuides,
      lowStockItems: lowStockItems.map(g => ({ 
        name: g.name, 
        quantity: g.quantity,
        class: g.class
      })),
      outOfStockItems: outOfStockItems.map(g => ({ 
        name: g.name,
        class: g.class
      })),
      totalValue: parseFloat(totalValue.toFixed(2)),
    };
    
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating stock report:', error);
    res.status(500).json({ message: 'Error generating stock report', error });
  }
};

export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Date filtering
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate as string);
    }
    
    const query: any = {};
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }
    
    // Get invoices
    const invoices = await Invoice.find(query);
    
    // Calculate stats
    const totalInvoices = invoices.length;
    const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const averageInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
    
    // Count items sold
    const itemStats: any = {};
    invoices.forEach(invoice => {
      invoice.items.forEach((item: any) => {
        const key = item.name || 'Unknown';
        if (!itemStats[key]) {
          itemStats[key] = { name: key, unitsSold: 0, revenue: 0 };
        }
        itemStats[key].unitsSold += item.quantity;
        itemStats[key].revenue += item.subtotal;
      });
    });
    
    // Get top selling guides
    const topSellingGuides = Object.values(itemStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);
    
    const report = {
      period: { startDate, endDate },
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalInvoices,
      averageInvoiceValue: parseFloat(averageInvoiceValue.toFixed(2)),
      topSellingGuides,
    };
    
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ message: 'Error generating sales report', error });
  }
};

export const getPaymentReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all invoices
    const invoices = await Invoice.find();
    
    // Calculate payment statistics
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    // Get payments
    const payments = await Payment.find();
    const totalPaid = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPending = totalRevenue - totalPaid;
    const pendingInvoices = invoices.filter(inv => inv.status !== 'paid').length;
    const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;
    
    const report = {
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      totalPending: parseFloat(totalPending.toFixed(2)),
      pendingInvoices,
      collectionRate: parseFloat(collectionRate.toFixed(2)),
    };
    
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating payment report:', error);
    res.status(500).json({ message: 'Error generating payment report', error });
  }
};

export const getClientReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all clients
    const clients = await Client.find();
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.isActive).length;
    
    // Get invoices grouped by client
    const invoices = await Invoice.find().populate('clientId');
    const clientPurchases: any = {};
    
    invoices.forEach(invoice => {
      const clientId = (invoice.clientId as any)?._id?.toString();
      const clientName = (invoice.clientId as any)?.schoolName || 'Unknown';
      
      if (clientId) {
        if (!clientPurchases[clientId]) {
          clientPurchases[clientId] = { 
            name: clientName, 
            totalPurchases: 0 
          };
        }
        clientPurchases[clientId].totalPurchases += invoice.totalAmount;
      }
    });
    
    // Get top clients
    const topClients = Object.values(clientPurchases)
      .sort((a: any, b: any) => b.totalPurchases - a.totalPurchases)
      .slice(0, 5)
      .map((c: any) => ({
        name: c.name,
        totalPurchases: parseFloat(c.totalPurchases.toFixed(2))
      }));
    
    const report = {
      totalClients,
      activeClients,
      topClients,
    };
    
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating client report:', error);
    res.status(500).json({ message: 'Error generating client report', error });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
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
      date: { $gte: today, $lt: tomorrow }
    });
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    // Month sales
    const monthInvoices = await Invoice.find({
      date: { $gte: monthStart, $lte: monthEnd }
    });
    const monthSales = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    // Pending payments
    const allInvoices = await Invoice.find();
    const payments = await Payment.find({ status: 'PAID' });
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = totalRevenue - totalPaid;
    
    // Low stock alerts
    const lowStockThreshold = 10;
    const lowStockCount = await Guide.countDocuments({
      quantity: { $gt: 0, $lt: lowStockThreshold }
    });
    
    // Additional stats
    const totalClients = await Client.countDocuments();
    const totalWorkers = await require('../models/Worker').default.countDocuments();
    
    const stats = {
      todaySales: parseFloat(todaySales.toFixed(2)),
      monthSales: parseFloat(monthSales.toFixed(2)),
      pendingPayments: parseFloat(Math.max(0, pendingPayments).toFixed(2)),
      lowStockAlerts: lowStockCount,
      totalClients,
      totalWorkers,
    };
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};
