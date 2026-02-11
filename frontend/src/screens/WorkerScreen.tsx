import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { workerAPI } from '../services/api';

const WorkerScreen = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <Text style={styles.title}>Worker Management</Text>
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
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  inactiveStatus: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 50,
  },
});

export default WorkerScreen;
