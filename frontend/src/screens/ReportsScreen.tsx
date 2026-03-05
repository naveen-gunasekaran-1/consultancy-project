import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { reportAPI, aiAPI } from '../services/api';

const ReportsScreen = () => {
  const [stockReport, setStockReport] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [paymentReport, setPaymentReport] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [stock, sales, payment, ai] = await Promise.all([
        reportAPI.getStockReport(),
        reportAPI.getSalesReport(),
        reportAPI.getPaymentReport(),
        aiAPI.getSalesTrends(),
      ]);

      setStockReport(stock.data.data);
      setSalesReport(sales.data.data);
      setPaymentReport(payment.data.data);
      setAiInsights(ai.data.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
      Alert.alert('Error', 'Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
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
