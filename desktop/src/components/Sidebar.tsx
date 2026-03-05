import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Guides', path: '/guides', icon: '📚' },
    { name: 'Clients', path: '/clients', icon: '👥' },
    { name: 'Invoices', path: '/invoices', icon: '📋' },
    { name: 'Payments', path: '/payments', icon: '💳' },
    { name: 'Workers', path: '/workers', icon: '👨‍💼' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>VJN</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${window.location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
