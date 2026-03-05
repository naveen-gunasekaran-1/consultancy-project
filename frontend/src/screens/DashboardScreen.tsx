import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from '../styles/Screens';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  sales: any;
  clients: any;
  workers: any;
  invoices: any;
  payments: any;
  inventory: any;
}

export default function DashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/dashboard');
      setStats(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatWidget = ({ icon, label, value, subtext, color }: any) => (
    <View style={{
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 14,
      marginHorizontal: 6,
      marginVertical: 8,
      borderLeftWidth: 5,
      borderLeftColor: color,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    }}>
      <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color }}>{value}</Text>
      {subtext && <Text style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>{subtext}</Text>}
    </View>
  );

  const QuickActionButton = ({ icon, label, onPress }: any) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginRight: 10,
        alignItems: 'center',
        minWidth: 90,
        borderWidth: 1,
        borderColor: '#e0e0e0',
      }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 24, marginBottom: 6 }}>{icon}</Text>
      <Text style={{ fontSize: 11, color: '#333', textAlign: 'center', fontWeight: '600' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Header */}
      <View style={{
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 20,
      }}>
        <Text style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 4,
        }}>
          Welcome back,
        </Text>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: '#fff',
          marginBottom: 8,
        }}>
          {user?.email || 'Admin'}
        </Text>
        <Text style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.8)',
        }}>
          Here's your business overview
        </Text>
      </View>

      <View style={{ paddingHorizontal: 8 }}>
        {/* Sales Overview */}
        <Text style={[styles.label, { marginLeft: 8, marginTop: 16, marginBottom: 8 }]}>
          💰 Sales Overview
        </Text>
        <View style={{ flexDirection: 'row', marginHorizontal: 0 }}>
          <StatWidget 
            icon="📈" 
            label="Today" 
            value={`₹${stats?.sales.today}`}
            color="#3498db"
          />
          <StatWidget 
            icon="📅" 
            label="This Month" 
            value={`₹${stats?.sales.thisMonth}`}
            color="#2ecc71"
          />
        </View>
        <View style={{ flexDirection: 'row', marginHorizontal: 0 }}>
          <StatWidget 
            icon="⏳" 
            label="Pending" 
            value={`₹${stats?.sales.pending}`}
            color="#e74c3c"
          />
          <StatWidget 
            icon="📋" 
            label="Invoices" 
            value={stats?.sales.todayInvoices}
            subtext="today"
            color="#f39c12"
          />
        </View>

        {/* Business Metrics */}
        <Text style={[styles.label, { marginLeft: 8, marginTop: 16, marginBottom: 8 }]}>
          📊 Business Metrics
        </Text>
        <View style={{ flexDirection: 'row', marginHorizontal: 0 }}>
          <StatWidget 
            icon="👥" 
            label="Clients" 
            value={stats?.clients.total}
            subtext={`${stats?.clients.active} active`}
            color="#9b59b6"
          />
          <StatWidget 
            icon="👨‍💼" 
            label="Workers" 
            value={stats?.workers.total}
            color="#e67e22"
          />
        </View>

        {/* Invoice Status */}
        <Text style={[styles.label, { marginLeft: 8, marginTop: 16, marginBottom: 8 }]}>
          📑 Invoice Status
        </Text>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 14,
          marginHorizontal: 6,
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}>
          <View style={[{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          }]}>
            <View>
              <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                {stats?.invoices.total}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Paid ✓</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#27ae60' }}>
                {stats?.invoices.paid}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Active</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>
                {stats?.invoices.active}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Overdue ⚠️</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#c0392b' }}>
                {stats?.invoices.overdue}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Collection */}
        <Text style={[styles.label, { marginLeft: 8, marginTop: 16, marginBottom: 8 }]}>
          💵 Payment Collection
        </Text>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 14,
          marginHorizontal: 6,
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}>
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Collection Rate</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#3498db' }}>
                {stats?.payments.collectionRate}%
              </Text>
            </View>
            <View style={{
              height: 8,
              backgroundColor: '#e0e0e0',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <View
                style={{
                  height: '100%',
                  width: `${stats?.payments.collectionRate || 0}%`,
                  backgroundColor: '#3498db',
                }}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: '#666' }}>Received: ₹{stats?.payments.received}</Text>
            <Text style={{ fontSize: 12, color: '#e74c3c' }}>Pending: ₹{stats?.payments.pending}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.label, { marginLeft: 8, marginTop: 16, marginBottom: 12 }]}>
          ⚡ Quick Actions
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: 6, marginBottom: 20 }}
        >
          <QuickActionButton
            icon="🧾"
            label="New Invoice"
            onPress={() => navigation.navigate('Invoices')}
          />
          <QuickActionButton
            icon="💰"
            label="Payment"
            onPress={() => navigation.navigate('Payments')}
          />
          <QuickActionButton
            icon="👤"
            label="Client"
            onPress={() => navigation.navigate('Clients')}
          />
          <QuickActionButton
            icon="👨‍💼"
            label="Worker"
            onPress={() => navigation.navigate('Workers')}
          />
          <QuickActionButton
            icon="📊"
            label="Reports"
            onPress={() => navigation.navigate('Reports')}
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
}
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
