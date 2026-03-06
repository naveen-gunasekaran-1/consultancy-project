import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

const WorkerCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get('id');
  const isEditing = !!workerId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isEditing && workerId) {
      loadWorker(workerId);
    }
  }, [workerId, isEditing]);

  const loadWorker = async (id: string) => {
    setLoading(true);
    try {
      const response = await workerAPI.getById(id);
      const worker = response.data.data || response.data;
      setFormData({
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        address: worker.address,
        role: worker.role || 'sales',
        commissionRate: String(worker.commissionRate ?? 0),
        performanceScore: String(worker.performanceScore ?? 0),
      });
    } catch (error) {
      console.error('Failed to load worker:', error);
      setError('Failed to load worker details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Invalid email format';
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (isEditing && workerId) {
        await workerAPI.update(workerId, payload);
      } else {
        await workerAPI.create(payload);
      }
      navigate('/workers');
    } catch (err: any) {
      console.error('Failed to save worker:', err);
      setError(err?.response?.data?.message || 'Failed to save worker');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate('/workers');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>{isEditing ? 'Edit Worker' : 'Create New Worker'}</h1>
        </header>

        <div className="form-container" style={{ maxWidth: '600px', margin: '20px' }}>
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', marginBottom: '16px', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter worker name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select name="role" value={formData.role} onChange={handleInputChange} required>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Commission Rate (%) *</label>
                <input
                  type="number"
                  name="commissionRate"
                  placeholder="0-100"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.commissionRate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Performance Score (0-100) *</label>
                <input
                  type="number"
                  name="performanceScore"
                  placeholder="0-100"
                  min="0"
                  max="100"
                  value={formData.performanceScore}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Worker' : 'Create Worker'}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerCreationPage;
