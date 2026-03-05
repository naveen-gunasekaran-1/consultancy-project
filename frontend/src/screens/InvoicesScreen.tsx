import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API from '../services/api';
import styles from '../styles/Screens';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string;
}

interface Client {
  _id: string;
  name: string;
  email: string;
}

const InvoicesScreen = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedGuide, setSelectedGuide] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemPrice, setItemPrice] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [taxPercentage, setTaxPercentage] = useState('18');

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchGuides();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await API.get('/invoices');
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await API.get('/clients');
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchGuides = async () => {
    try {
      const response = await API.get('/guides');
      setGuides(response.data.data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
    }
  };

  const handleAddItem = () => {
    if (!selectedGuide || !itemQuantity || !itemPrice) {
      Alert.alert('Error', 'Please select a guide and fill quantity and price');
      return;
    }

    const guide = guides.find(g => g._id === selectedGuide);
    if (!guide) return;

    const item = {
      id: Date.now().toString(),
      guideId: selectedGuide,
      guideName: guide.title || guide.name,
      quantity: parseInt(itemQuantity),
      unitPrice: parseFloat(itemPrice),
      total: parseInt(itemQuantity) * parseFloat(itemPrice),
    };

    setInvoiceItems([...invoiceItems, item]);
    setSelectedGuide('');
    setItemQuantity('1');
    setItemPrice('');
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const tax = Math.round((subtotal * parseFloat(taxPercentage)) / 100 * 100) / 100;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleCreateInvoice = async () => {
    if (!selectedClient || invoiceItems.length === 0) {
      Alert.alert('Error', 'Please select a client and add items');
      return;
    }

    try {
      setLoading(true);
      const response = await API.post('/invoices', {
        clientId: selectedClient,
        items: invoiceItems.map(item => ({
          guideId: item.guideId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        taxPercentage: parseFloat(taxPercentage),
      });

      setInvoices([response.data.data, ...invoices]);
      setShowModal(false);
      setSelectedClient('');
      setInvoiceItems([]);
      setTaxPercentage('18');
      Alert.alert('Success', 'Invoice created successfully');
      fetchInvoices();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const response = await API.put(`/invoices/${invoiceId}/status`, { status: newStatus });
      setInvoices(invoices.map(inv =>
        inv._id === invoiceId ? response.data.data : inv
      ));
      Alert.alert('Success', 'Invoice status updated');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await API.delete(`/invoices/${id}`);
              setInvoices(invoices.filter(inv => inv._id !== id));
              Alert.alert('Success', 'Invoice deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete invoice');
            }
          },
        },
      ]
    );
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && invoices.length === 0 ? (
        <Text style={styles.loadingText}>Loading invoices...</Text>
      ) : invoices.length === 0 ? (
        <Text style={styles.emptyText}>No invoices yet. Create one to get started!</Text>
      ) : (
        <ScrollView style={styles.list}>
          {invoices.map(invoice => (
            <View key={invoice._id} style={styles.listItem}>
              <TouchableOpacity style={{ flex: 1 }}>
                <Text style={styles.listItemTitle}>{invoice.invoiceNumber}</Text>
                <Text style={styles.listItemSubtitle}>{invoice.clientId.name}</Text>
                <Text style={styles.listItemText}>₹{invoice.total.toFixed(2)}</Text>
                <View style={styles.statusBadge}>
                  <Text style={[styles.statusText, { color: invoice.status === 'paid' ? '#51cf66' : '#ff922b' }]}>
                    {invoice.status.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handleChangeStatus(invoice._id, invoice.status === 'paid' ? 'draft' : 'paid')}
                  style={styles.actionButton}
                >
                  <Ionicons name="checkmark" size={18} color="#51cf66" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteInvoice(invoice._id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash" size={18} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Invoice</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Select Client *</Text>
              <View style={styles.picker}>
                {clients.map(client => (
                  <TouchableOpacity
                    key={client._id}
                    onPress={() => setSelectedClient(client._id)}
                    style={[
                      styles.pickerItem,
                      selectedClient === client._id && styles.pickerItemSelected,
                    ]}
                  >
                    <Text style={selectedClient === client._id ? styles.pickerItemTextSelected : styles.pickerItemText}>
                      {client.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Add Items *</Text>
              <View style={styles.itemAddSection}>
                <Text style={styles.label}>Guide</Text>
                <View style={styles.picker}>
                  {guides.map(guide => (
                    <TouchableOpacity
                      key={guide._id}
                      onPress={() => setSelectedGuide(guide._id)}
                      style={[
                        styles.pickerItem,
                        selectedGuide === guide._id && styles.pickerItemSelected,
                      ]}
                    >
                      <Text style={selectedGuide === guide._id ? styles.pickerItemTextSelected : styles.pickerItemText}>
                        {guide.title || guide.name} - ₹{guide.price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={itemQuantity}
                  onChangeText={setItemQuantity}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Unit Price"
                  keyboardType="decimal-pad"
                  value={itemPrice}
                  onChangeText={setItemPrice}
                />
                <TouchableOpacity onPress={handleAddItem} style={styles.addItemButton}>
                  <Text style={styles.addItemButtonText}>+ Add Item</Text>
                </TouchableOpacity>
              </View>

              {invoiceItems.length > 0 && (
                <View style={styles.itemsSection}>
                  <Text style={styles.label}>Items Added</Text>
                  {invoiceItems.map(item => (
                    <View key={item.id} style={styles.addedItem}>
                      <View>
                        <Text style={styles.addedItemName}>{item.guideName}</Text>
                        <Text style={styles.addedItemDetails}>
                          {item.quantity} × ₹{item.unitPrice} = ₹{item.total}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                        <Ionicons name="close" size={20} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TextInput
                    style={styles.input}
                    placeholder="Tax %"
                    keyboardType="decimal-pad"
                    value={taxPercentage}
                    onChangeText={setTaxPercentage}
                  />

                  <View style={styles.totalsSection}>
                    <View style={styles.totalRow}>
                      <Text>Subtotal:</Text>
                      <Text style={styles.totalAmount}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text>Tax:</Text>
                      <Text style={styles.totalAmount}>₹{tax.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.totalRowBold]}>
                      <Text style={styles.totalRowBoldText}>Total:</Text>
                      <Text style={[styles.totalAmount, styles.totalRowBoldText]}>₹{total.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleCreateInvoice}
                disabled={loading || !selectedClient || invoiceItems.length === 0}
                style={[styles.saveButton, (loading || !selectedClient || invoiceItems.length === 0) && styles.buttonDisabled]}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Creating...' : 'Create Invoice'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InvoicesScreen;
