import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { invoiceAPI } from '../services/api';

const BillingScreen = ({ navigation }: any) => {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const handleAddItem = () => {
    // TODO: Implement item selection from guides
    Alert.alert('TODO', 'Add guide selection functionality');
  };

  const handleCreateInvoice = async () => {
    if (!selectedClient || items.length === 0) {
      Alert.alert('Error', 'Please select client and add items');
      return;
    }

    try {
      const invoiceData = {
        clientId: selectedClient.id,
        items: items,
      };

      await invoiceAPI.create(invoiceData);
      Alert.alert('Success', 'Invoice created successfully');
      // TODO: Navigate to invoice list or print
    } catch (error) {
      Alert.alert('Error', 'Failed to create invoice');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.wrapper}>
      <Text style={styles.header}>Create Invoice</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Details</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {/* TODO: Open client selector */}}
        >
          <Text style={styles.selectButtonText}>
            {selectedClient ? selectedClient.name : 'Select Client'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items added</Text>
        ) : (
          items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetail}>
                Qty: {item.quantity} × ₹{item.price} = ₹{item.subtotal}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalAmount}>₹{totalAmount}</Text>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateInvoice}
      >
        <Text style={styles.createButtonText}>Create Invoice</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: This is a placeholder screen. Implement full billing logic.
      </Text>
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  itemCard: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  totalSection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  createButton: {
    backgroundColor: '#007AFF',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    padding: 20,
  },
});

export default BillingScreen;
