import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

interface Worker {
  name: string;
  email: string;
  role: string;
  performanceScore: number;
  totalEarnings: number;
  commissionRate: number;
}

interface WorkerPerformanceData {
  summary: {
    activeWorkers: number;
    averagePerformanceScore: number;
    totalWorkerEarnings: number;
  };
  topPerformers: Array<{
    name: string;
    role: string;
    performanceScore: number;
    totalEarnings: number;
  }>;
  topEarners: Array<{
    name: string;
    role: string;
    totalEarnings: number;
    commissionRate: number;
  }>;
  allWorkers: Worker[];
}

interface FinancialReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    subtotal: number;
    tax: number;
    total: number;
  };
  payments: {
    received: number;
    pending: number;
    collectionRate: string;
  };
  invoiceStatus: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
  paymentMethods: Record<string, number>;
  invoiceCount: number;
  paymentCount: number;
}

const ReportsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'financial' | 'worker'>('financial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [financialData, setFinancialData] = useState<FinancialReportData | null>(null);
  const [workerData, setWorkerData] = useState<WorkerPerformanceData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchFinancialReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002/api'}/reports/financial?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setFinancialData(result.data);
      } else {
        setError('Failed to load financial report');
      }
    } catch (error) {
      console.error('Failed to fetch financial report:', error);
      setError('Failed to load financial report');
    }
    setLoading(false);
  }, [dateRange]);

  const fetchWorkerPerformance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002/api'}/reports/worker-performance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setWorkerData(result.data);
      } else {
        setError('Failed to load worker performance data');
      }
    } catch (error) {
      console.error('Failed to fetch worker performance:', error);
      setError('Failed to load worker performance data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'financial') {
      fetchFinancialReport();
    } else {
      fetchWorkerPerformance();
    }
  }, [activeTab, dateRange, fetchFinancialReport, fetchWorkerPerformance]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Reports & Analytics</h1>
        </header>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', margin: '10px 32px', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '0 32px' }}>
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
              onClick={() => setActiveTab('financial')}
            >
              Financial Report
            </button>
            <button
              className={`tab-btn ${activeTab === 'worker' ? 'active' : ''}`}
              onClick={() => setActiveTab('worker')}
            >
              Worker Performance
            </button>
          </div>

          {activeTab === 'financial' && (
            <div className="report-section">
              <div className="date-filter">
                <label>
                  Start Date:
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  />
                </label>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : financialData ? (
                <>
                  <div className="report-cards">
                    <div className="report-card">
                      <h3>Revenue Summary</h3>
                      <div className="metric">
                        <span className="metric-label">Subtotal:</span>
                        <span className="metric-value">₹{financialData.revenue.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Tax:</span>
                        <span className="metric-value">₹{financialData.revenue.tax.toLocaleString()}</span>
                      </div>
                      <div className="metric total">
                        <span className="metric-label">Total Revenue:</span>
                        <span className="metric-value">₹{financialData.revenue.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="report-card">
                      <h3>Payment Status</h3>
                      <div className="metric">
                        <span className="metric-label">Received:</span>
                        <span className="metric-value success">₹{financialData.payments.received.toLocaleString()}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Pending:</span>
                        <span className="metric-value warning">₹{financialData.payments.pending.toLocaleString()}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Collection Rate:</span>
                        <span className="metric-value">{financialData.payments.collectionRate}%</span>
                      </div>
                    </div>

                    <div className="report-card">
                      <h3>Invoice Status</h3>
                      <div className="metric">
                        <span className="metric-label">Draft:</span>
                        <span className="metric-value">{financialData.invoiceStatus.draft}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Sent:</span>
                        <span className="metric-value">{financialData.invoiceStatus.sent}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Paid:</span>
                        <span className="metric-value success">{financialData.invoiceStatus.paid}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Overdue:</span>
                        <span className="metric-value danger">{financialData.invoiceStatus.overdue}</span>
                      </div>
                    </div>

                    <div className="report-card">
                      <h3>Payment Methods</h3>
                      {Object.entries(financialData.paymentMethods).map(([method, amount]) => (
                        <div key={method} className="metric">
                          <span className="metric-label">{method}:</span>
                          <span className="metric-value">₹{amount.toLocaleString()}</span>
                        </div>
                      ))}
                      {Object.keys(financialData.paymentMethods).length === 0 && (
                        <p style={{ color: '#999', fontSize: '14px' }}>No payment methods recorded</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p>No data available</p>
              )}
            </div>
          )}

          {activeTab === 'worker' && (
            <div className="report-section">
              {loading ? (
                <p>Loading...</p>
              ) : workerData ? (
                <>
                  <div className="report-cards">
                    <div className="report-card">
                      <h3>Summary</h3>
                      <div className="metric">
                        <span className="metric-label">Active Workers:</span>
                        <span className="metric-value">{workerData.summary.activeWorkers}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Avg Performance:</span>
                        <span className="metric-value">{workerData.summary.averagePerformanceScore.toFixed(1)}</span>
                      </div>
                      <div className="metric total">
                        <span className="metric-label">Total Earnings:</span>
                        <span className="metric-value">₹{workerData.summary.totalWorkerEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="report-tables">
                    <div className="report-table-section">
                      <h3>Top Performers (by score)</h3>
                      <table className="guides-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Performance Score</th>
                            <th>Total Earnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workerData.topPerformers.map((worker, idx) => (
                            <tr key={idx}>
                              <td>{worker.name}</td>
                              <td>{worker.role}</td>
                              <td>
                                <strong style={{ color: worker.performanceScore >= 80 ? '#22C55E' : '#F59E0B' }}>
                                  {worker.performanceScore}
                                </strong>
                              </td>
                              <td>₹{worker.totalEarnings.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="report-table-section">
                      <h3>Top Earners</h3>
                      <table className="guides-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Total Earnings</th>
                            <th>Commission Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workerData.topEarners.map((worker, idx) => (
                            <tr key={idx}>
                              <td>{worker.name}</td>
                              <td>{worker.role}</td>
                              <td>
                                <strong style={{ color: '#22C55E' }}>₹{worker.totalEarnings.toLocaleString()}</strong>
                              </td>
                              <td>{worker.commissionRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="report-table-section">
                      <h3>All Workers</h3>
                      <table className="guides-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Performance Score</th>
                            <th>Total Earnings</th>
                            <th>Commission Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workerData.allWorkers.map((worker, idx) => (
                            <tr key={idx}>
                              <td>{worker.name}</td>
                              <td>{worker.email}</td>
                              <td>{worker.role}</td>
                              <td>{worker.performanceScore}</td>
                              <td>₹{worker.totalEarnings.toLocaleString()}</td>
                              <td>{worker.commissionRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <p>No data available</p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .tabs-container {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--border);
        }

        .tab-btn {
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: var(--text-secondary);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: -2px;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .report-section {
          margin-bottom: 32px;
        }

        .date-filter {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px;
          background: var(--surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .date-filter label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .date-filter input {
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 14px;
        }

        .report-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .report-card {
          background: var(--surface);
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .report-card h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border);
          padding-bottom: 8px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }

        .metric:last-child {
          border-bottom: none;
        }

        .metric.total {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 2px solid var(--border);
          font-weight: 600;
        }

        .metric-label {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .metric-value {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .metric-value.success {
          color: #22C55E;
        }

        .metric-value.warning {
          color: #F59E0B;
        }

        .metric-value.danger {
          color: #EF4444;
        }

        .report-tables {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .report-table-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default ReportsScreen;
