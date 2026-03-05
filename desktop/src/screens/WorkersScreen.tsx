import React, { useEffect, useState } from 'react';
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

const ROLES: Worker['role'][] = ['sales', 'manager', 'admin', 'support'];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  role: 'sales' as Worker['role'],
  commissionRate: '0',
  performanceScore: '0',
};

const WorkersScreen: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

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

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!formData.address.trim()) return 'Address is required';

    const commissionRate = Number(formData.commissionRate);
    if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      return 'Commission rate must be between 0 and 100';
    }

    const performanceScore = Number(formData.performanceScore);
    if (!Number.isFinite(performanceScore) || performanceScore < 0 || performanceScore > 100) {
      return 'Performance score must be between 0 and 100';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      role: formData.role,
      commissionRate: Number(formData.commissionRate),
      performanceScore: Number(formData.performanceScore),
    };

    setSaving(true);
    try {
      if (editingId) {
        await workerAPI.update(editingId, payload);
      } else {
        await workerAPI.create(payload);
      }
      resetForm();
      fetchWorkers();
    } catch (err: any) {
      console.error('Failed to save worker:', err);
      setError(err?.response?.data?.message || 'Failed to save worker');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (worker: Worker) => {
    setEditingId(worker._id);
    setFormData({
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      address: worker.address,
      role: worker.role,
      commissionRate: String(worker.commissionRate ?? 0),
      performanceScore: String(worker.performanceScore ?? 0),
    });
    setError('');
    setShowForm(true);
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
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Add Worker
          </button>
        </header>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editingId ? 'Edit Worker' : 'Add Worker'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Worker['role'] })}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Performance Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.performanceScore}
                    onChange={(e) => setFormData({ ...formData, performanceScore: e.target.value })}
                  />
                </div>

                {error && <span className="field-error">{error}</span>}

                <div className="modal-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={resetForm} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
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
                      <button className="edit-btn" onClick={() => handleEdit(worker)}>
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
