import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  companyName?: string;
  notes?: string;
}



const ClientsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await clientAPI.getAll();
      setClients(response.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch clients:', err);
      setError('Failed to fetch clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this client?')) {
      return;
    }

    try {
      await clientAPI.delete(id);
      fetchClients();
    } catch (err: unknown) {
      console.error('Failed to delete client:', err);
      setError('Failed to delete client');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Clients Management</h1>
          <button onClick={() => navigate('/clients/create')} className="add-btn">
            + Add Client
          </button>
        </header>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', margin: '10px', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div className="content-area">
          {loading ? (
            <p>Loading...</p>
          ) : clients.length === 0 ? (
            <div className="empty-state">
              <p>No clients found.</p>
            </div>
          ) : (
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Company</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.city}</td>
                    <td>{client.state}</td>
                    <td>{client.companyName || '-'}</td>
                    <td>
                      <button className="edit-btn" onClick={() => navigate(`/clients/create?id=${client._id}`)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(client._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsScreen;
