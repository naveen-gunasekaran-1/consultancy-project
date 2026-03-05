import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from '../styles/Screens';
import { api } from '../services/api';

interface Payment {
  _id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'bank' | 'cheque' | 'credit_card';
  transactionId?: string;
  paymentDate: string;
  notes?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: string;
}

export default function PaymentScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank' | 'cheque' | 'credit_card'>('cash');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [showInvoicePicker, setShowInvoicePicker] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments');
      setPayments(response.data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedInvoice) {
      Alert.alert('Error', 'Please select an invoice');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const paymentData = {
      invoiceId: selectedInvoice._id,
      amount: Number(amount),
      paymentMethod,
      transactionId: transactionId || undefined,
      notes,
    };

    try {
      const response = await api.post('/payments', paymentData);
      if (response.status === 201) {
        Alert.alert('Success', 'Payment recorded successfully');
        setPayments([response.data.data, ...payments]);
        resetForm();
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record payment');
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedInvoice(null);
    setAmount('');
    setTransactionId('');
    setNotes('');
    setPaymentMethod('cash');
  };

  const handleDeletePayment = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this payment record?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await api.delete(`/payments/${id}`);
              setPayments(payments.filter(p => p._id !== id));
              Alert.alert('Success', 'Payment deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete payment');
            }
          },
        },
      ]
    );
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: any = {
      cash: '#ff6b6b',
      upi: '#4ecdc4',
      bank: '#45b7d1',
      cheque: '#ffa502',
      credit_card: '#6c5ce7',
    };
    return colors[method] || '#999';
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>
          {item.paymentMethod.toUpperCase()} - ₹{item.amount.toFixed(2)}
        </Text>
        <Text style={styles.listItemSubtitle}>
          Invoice: {item.invoiceId}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.listItemText}>
            {new Date(item.paymentDate).toLocaleDateString()}
          </Text>
          {item.transactionId && (
            <Text style={styles.listItemText}>
              TXN: {item.transactionId}
            </Text>
          )}
        </View>
        {item.notes && (
          <Text style={styles.listItemText} numberOfLines={1}>
            Note: {item.notes}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePayment(item._id)}
      >
        <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '600' }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && payments.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: '300' }}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={item => item._id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No payments recorded yet</Text>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 24, color: '#999' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Invoice Selection */}
              <Text style={styles.label}>Invoice *</Text>
              <TouchableOpacity
                style={[styles.input, { paddingVertical: 0, justifyContent: 'center' }]}
                onPress={() => setShowInvoicePicker(!showInvoicePicker)}
              >
                <Text style={{ color: selectedInvoice ? '#333' : '#999', fontSize: 14 }}>
                  {selectedInvoice ? `${selectedInvoice.invoiceNumber} - ₹${selectedInvoice.total}` : 'Select invoice...'}
                </Text>
              </TouchableOpacity>

              {showInvoicePicker && (
                <View style={styles.picker}>
                  {invoices.length > 0 ? (
                    invoices.map(inv => (
                      <TouchableOpacity
                        key={inv._id}
                        style={[
                          styles.pickerItem,
                          selectedInvoice?._id === inv._id && styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedInvoice(inv);
                          setAmount(inv.total.toString());
                          setShowInvoicePicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedInvoice?._id === inv._id && styles.pickerItemTextSelected,
                          ]}
                        >
                          {inv.invoiceNumber} - ₹{inv.total.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.listItemText}>No invoices available</Text>
                  )}
                </View>
              )}

              {/* Amount */}
              <Text style={styles.label}>Amount (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              {/* Payment Method */}
              <Text style={styles.label}>Payment Method *</Text>
              <View style={styles.picker}>
                {['cash', 'upi', 'bank', 'cheque', 'credit_card'].map(method => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.pickerItem,
                      paymentMethod === method && {
                        backgroundColor: getPaymentMethodColor(method),
                        borderColor: getPaymentMethodColor(method),
                      },
                    ]}
                    onPress={() => setPaymentMethod(method as any)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        paymentMethod === method && {
                          color: '#fff',
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Transaction ID (optional for non-cash) */}
              {paymentMethod !== 'cash' && (
                <>
                  <Text style={styles.label}>Transaction ID (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., UPI reference, cheque number"
                    value={transactionId}
                    onChangeText={setTransactionId}
                  />
                </>
              )}

              {/* Notes */}
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Additional details..."
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <TouchableOpacity
                style={[styles.saveButton, !selectedInvoice && styles.buttonDisabled]}
                onPress={handleAddPayment}
                disabled={!selectedInvoice}
              >
                <Text style={styles.saveButtonText}>Record Payment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
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
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: Platform.OS === 'web' ? '100%' : undefined,
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
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
