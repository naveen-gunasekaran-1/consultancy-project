import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - using local IP for iOS simulator connectivity
const API_BASE_URL = 'http://172.23.245.30:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle unauthorized - redirect to login
      AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  verifyToken: () => api.get('/auth/verify'),
};

// Guide APIs
export const guideAPI = {
  getAll: () => api.get('/guides'),
  getById: (id: string) => api.get(`/guides/${id}`),
  create: (data: any) => api.post('/guides', data),
  update: (id: string, data: any) => api.put(`/guides/${id}`, data),
  delete: (id: string) => api.delete(`/guides/${id}`),
  search: (query: string) => api.get(`/guides/search?query=${query}`),
};

// Invoice APIs
export const invoiceAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.put(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

// Payment APIs
export const paymentAPI = {
  getAll: () => api.get('/payments'),
  getById: (id: string) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  updateStatus: (id: string, status: string) =>
    api.put(`/payments/${id}/status`, { status }),
  getByInvoice: (invoiceId: string) =>
    api.get(`/payments/invoice/${invoiceId}`),
};

// Worker APIs
export const workerAPI = {
  getAll: () => api.get('/workers'),
  getById: (id: string) => api.get(`/workers/${id}`),
  create: (data: any) => api.post('/workers', data),
  update: (id: string, data: any) => api.put(`/workers/${id}`, data),
  delete: (id: string) => api.delete(`/workers/${id}`),
};

// Client APIs
export const clientAPI = {
  getAll: () => api.get('/clients'),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// Report APIs
export const reportAPI = {
  getStockReport: () => api.get('/reports/stock'),
  getSalesReport: (startDate?: string, endDate?: string) =>
    api.get('/reports/sales', { params: { startDate, endDate } }),
  getPaymentReport: () => api.get('/reports/payments'),
  getClientReport: () => api.get('/reports/clients'),
  getDashboardStats: () => api.get('/reports/dashboard'),
};

// AI APIs
export const aiAPI = {
  getSalesTrends: () => api.get('/ai/sales-trends'),
  getStockPrediction: () => api.get('/ai/stock-prediction'),
  getRecommendations: () => api.get('/ai/recommendations'),
};

export default api;
