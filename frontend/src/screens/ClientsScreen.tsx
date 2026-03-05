import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API from '../services/api';
import styles from '../styles/Screens';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  companyName?: string;
}

const ClientsScreen = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    companyName: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await API.get('/clients');
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      companyName: '',
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClient = (client: Client) => {
    setFormData(client);
    setEditingId(client._id);
    setShowModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await API.delete(`/clients/${id}`);
      setClients(clients.filter(c => c._id !== id));
      alert('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const handleSaveClient = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        const response = await API.put(`/clients/${editingId}`, formData);
        setClients(clients.map(c => (c._id === editingId ? response.data.data : c)));
        alert('Client updated successfully');
      } else {
        const response = await API.post('/clients', formData);
        setClients([response.data.data, ...clients]);
        alert('Client created successfully');
      }
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving client:', error);
      alert(error.response?.data?.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <TouchableOpacity
          onPress={handleAddClient}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && clients.length === 0 ? (
        <Text style={styles.loadingText}>Loading clients...</Text>
      ) : clients.length === 0 ? (
        <Text style={styles.emptyText}>No clients yet. Add one to get started!</Text>
      ) : (
        <ScrollView style={styles.list}>
          {clients.map(client => (
            <TouchableOpacity
              key={client._id}
              onPress={() => handleEditClient(client)}
              style={styles.listItem}
            >
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{client.name}</Text>
                <Text style={styles.listItemSubtitle}>{client.email}</Text>
                <Text style={styles.listItemText}>{client.phone}</Text>
                {client.city && client.state && (
                  <Text style={styles.listItemText}>{client.city}, {client.state}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteClient(client._id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Client' : 'Add New Client'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Client Name *"
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={text => setFormData({ ...formData, email: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone *"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={text => setFormData({ ...formData, phone: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Company Name"
                value={formData.companyName}
                onChangeText={text => setFormData({ ...formData, companyName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Address *"
                value={formData.address}
                onChangeText={text => setFormData({ ...formData, address: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="City *"
                value={formData.city}
                onChangeText={text => setFormData({ ...formData, city: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="State *"
                value={formData.state}
                onChangeText={text => setFormData({ ...formData, state: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Zip Code *"
                value={formData.zipCode}
                onChangeText={text => setFormData({ ...formData, zipCode: text })}
              />

              <TouchableOpacity
                onPress={handleSaveClient}
                disabled={loading}
                style={[styles.saveButton, loading && styles.buttonDisabled]}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Client'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ClientsScreen;
