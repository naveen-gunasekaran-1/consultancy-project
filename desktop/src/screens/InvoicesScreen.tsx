import React from 'react';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';

const InvoicesScreen: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Invoices Management</h1>
          <button className="add-btn">+ Create Invoice</button>
        </header>
        <div className="content-area">
          <div className="empty-state">
            <p>Invoices management feature coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesScreen;
