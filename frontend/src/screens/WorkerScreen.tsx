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
import { workerAPI } from '../services/api';

const WorkerScreen = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: '',
    phone: '',
    salary: '',
    joinDate: '',
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const response = await workerAPI.getAll();
      setWorkers(response.data.data);
    } catch (error) {
      console.error('Failed to load workers:', error);
      Alert.alert('Error', 'Failed to load worker data');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingWorker(null);
    setForm({ name: '', role: '', phone: '', salary: '', joinDate: '' });
    setIsModalVisible(true);
  };

  const openEdit = (worker: any) => {
    setEditingWorker(worker);
    setForm({
      name: worker.name || '',
      role: worker.role || '',
      phone: worker.phone || '',
      salary: worker.salary?.toString() || '',
      joinDate: worker.joinDate ? worker.joinDate.slice(0, 10) : '',
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
    const role = form.role.trim();
    const phone = form.phone.trim();
    const salary = Number(form.salary);

    if (!name || !role || !phone || Number.isNaN(salary)) {
      Alert.alert('Missing info', 'Name, role, phone, and salary are required.');
      return;
    }

    if (salary < 0) {
      Alert.alert('Invalid salary', 'Salary must be zero or positive.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        role,
        phone,
        salary,
        joinDate: form.joinDate ? form.joinDate : undefined,
      };

      if (editingWorker?._id) {
        await workerAPI.update(editingWorker._id, payload);
      } else {
        await workerAPI.create(payload);
      }

      await loadWorkers();
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save worker.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    Alert.alert('Deactivate Worker', 'Are you sure you want to deactivate this worker?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            await workerAPI.delete(id);
            loadWorkers();
          } catch (error) {
            Alert.alert('Error', 'Failed to deactivate worker');
          }
        },
      },
    ]);
  };

  const renderWorker = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.workerName}>{item.name}</Text>
        <Text
          style={[
            styles.statusBadge,
            item.isActive ? styles.activeStatus : styles.inactiveStatus,
          ]}
        >
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
      </View>

      <Text style={styles.detail}>Role: {item.role}</Text>
      <Text style={styles.detail}>Phone: {item.phone}</Text>
      <Text style={styles.salary}>Salary: ₹{item.salary}</Text>
      {item.joinDate && (
        <Text style={styles.detail}>
          Joined: {new Date(item.joinDate).toLocaleDateString()}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => openEdit(item)}>
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() => handleDeactivate(item._id)}
        >
          <Text style={styles.dangerButtonText}>Deactivate</Text>
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
          <Text style={styles.title}>Worker Management</Text>
          <Text style={styles.subtitle}>Track staff, roles, and pay</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={openCreate}>
          <Text style={styles.primaryButtonText}>+ Add Worker</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workers}
        renderItem={renderWorker}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No workers found</Text>
        }
      />

      <Modal transparent animationType="slide" visible={isModalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingWorker ? 'Edit Worker' : 'Add Worker'}
            </Text>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={form.name}
                onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
              />

              <Text style={styles.inputLabel}>Role</Text>
              <TextInput
                style={styles.input}
                placeholder="Role or position"
                value={form.role}
                onChangeText={(value) => setForm((prev) => ({ ...prev, role: value }))}
              />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              />

              <Text style={styles.inputLabel}>Salary</Text>
              <TextInput
                style={styles.input}
                placeholder="Salary"
                keyboardType="numeric"
                value={form.salary}
                onChangeText={(value) => setForm((prev) => ({ ...prev, salary: value }))}
              />

              <Text style={styles.inputLabel}>Join Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-01-15"
                value={form.joinDate}
                onChangeText={(value) => setForm((prev) => ({ ...prev, joinDate: value }))}
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
    backgroundColor: '#ffffff',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeStatus: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  inactiveStatus: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 5,
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
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});

export default WorkerScreen;
