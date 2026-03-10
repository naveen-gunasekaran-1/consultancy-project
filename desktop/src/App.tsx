import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import './App.css';

const DashboardScreen = React.lazy(() => import('./screens/DashboardScreen'));
const AnalyticsDashboard = React.lazy(() => import('./screens/AnalyticsDashboard'));
const GuidesScreen = React.lazy(() => import('./screens/GuidesScreen'));
const GuideCreationPage = React.lazy(() => import('./screens/GuideCreationPage'));
const ClientsScreen = React.lazy(() => import('./screens/ClientsScreen'));
const ClientCreationPage = React.lazy(() => import('./screens/ClientCreationPage'));
const InvoicesScreen = React.lazy(() => import('./screens/InvoicesScreen'));
const InvoiceCreationPage = React.lazy(() => import('./screens/InvoiceCreationPage'));
const OrdersScreen = React.lazy(() => import('./screens/OrdersScreen'));
const InventoryScreen = React.lazy(() => import('./screens/InventoryScreen'));
const PaymentsScreen = React.lazy(() => import('./screens/PaymentsScreen'));
const WorkersScreen = React.lazy(() => import('./screens/WorkersScreen'));
const WorkerCreationPage = React.lazy(() => import('./screens/WorkerCreationPage'));
const ReportsScreen = React.lazy(() => import('./screens/ReportsScreen'));
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen'));

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<div className="app-loading">Loading...</div>}>
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
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
