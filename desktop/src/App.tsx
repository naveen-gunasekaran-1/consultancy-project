import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import AnalyticsDashboard from './screens/AnalyticsDashboard';
import GuidesScreen from './screens/GuidesScreen';
import GuideCreationPage from './screens/GuideCreationPage';
import ClientsScreen from './screens/ClientsScreen';
import ClientCreationPage from './screens/ClientCreationPage';
import InvoicesScreen from './screens/InvoicesScreen';
import InvoiceCreationPage from './screens/InvoiceCreationPage';
import OrdersScreen from './screens/OrdersScreen';
import InventoryScreen from './screens/InventoryScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import WorkersScreen from './screens/WorkersScreen';
import WorkerCreationPage from './screens/WorkerCreationPage';
import ReportsScreen from './screens/ReportsScreen';
import ProfileScreen from './screens/ProfileScreen';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/guides" element={<GuidesScreen />} />
          <Route path="/guides/create" element={<GuideCreationPage />} />
          <Route path="/clients" element={<ClientsScreen />} />
          <Route path="/clients/create" element={<ClientCreationPage />} />
          <Route path="/invoices" element={<InvoicesScreen />} />
          <Route path="/invoices/create" element={<InvoiceCreationPage />} />
          <Route path="/orders" element={<OrdersScreen />} />
          <Route path="/inventory" element={<InventoryScreen />} />
          <Route path="/payments" element={<PaymentsScreen />} />
          <Route path="/workers" element={<WorkersScreen />} />
          <Route path="/workers/create" element={<WorkerCreationPage />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
