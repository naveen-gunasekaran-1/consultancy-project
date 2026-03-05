import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './AnalyticsDashboard.css';

interface DashboardMetrics {
  salesToday: number;
  salesThisMonth: number;
  totalRevenue: number;
  totalInvoices: number;
  averageInvoiceValue: number;
}

interface TopProduct {
  guideId: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface TopClient {
  clientId: string;
  name: string;
  email: string;
  invoiceCount: number;
  totalRevenue: number;
}

interface PaymentInsights {
  statusCounts: {
    paid: number;
    pending: number;
    overdue: number;
  };
  totalPaidAmount: number;
  totalPendingAmount: number;
  paymentMethods: Array<{ method: string; amount: number }>;
}

interface InventoryInsights {
  totalProducts: number;
  lowStockCount: number;
  lowStockItems: Array<{ name: string; price: number }>;
  mostSoldProduct: { name: string; quantity: number } | null;
}

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [paymentInsights, setPaymentInsights] = useState<PaymentInsights | null>(null);
  const [inventoryInsights, setInventoryInsights] = useState<InventoryInsights | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month'>('week');

  const fetchAllAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [
        dashboardRes,
        trendRes,
        productsRes,
        clientsRes,
        paymentsRes,
        inventoryRes
      ] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getSalesTrend(trendPeriod),
        analyticsAPI.getTopProducts(5),
        analyticsAPI.getTopClients(5),
        analyticsAPI.getPaymentInsights(),
        analyticsAPI.getInventoryInsights()
      ]);

      setMetrics(dashboardRes.data.data);
      setSalesTrend(trendRes.data.data.trend);
      setTopProducts(productsRes.data.data);
      setTopClients(clientsRes.data.data);
      setPaymentInsights(paymentsRes.data.data);
      setInventoryInsights(inventoryRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [trendPeriod]);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    if (trendPeriod === 'week') {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } else {
      const [year, month] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div className="analytics-loading">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content analytics-dashboard">
        <header className="analytics-header">
          <h1>📊 Sales Analytics Dashboard</h1>
          <button className="refresh-btn" onClick={fetchAllAnalytics}>
            🔄 Refresh
          </button>
        </header>

        {/* Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <h3>Total Revenue</h3>
              <p className="metric-value">{formatCurrency(metrics?.totalRevenue || 0)}</p>
              <span className="metric-label">All Time</span>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-icon">📅</div>
            <div className="metric-content">
              <h3>Sales This Month</h3>
              <p className="metric-value">{formatCurrency(metrics?.salesThisMonth || 0)}</p>
              <span className="metric-label">Current Month</span>
            </div>
          </div>

          <div className="metric-card info">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <h3>Sales Today</h3>
              <p className="metric-value">{formatCurrency(metrics?.salesToday || 0)}</p>
              <span className="metric-label">Today's Performance</span>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon">📄</div>
            <div className="metric-content">
              <h3>Total Invoices</h3>
              <p className="metric-value">{metrics?.totalInvoices || 0}</p>
              <span className="metric-label">Generated</span>
            </div>
          </div>

          <div className="metric-card secondary">
            <div className="metric-icon">💵</div>
            <div className="metric-content">
              <h3>Average Invoice</h3>
              <p className="metric-value">{formatCurrency(metrics?.averageInvoiceValue || 0)}</p>
              <span className="metric-label">Per Invoice</span>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h2>Sales Trend</h2>
            <div className="chart-controls">
              <button
                className={trendPeriod === 'week' ? 'active' : ''}
                onClick={() => setTrendPeriod('week')}
              >
                Last 7 Days
              </button>
              <button
                className={trendPeriod === 'month' ? 'active' : ''}
                onClick={() => setTrendPeriod('month')}
              >
                Last 12 Months
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#6B7280"
              />
              <YAxis
                tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                stroke="#6B7280"
              />
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                labelFormatter={(label: any) => formatDate(String(label))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#007AFF"
                strokeWidth={3}
                dot={{ fill: '#007AFF', r: 4 }}
                activeDot={{ r: 6 }}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column Layout */}
        <div className="analytics-grid">
          {/* Top Products */}
          <div className="analytics-panel">
            <h2>🏆 Top Selling Products</h2>
            {topProducts.length > 0 ? (
              <div className="top-items-list">
                {topProducts.map((product, index) => (
                  <div key={product.guideId} className="top-item">
                    <div className="item-rank">{index + 1}</div>
                    <div className="item-details">
                      <h4>{product.name}</h4>
                      <p>{product.quantity} units sold</p>
                    </div>
                    <div className="item-revenue">{formatCurrency(product.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No sales data available</p>
            )}
          </div>

          {/* Top Clients */}
          <div className="analytics-panel">
            <h2>👥 Top Clients</h2>
            {topClients.length > 0 ? (
              <div className="top-items-list">
                {topClients.map((client, index) => (
                  <div key={client.clientId} className="top-item">
                    <div className="item-rank">{index + 1}</div>
                    <div className="item-details">
                      <h4>{client.name}</h4>
                      <p>{client.invoiceCount} invoices</p>
                    </div>
                    <div className="item-revenue">{formatCurrency(client.totalRevenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No client data available</p>
            )}
          </div>
        </div>

        {/* Payment Insights */}
        <div className="analytics-grid">
          <div className="analytics-panel">
            <h2>💳 Payment Insights</h2>
            <div className="payment-overview">
              <div className="payment-stat">
                <span className="stat-label">Paid Invoices</span>
                <span className="stat-value success">{paymentInsights?.statusCounts.paid || 0}</span>
                <span className="stat-amount">{formatCurrency(paymentInsights?.totalPaidAmount || 0)}</span>
              </div>
              <div className="payment-stat">
                <span className="stat-label">Pending Invoices</span>
                <span className="stat-value warning">{paymentInsights?.statusCounts.pending || 0}</span>
                <span className="stat-amount">{formatCurrency(paymentInsights?.totalPendingAmount || 0)}</span>
              </div>
              <div className="payment-stat">
                <span className="stat-label">Overdue Invoices</span>
                <span className="stat-value danger">{paymentInsights?.statusCounts.overdue || 0}</span>
              </div>
            </div>

            <h3 style={{ marginTop: '20px', fontSize: '16px' }}>Payment Methods</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={paymentInsights?.paymentMethods || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="method" stroke="#6B7280" />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  stroke="#6B7280"
                />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#007AFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inventory Insights */}
          <div className="analytics-panel">
            <h2>📦 Inventory Insights</h2>
            <div className="inventory-stats">
              <div className="inventory-card">
                <div className="inventory-icon">📊</div>
                <div>
                  <h4>Total Products</h4>
                  <p className="inventory-value">{inventoryInsights?.totalProducts || 0}</p>
                </div>
              </div>
              <div className="inventory-card warning">
                <div className="inventory-icon">⚠️</div>
                <div>
                  <h4>Low Stock Items</h4>
                  <p className="inventory-value">{inventoryInsights?.lowStockCount || 0}</p>
                </div>
              </div>
              {inventoryInsights?.mostSoldProduct && (
                <div className="inventory-card success">
                  <div className="inventory-icon">🌟</div>
                  <div>
                    <h4>Most Sold Product</h4>
                    <p className="inventory-product">{inventoryInsights.mostSoldProduct.name}</p>
                    <p className="inventory-quantity">{inventoryInsights.mostSoldProduct.quantity} units</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
