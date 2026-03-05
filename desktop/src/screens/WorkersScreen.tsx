import React from 'react';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';

const WorkersScreen: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Workers Management</h1>
          <button className="add-btn">+ Add Worker</button>
        </header>
        <div className="content-area">
          <div className="empty-state">
            <p>Workers management feature coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkersScreen;
