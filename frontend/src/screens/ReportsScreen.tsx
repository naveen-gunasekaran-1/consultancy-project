import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles/Screens';
import { api } from '../services/api';

interface ReportData {
  [key: string]: any;
}

export default function ReportsScreen() {
  const [dashboardStats, setDashboardStats] = useState<ReportData | null>(null);
  const [financialReport, setFinancialReport] = useState<ReportData | null>(null);
  const [salesReport, setSalesReport] = useState<ReportData | null>(null);
  const [workerReport, setWorkerReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [dashboard, financial, sales, worker] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/reports/financial'),
        api.get('/reports/sales'),
        api.get('/reports/worker-performance'),
      ]);

      setDashboardStats(dashboard.data.data);
      setFinancialReport(financial.data.data);
      setSalesReport(sales.data.data);
      setWorkerReport(worker.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, color = '#007AFF', icon = '📊' }: any) => (
    <View style={{
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 12,
      marginHorizontal: 6,
      marginVertical: 6,
      borderLeftWidth: 4,
      borderLeftColor: color,
    }}>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{icon} {label}</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: color }}>{value}</Text>
    </View>
  );

  const renderDashboard = () => dashboardStats && (
    <View>
      {/* Sales Stats */}
      <Text style={[styles.label, { marginLeft: 16, marginTop: 16 }]}>Sales Overview</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <StatCard label="Today's Sales" value={`₹${dashboardStats.sales.today}`} color="#3498db" icon="📈" />
        <StatCard label="This Month" value={`₹${dashboardStats.sales.thisMonth}`} color="#2ecc71" icon="📅" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <StatCard label="Pending" value={`₹${dashboardStats.sales.pending}`} color="#e74c3c" icon="⏳" />
        <StatCard label="Today's Count" value={dashboardStats.sales.todayInvoices} color="#f39c12" icon="📋" />
      </View>

      {/* Client & Worker Stats */}
      <Text style={[styles.label, { marginLeft: 16, marginTop: 16 }]}>Resources</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <StatCard label="Total Clients" value={dashboardStats.clients.total} color="#9b59b6" icon="👥" />
        <StatCard label="Active Clients" value={dashboardStats.clients.active} color="#1abc9c" icon="✓" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <StatCard label="Total Workers" value={dashboardStats.workers.total} color="#e67e22" icon="👨‍💼" />
        <StatCard label="Collection Rate" value={`${dashboardStats.payments.collectionRate}%`} color="#16a085" icon="🎯" />
      </View>

      {/* Invoice Status */}
      <Text style={[styles.label, { marginLeft: 16, marginTop: 16 }]}>Invoice Status</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <StatCard label="Total" value={dashboardStats.invoices.total} color="#34495e" icon="📊" />
        <StatCard label="Paid" value={dashboardStats.invoices.paid} color="#27ae60" icon="✓" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <StatCard label="Active" value={dashboardStats.invoices.active} color="#3498db" icon="📝" />
        <StatCard label="Overdue" value={dashboardStats.invoices.overdue} color="#c0392b" icon="⚠️" />
      </View>
    </View>
  );

  const renderFinancial = () => financialReport && (
    <View style={{ paddingHorizontal: 12 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Revenue</Text>
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#666' }}>Subtotal</Text>
            <Text style={{ fontWeight: '600' }}>₹{financialReport.revenue.subtotal}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#666' }}>Tax</Text>
            <Text style={{ fontWeight: '600' }}>₹{financialReport.revenue.tax}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 'bold', color: '#333' }}>Total</Text>
          <Text style={{ fontWeight: 'bold', color: '#2ecc71', fontSize: 16 }}>₹{financialReport.revenue.total}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Payments</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#666' }}>Received</Text>
          <Text style={{ fontWeight: '600', color: '#27ae60' }}>₹{financialReport.payments.received}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#666' }}>Pending</Text>
          <Text style={{ fontWeight: '600', color: '#e74c3c' }}>₹{financialReport.payments.pending}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#666' }}>Collection Rate</Text>
          <Text style={{ fontWeight: '600', color: '#3498db' }}>{financialReport.payments.collectionRate}%</Text>
        </View>
      </View>

      {/* Payment Methods */}
      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Payment Methods</Text>
        {Object.entries(financialReport.paymentMethods || {}).map(([method, amount]: any) => (
          <View key={method} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#666', textTransform: 'capitalize' }}>{method}</Text>
            <Text style={{ fontWeight: '600' }}>₹{amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSales = () => salesReport && (
    <View style={{ paddingHorizontal: 12 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Summary</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#666' }}>Total Sales</Text>
          <Text style={{ fontWeight: '600', fontSize: 14 }}>₹{salesReport.summary.totalSales}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#666' }}>Invoices</Text>
          <Text style={{ fontWeight: '600' }}>{salesReport.summary.invoiceCount}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#666' }}>Average Value</Text>
          <Text style={{ fontWeight: '600' }}>₹{salesReport.summary.averageInvoiceValue}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Top Items</Text>
        {salesReport.topItems.map((item: any, idx: number) => (
          <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#333', flex: 1 }} numberOfLines={1}>{item.name}</Text>
            <Text style={{ color: '#666', marginHorizontal: 8 }}>Qty: {item.quantity}</Text>
            <Text style={{ fontWeight: '600' }}>₹{item.revenue}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Top Clients</Text>
        {salesReport.topClients.map((client: any, idx: number) => (
          <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#333', flex: 1 }} numberOfLines={1}>{client.name}</Text>
            <Text style={{ color: '#666', marginHorizontal: 8 }}>×{client.invoiceCount}</Text>
            <Text style={{ fontWeight: '600' }}>₹{client.sales}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderWorker = () => workerReport && (
    <View style={{ paddingHorizontal: 12 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Performance Summary</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#666' }}>Active Workers</Text>
          <Text style={{ fontWeight: '600' }}>{workerReport.summary.activeWorkers}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#666' }}>Avg Performance</Text>
          <Text style={{ fontWeight: '600', color: '#3498db' }}>{workerReport.summary.averagePerformanceScore}/100</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#666' }}>Total Earnings</Text>
          <Text style={{ fontWeight: '600', color: '#27ae60' }}>₹{workerReport.summary.totalWorkerEarnings}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Top Performers</Text>
        {workerReport.topPerformers.map((worker: any, idx: number) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#333', fontWeight: '600' }}>{worker.name}</Text>
              <Text style={{ color: '#666', fontSize: 12 }}>{worker.role}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
              <Text style={{ color: '#666', fontSize: 12 }}>Performance: {worker.performanceScore}</Text>
              <Text style={{ color: '#27ae60', fontWeight: '600' }}>₹{worker.totalEarnings}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading && !dashboardStats) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
          }}
          onPress={fetchReports}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
      }}>
        {['dashboard', 'financial', 'sales', 'worker'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: activeTab === tab ? 2 : 0,
              borderBottomColor: '#007AFF',
            }}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={{
              fontWeight: activeTab === tab ? '600' : '400',
              color: activeTab === tab ? '#007AFF' : '#999',
              fontSize: 12,
              textTransform: 'capitalize',
            }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'sales' && renderSales()}
        {activeTab === 'worker' && renderWorker()}
      </ScrollView>
    </View>
  );
}
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Reports & Analytics</Text>

      {/* Stock Report */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Stock Report</Text>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Total Guides:</Text>
          <Text style={styles.value}>{stockReport?.totalGuides || 0}</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Total Value:</Text>
          <Text style={styles.value}>₹{stockReport?.totalValue || 0}</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Low Stock Items:</Text>
          <Text style={[styles.value, styles.warning]}>
            {stockReport?.lowStockItems?.length || 0}
          </Text>
        </View>
      </View>

      {/* Sales Report */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Sales Report</Text>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Total Sales:</Text>
          <Text style={styles.value}>₹{salesReport?.totalSales || 0}</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Total Invoices:</Text>
          <Text style={styles.value}>{salesReport?.totalInvoices || 0}</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Avg Invoice Value:</Text>
          <Text style={styles.value}>
            ₹{salesReport?.averageInvoiceValue || 0}
          </Text>
        </View>
      </View>

      {/* Payment Report */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment Report</Text>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Total Paid:</Text>
          <Text style={[styles.value, styles.success]}>
            ₹{paymentReport?.totalPaid || 0}
          </Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Total Pending:</Text>
          <Text style={[styles.value, styles.warning]}>
            ₹{paymentReport?.totalPending || 0}
          </Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.label}>Collection Rate:</Text>
          <Text style={styles.value}>{paymentReport?.collectionRate || 0}%</Text>
        </View>
      </View>

      {/* AI Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 AI Insights</Text>
        {aiInsights?.insights?.map((insight: string, index: number) => (
          <Text key={index} style={styles.insight}>
            • {insight}
          </Text>
        ))}
      </View>

      <Text style={styles.note}>
        Note: All data is placeholder/mock data for demonstration
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
    textAlign: Platform.OS === 'web' ? 'center' : undefined,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 10,
    padding: 15,
    borderRadius: 10,
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    width: Platform.OS === 'web' ? '95%' : undefined,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  success: {
    color: '#4CAF50',
  },
  warning: {
    color: '#FF9800',
  },
  insight: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  note: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    padding: 20,
  },
});

export default ReportsScreen;
