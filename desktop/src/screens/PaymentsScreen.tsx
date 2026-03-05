import React from 'react';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';

const PaymentsScreen: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Payments Management</h1>
          <button className="add-btn">+ Record Payment</button>
        </header>
        <div className="content-area">
          <div className="empty-state">
            <p>Payments management feature coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsScreen;
