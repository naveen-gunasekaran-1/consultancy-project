import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { paymentAPI } from '../services/api';

const PaymentScreen = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await paymentAPI.getAll();
      setPayments(response.data.data);
    } catch (error) {
      console.error('Failed to load payments:', error);
      Alert.alert('Error', 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      await paymentAPI.updateStatus(paymentId, newStatus);
      Alert.alert('Success', 'Payment status updated');
      loadPayments();
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const renderPayment = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceNo}>Invoice: {item.invoiceId}</Text>
        <Text
          style={[
            styles.statusBadge,
            item.status === 'PAID' ? styles.paidStatus : styles.pendingStatus,
          ]}
        >
          {item.status}
        </Text>
      </View>

      <Text style={styles.amount}>Amount: ₹{item.amount}</Text>
      {item.paymentDate && (
        <Text style={styles.detail}>
          Paid on: {new Date(item.paymentDate).toLocaleDateString()}
        </Text>
      )}
      {item.paymentMethod && (
        <Text style={styles.detail}>Method: {item.paymentMethod}</Text>
      )}

      {item.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.markPaidButton}
          onPress={() => handleUpdateStatus(item._id, 'PAID')}
        >
          <Text style={styles.markPaidButtonText}>Mark as Paid</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Tracking</Text>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No payments found</Text>
        }
      />
    </View>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceNo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  paidStatus: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  pendingStatus: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  markPaidButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  markPaidButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 50,
  },
});

export default PaymentScreen;
