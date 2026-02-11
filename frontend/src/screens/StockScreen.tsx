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
import { guideAPI } from '../services/api';

const StockScreen = ({ navigation }: any) => {
  const [guides, setGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          onPress={() => {/* TODO: Navigate to edit screen */}}
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
          onPress={() => {/* TODO: Navigate to add guide screen */}}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  inStock: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  guideDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
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

export default StockScreen;
