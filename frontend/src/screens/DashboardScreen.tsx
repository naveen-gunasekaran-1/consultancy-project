import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { reportAPI } from '../services/api';

const DashboardScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await reportAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // TODO: Show error message
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.wrapper}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.statValue}>₹{stats?.todaySales || 0}</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.statValue}>₹{stats?.monthSales || 0}</Text>
          <Text style={styles.statLabel}>Month Sales</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
          <Text style={styles.statValue}>₹{stats?.pendingPayments || 0}</Text>
          <Text style={styles.statLabel}>Pending Payments</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#F44336' }]}>
          <Text style={styles.statValue}>{stats?.lowStockAlerts || 0}</Text>
          <Text style={styles.statLabel}>Low Stock Alerts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Billing')}
        >
          <Text style={styles.actionButtonText}>Create Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Stock')}
        >
          <Text style={styles.actionButtonText}>Manage Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.actionButtonText}>View Reports</Text>
        </TouchableOpacity>
      </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    alignItems: Platform.OS === 'web' ? 'center' : undefined,
  },
  wrapper: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 0,
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: Platform.OS === 'web' ? 'space-between' : undefined,
  },
  statCard: {
    width: Platform.OS === 'web' ? '23%' : '48%',
    minWidth: Platform.OS === 'web' ? 200 : undefined,
    margin: '1%',
    padding: 20,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DashboardScreen;
