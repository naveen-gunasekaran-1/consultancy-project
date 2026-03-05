import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import './DashboardScreen.css';

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGuides: 0,
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Mock data - will be replaced with real API calls
    setStats({
      totalGuides: 1250,
      totalClients: 85,
      totalInvoices: 342,
      totalRevenue: 125750,
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="header-actions">
            <span className="user-name">Welcome, {user?.fullName || 'User'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon guides-icon">📚</div>
            <div className="stat-info">
              <h3>Total Guides</h3>
              <p className="stat-value">{stats.totalGuides}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon clients-icon">👥</div>
            <div className="stat-info">
              <h3>Total Clients</h3>
              <p className="stat-value">{stats.totalClients}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon invoices-icon">📋</div>
            <div className="stat-info">
              <h3>Total Invoices</h3>
              <p className="stat-value">{stats.totalInvoices}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue-icon">💰</div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-placeholder">
            <p>No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
