import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { guideAPI } from '../services/api';

const StockScreen = ({ navigation }: any) => {
  const [guides, setGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGuide, setEditingGuide] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    className: '',
    subject: '',
    publisher: '',
    price: '',
    quantity: '',
  });

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      const response = await guideAPI.getAll();
      setGuides(response.data.data);
    } catch (error) {
      console.error('Failed to load guides:', error);
      Alert.alert('Error', 'Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingGuide(null);
    setForm({
      name: '',
      className: '',
      subject: '',
      publisher: '',
      price: '',
      quantity: '',
    });
    setIsModalVisible(true);
  };

  const openEdit = (guide: any) => {
    setEditingGuide(guide);
    setForm({
      name: guide.name || '',
      className: guide.class || '',
      subject: guide.subject || '',
      publisher: guide.publisher || '',
      price: guide.price?.toString() || '',
      quantity: guide.quantity?.toString() || '',
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    if (!isSaving) {
      setIsModalVisible(false);
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const className = form.className.trim();
    const subject = form.subject.trim();
    const publisher = form.publisher.trim();
    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!name || !className || !subject || Number.isNaN(price) || Number.isNaN(quantity)) {
      Alert.alert('Missing info', 'Name, class, subject, price, and quantity are required.');
      return;
    }

    if (price < 0 || quantity < 0) {
      Alert.alert('Invalid values', 'Price and quantity must be zero or positive.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        class: className,
        subject,
        publisher: publisher || 'Unknown',
        price,
        quantity,
      };

      if (editingGuide?._id) {
        await guideAPI.update(editingGuide._id, payload);
      } else {
        await guideAPI.create(payload);
      }

      await loadGuides();
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save guide.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Guide', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await guideAPI.delete(id);
            loadGuides();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete guide');
          }
        },
      },
    ]);
  };

  const renderGuide = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.guideName}>{item.name}</Text>
        <Text
          style={[
            styles.stockBadge,
            item.quantity < 10 ? styles.lowStock : styles.inStock,
          ]}
        >
          Qty: {item.quantity}
        </Text>
      </View>
      
      <Text style={styles.guideDetail}>
        Class: {item.class} | Subject: {item.subject}
      </Text>
      <Text style={styles.guideDetail}>Publisher: {item.publisher}</Text>
      <Text style={styles.price}>Price: ₹{item.price}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEdit(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
        <Text style={styles.title}>Stock Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreate}
        >
          <Text style={styles.addButtonText}>+ Add Guide</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={guides}
        renderItem={renderGuide}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No guides in stock</Text>
        }
      />

      <Modal transparent animationType="slide" visible={isModalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingGuide ? 'Edit Guide' : 'Add Guide'}
            </Text>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Guide Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Guide name"
                value={form.name}
                onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
              />

              <Text style={styles.inputLabel}>Class</Text>
              <TextInput
                style={styles.input}
                placeholder="Class / Grade"
                value={form.className}
                onChangeText={(value) => setForm((prev) => ({ ...prev, className: value }))}
              />

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Subject"
                value={form.subject}
                onChangeText={(value) => setForm((prev) => ({ ...prev, subject: value }))}
              />

              <Text style={styles.inputLabel}>Publisher</Text>
              <TextInput
                style={styles.input}
                placeholder="Publisher"
                value={form.publisher}
                onChangeText={(value) => setForm((prev) => ({ ...prev, publisher: value }))}
              />

              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Price"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(value) => setForm((prev) => ({ ...prev, price: value }))}
              />

              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="Quantity"
                keyboardType="numeric"
                value={form.quantity}
                onChangeText={(value) => setForm((prev) => ({ ...prev, quantity: value }))}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={closeModal}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.primaryButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e9ef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
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
        boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
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
  guideName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lowStock: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  inStock: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  guideDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0f172a',
  },
  modalBody: {
    paddingBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
});

export default StockScreen;
