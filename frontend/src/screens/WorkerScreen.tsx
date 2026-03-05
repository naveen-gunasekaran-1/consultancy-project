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

interface Worker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  commissionRate: number;
  totalEarnings: number;
  performanceScore: number;
  joinDate: string;
  isActive: boolean;
}

const ROLES = ['sales', 'manager', 'admin', 'support'];

export default function WorkerScreen() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'sales',
    commissionRate: '0',
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workers');
      setWorkers(response.data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch workers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const workerData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      role: form.role,
      commissionRate: Number(form.commissionRate),
    };

    try {
      if (editingWorker) {
        const response = await api.put(`/workers/${editingWorker._id}`, workerData);
        setWorkers(workers.map(w => w._id === editingWorker._id ? response.data.data : w));
        Alert.alert('Success', 'Worker updated successfully');
      } else {
        const response = await api.post('/workers', workerData);
        if (response.status === 201) {
          setWorkers([response.data.data, ...workers]);
          Alert.alert('Success', 'Worker created successfully');
        }
      }
      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', editingWorker ? 'Failed to update worker' : 'Failed to create worker');
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingWorker(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'sales',
      commissionRate: '0',
    });
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setForm({
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      address: worker.address,
      role: worker.role,
      commissionRate: worker.commissionRate.toString(),
    });
    setModalVisible(true);
  };

  const handleDeleteWorker = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to deactivate this worker?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Deactivate',
          onPress: async () => {
            try {
              await api.delete(`/workers/${id}`);
              setWorkers(workers.filter(w => w._id !== id));
              Alert.alert('Success', 'Worker deactivated');
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate worker');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    const colors: any = {
      sales: '#3498db',
      manager: '#e74c3c',
      admin: '#9b59b6',
      support: '#f39c12',
    };
    return colors[role] || '#95a5a6';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const renderWorkerItem = ({ item }: { item: Worker }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemContent}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.listItemTitle}>{item.name}</Text>
          <View style={{
            backgroundColor: getRoleColor(item.role),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
              {item.role.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.listItemSubtitle}>{item.email}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={styles.listItemText}>📞 {item.phone}</Text>
          <Text style={styles.listItemText}>📍 {item.address}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={styles.listItemText}>
            Commission: {item.commissionRate}%
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.listItemText}>Performance: </Text>
            <Text style={{
              color: getPerformanceColor(item.performanceScore),
              fontWeight: '600',
            }}>
              {item.performanceScore}/100
            </Text>
          </View>
        </View>
        <Text style={[styles.listItemText, { marginTop: 4, color: '#27ae60', fontWeight: '600' }]}>
          Total Earnings: ₹{item.totalEarnings.toFixed(2)}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => handleEdit(item)}
        >
          <Text style={{ color: '#3498db', fontSize: 14, fontWeight: '600' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => handleDeleteWorker(item._id)}
        >
          <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '600' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && workers.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: '300' }}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workers}
        renderItem={renderWorkerItem}
        keyExtractor={item => item._id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No workers added yet</Text>
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
              <Text style={styles.modalTitle}>
                {editingWorker ? 'Edit Worker' : 'Add New Worker'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 24, color: '#999' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Worker name"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="worker@example.com"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                keyboardType="email-address"
              />

              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="+91-9999999999"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Worker address"
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
              />

              <Text style={styles.label}>Role *</Text>
              <View style={styles.picker}>
                {ROLES.map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.pickerItem,
                      form.role === role && {
                        backgroundColor: getRoleColor(role),
                        borderColor: getRoleColor(role),
                      },
                    ]}
                    onPress={() => setForm({ ...form, role })}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        form.role === role && {
                          color: '#fff',
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Commission Rate (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={form.commissionRate}
                onChangeText={(text) => setForm({ ...form, commissionRate: text })}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddOrUpdate}
              >
                <Text style={styles.saveButtonText}>
                  {editingWorker ? 'Update Worker' : 'Add Worker'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
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
