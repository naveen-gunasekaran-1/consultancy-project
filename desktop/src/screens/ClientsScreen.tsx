import React from 'react';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';

const ClientsScreen: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Clients Management</h1>
          <button className="add-btn">+ Add Client</button>
        </header>
        <div className="content-area">
          <div className="empty-state">
            <p>Clients management feature coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsScreen;
