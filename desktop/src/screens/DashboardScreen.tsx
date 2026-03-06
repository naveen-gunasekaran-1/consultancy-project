import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, invoiceAPI, inventoryAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './DashboardScreen.css';

interface DashboardStats {
  salesToday: number;
  salesThisMonth: number;
  totalRevenue: number;
  totalInvoices: number;
  averageInvoiceValue: number;
}

interface RecentInvoice {
  _id: string;
  id: number;
  invoiceNumber: string;
  clientId: any;
  total: number;
  status: string;
  createdAt: string;
}

interface LowStockItem {
  id: number;
  guideName: string;
  stockQuantity: number;
  reorderLevel: number;
  status: string;
}

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    salesToday: 0,
    salesThisMonth: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    averageInvoiceValue: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, invoicesRes, lowStockRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        invoiceAPI.getAll(),
        inventoryAPI.getLowStock().catch(() => ({ data: { data: [] } })),
      ]);

      setStats(analyticsRes.data.data || {
        salesToday: 0,
        salesThisMonth: 0,
        totalRevenue: 0,
        totalInvoices: 0,
        averageInvoiceValue: 0,
      });

      const allInvoices = invoicesRes.data.data || [];
      const recent = allInvoices
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentInvoices(recent);

      setLowStockItems(lowStockRes.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getClientName = (clientRef: any): string => {
    if (typeof clientRef === 'string') return clientRef;
    return clientRef?.name || 'Unknown Client';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'status-badge status-paid';
      case 'sent':
        return 'status-badge status-pending';
      case 'draft':
        return 'status-badge status-draft';
      case 'overdue':
        return 'status-badge status-overdue';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <span className="user-name">Welcome, {user?.fullName || 'User'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', margin: '10px 0', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon revenue-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Sales Today</h3>
                  <p className="stat-value">₹{stats.salesToday.toLocaleString()}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon clients-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Sales This Month</h3>
                  <p className="stat-value">₹{stats.salesThisMonth.toLocaleString()}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon invoices-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v5h5" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Total Invoices</h3>
                  <p className="stat-value">{stats.totalInvoices}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon guides-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-widgets">
              <div className="widget recent-invoices">
                <div className="widget-header">
                  <h2>Recent Invoices</h2>
                  <button onClick={() => navigate('/invoices')} className="view-all-btn">
                    View All
                  </button>
                </div>
                <div className="widget-content">
                  {recentInvoices.length === 0 ? (
                    <p className="empty-state">No invoices found</p>
                  ) : (
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Client</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentInvoices.map((invoice) => (
                          <tr key={invoice._id || invoice.id}>
                            <td>{invoice.invoiceNumber}</td>
                            <td>{getClientName(invoice.clientId)}</td>
                            <td>₹{invoice.total.toLocaleString()}</td>
                            <td>
                              <span className={getStatusBadgeClass(invoice.status)}>
                                {invoice.status}
                              </span>
                            </td>
                            <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="widget low-stock-alerts">
                <div className="widget-header">
                  <h2>Low Stock Alerts</h2>
                  <button onClick={() => navigate('/inventory')} className="view-all-btn">
                    View All
                  </button>
                </div>
                <div className="widget-content">
                  {lowStockItems.length === 0 ? (
                    <p className="empty-state">All items are well stocked</p>
                  ) : (
                    <div className="alert-list">
                      {lowStockItems.map((item) => (
                        <div key={item.id} className="alert-item">
                          <div className="alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </div>
                          <div className="alert-details">
                            <strong>{item.guideName}</strong>
                            <span className="alert-message">
                              Stock: {item.stockQuantity} (Reorder at: {item.reorderLevel})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button onClick={() => navigate('/invoices/create')} className="action-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Invoice
                </button>
                <button onClick={() => navigate('/clients/create')} className="action-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  Add Client
                </button>
                <button onClick={() => navigate('/guides/create')} className="action-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                  Add Guide
                </button>
                <button onClick={() => navigate('/orders')} className="action-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  View Orders
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;
