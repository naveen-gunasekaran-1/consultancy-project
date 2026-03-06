import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

interface Worker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'sales' | 'manager' | 'admin' | 'support';
  commissionRate: number;
  totalEarnings: number;
  performanceScore: number;
}

const WorkersScreen: React.FC = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await workerAPI.getAll();
      setWorkers(response.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch workers:', err);
      setError('Failed to load workers. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deactivate this worker?')) {
      return;
    }

    try {
      await workerAPI.delete(id);
      setWorkers((currentWorkers) => currentWorkers.filter((worker) => worker._id !== id));
    } catch (err: any) {
      console.error('Failed to delete worker:', err);
      setError(err?.response?.data?.message || 'Failed to deactivate worker');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Workers Management</h1>
          <button className="add-btn" onClick={() => navigate('/workers/create')}>
            + Add Worker
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
          ) : workers.length === 0 ? (
            <div className="empty-state">
              <p>No workers found.</p>
            </div>
          ) : (
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Commission</th>
                  <th>Earnings</th>
                  <th>Performance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker._id}>
                    <td>{worker.name}</td>
                    <td>{worker.email}</td>
                    <td>{worker.role}</td>
                    <td>{Number(worker.commissionRate || 0).toFixed(1)}%</td>
                    <td>Rs {Number(worker.totalEarnings || 0).toFixed(2)}</td>
                    <td>{Number(worker.performanceScore || 0).toFixed(0)}</td>
                    <td>
                      <button className="edit-btn" onClick={() => navigate(`/workers/create?id=${worker._id}`)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(worker._id)}>
                        Deactivate
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

export default WorkersScreen;
