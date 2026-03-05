import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import styles from '../styles/Screens';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('admin@vjn.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password) {
      setError('Password is required');
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigation.replace('Main');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      Alert.alert('Login Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}>
        {/* Logo/Branding Section */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#007AFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 40,
              fontWeight: 'bold',
              color: '#fff',
            }}>
              V
            </Text>
          </View>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#333',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            VJN Way To Success
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
          }}>
            Enterprise Billing & Inventory System
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={{
            backgroundColor: '#ffebee',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#f44336',
          }}>
            <Text style={{ color: '#c62828', fontSize: 13 }}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Email Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Email Address</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: error ? '#f44336' : '#e0e0e0',
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: '#fafafa',
            height: 48,
          }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>📧</Text>
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                color: '#333',
              }}
              placeholder="admin@vjn.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.label}>Password</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: error ? '#f44336' : '#e0e0e0',
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: '#fafafa',
            height: 48,
          }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>🔒</Text>
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                color: '#333',
              }}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={!password}
            >
              <Text style={{ fontSize: 20 }}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={{
            backgroundColor: isLoading ? '#ccc' : '#007AFF',
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 16,
            opacity: isLoading ? 0.6 : 1,
          }}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Demo Credentials */}
        <View style={{
          backgroundColor: '#e3f2fd',
          borderRadius: 8,
          padding: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#2196F3',
          marginTop: 20,
        }}>
          <Text style={{
            fontSize: 12,
            color: '#1976d2',
            fontWeight: '600',
            marginBottom: 6,
          }}>
            Demo Credentials
          </Text>
          <Text style={{
            fontSize: 11,
            color: '#1565c0',
            marginBottom: 4,
          }}>
            📧 Email: admin@vjn.com
          </Text>
          <Text style={{
            fontSize: 11,
            color: '#1565c0',
          }}>
            🔑 Password: admin123
          </Text>
        </View>

        {/* Features */}
        <View style={{ marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
          <Text style={{
            fontSize: 12,
            color: '#999',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            Features Included
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {['💼 Clients', '📋 Invoices', '💵 Payments', '👥 Workers', '📊 Reports'].map(feature => (
              <View
                key={feature}
                style={{
                  backgroundColor: '#f5f5f5',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text style={{ fontSize: 11, color: '#333' }}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ paddingBottom: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: '#999' }}>
          © 2024 VJN Way To Success. All rights reserved.
        </Text>
      </View>
    </View>
  );
}
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  wrapper: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 450 : undefined,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 30,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 12,
  },
});

export default LoginScreen;
