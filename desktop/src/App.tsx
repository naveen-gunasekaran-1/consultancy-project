import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import GuidesScreen from './screens/GuidesScreen';
import ClientsScreen from './screens/ClientsScreen';
import InvoicesScreen from './screens/InvoicesScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import WorkersScreen from './screens/WorkersScreen';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/guides" element={<GuidesScreen />} />
          <Route path="/clients" element={<ClientsScreen />} />
          <Route path="/invoices" element={<InvoicesScreen />} />
          <Route path="/payments" element={<PaymentsScreen />} />
          <Route path="/workers" element={<WorkersScreen />} />
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
