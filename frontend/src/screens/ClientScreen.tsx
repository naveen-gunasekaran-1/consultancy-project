import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { clientAPI } from '../services/api';

const ClientScreen = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [form, setForm] = useState({
    schoolName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientAPI.getAll();
      setClients(response.data.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
      Alert.alert('Error', 'Failed to load client data');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingClient(null);
    setForm({ schoolName: '', contactPerson: '', phone: '', email: '', address: '' });
    setIsModalVisible(true);
  };

  const openEdit = (client: any) => {
    setEditingClient(client);
    setForm({
      schoolName: client.schoolName || '',
      contactPerson: client.contactPerson || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    if (!isSaving) {
      setIsModalVisible(false);
    }
  };

  const handleSave = async () => {
    const schoolName = form.schoolName.trim();
    const contactPerson = form.contactPerson.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();
    const email = form.email.trim();

    if (!schoolName || !contactPerson || !phone || !address) {
      Alert.alert('Missing info', 'School name, contact person, phone, and address are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        schoolName,
        contactPerson,
        phone,
        address,
        email: email || undefined,
      };

      if (editingClient?._id) {
        await clientAPI.update(editingClient._id, payload);
      } else {
        await clientAPI.create(payload);
      }

      await loadClients();
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save client.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Client', 'Are you sure you want to delete this client?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await clientAPI.delete(id);
            loadClients();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete client');
          }
        },
      },
    ]);
  };

  const renderClient = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.schoolName}>{item.schoolName}</Text>
      <Text style={styles.detail}>Contact: {item.contactPerson}</Text>
      <Text style={styles.detail}>Phone: {item.phone}</Text>
      {item.email && <Text style={styles.detail}>Email: {item.email}</Text>}
      <Text style={styles.address}>{item.address}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => openEdit(item)}>
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton} onPress={() => handleDelete(item._id)}>
          <Text style={styles.dangerButtonText}>Delete</Text>
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
        <View>
          <Text style={styles.title}>Client Management</Text>
          <Text style={styles.subtitle}>Schools, contacts, and addresses</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={openCreate}>
          <Text style={styles.primaryButtonText}>+ Add Client</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={clients}
        renderItem={renderClient}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No clients found</Text>
        }
      />

      <Modal transparent animationType="slide" visible={isModalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingClient ? 'Edit Client' : 'Add Client'}
            </Text>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>School Name</Text>
              <TextInput
                style={styles.input}
                placeholder="School name"
                value={form.schoolName}
                onChangeText={(value) => setForm((prev) => ({ ...prev, schoolName: value }))}
              />

              <Text style={styles.inputLabel}>Contact Person</Text>
              <TextInput
                style={styles.input}
                placeholder="Primary contact"
                value={form.contactPerson}
                onChangeText={(value) => setForm((prev) => ({ ...prev, contactPerson: value }))}
              />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              />

              <Text style={styles.inputLabel}>Email (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
              />

              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Full address"
                multiline
                value={form.address}
                onChangeText={(value) => setForm((prev) => ({ ...prev, address: value }))}
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e9ef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
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
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
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
  dangerButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
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
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});

export default ClientScreen;
