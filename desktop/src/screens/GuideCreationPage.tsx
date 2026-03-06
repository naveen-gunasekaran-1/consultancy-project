import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { guideAPI } from '../services/api';
import { validateGuideForm, ValidationError } from '../utils/validation';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

const GuideCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guideId = searchParams.get('id');
  const isEditing = !!guideId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<ValidationError[]>([]);
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    subject: '',
    price: '',
    quantity: '',
    publisher: '',
  });

  useEffect(() => {
    if (isEditing && guideId) {
      loadGuide(guideId);
    }
  }, [guideId, isEditing]);

  const loadGuide = async (id: string) => {
    setLoading(true);
    try {
      const response = await guideAPI.getById(id);
      const guide = response.data.data || response.data;
      setFormData({
        name: guide.name,
        class: guide.class,
        subject: guide.subject,
        price: guide.price.toString(),
        quantity: guide.quantity.toString(),
        publisher: guide.publisher || '',
      });
    } catch (error) {
      console.error('Failed to load guide:', error);
      setApiError('Failed to load guide details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateGuideForm(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setApiError('');

    try {
      if (isEditing && guideId) {
        await guideAPI.update(guideId, formData);
      } else {
        await guideAPI.create(formData);
      }
      navigate('/guides');
    } catch (error: any) {
      console.error('Failed to save guide:', error);
      setApiError(error?.response?.data?.message || 'Failed to save guide');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate('/guides');
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
          <h1>{isEditing ? 'Edit Guide' : 'Create New Guide'}</h1>
        </header>

        <div className="form-container" style={{ maxWidth: '600px', margin: '20px' }}>
          {apiError && (
            <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', marginBottom: '16px', borderRadius: '4px' }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Guide Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter guide name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              {formErrors.find((e) => e.field === 'name') && (
                <span style={{ color: '#c33', fontSize: '12px' }}>
                  {formErrors.find((e) => e.field === 'name')?.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Class *</label>
              <input
                type="text"
                name="class"
                placeholder="e.g., 10, 12"
                value={formData.class}
                onChange={handleInputChange}
                required
              />
              {formErrors.find((e) => e.field === 'class') && (
                <span style={{ color: '#c33', fontSize: '12px' }}>
                  {formErrors.find((e) => e.field === 'class')?.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                placeholder="e.g., Math, Science"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
              {formErrors.find((e) => e.field === 'subject') && (
                <span style={{ color: '#c33', fontSize: '12px' }}>
                  {formErrors.find((e) => e.field === 'subject')?.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
              {formErrors.find((e) => e.field === 'price') && (
                <span style={{ color: '#c33', fontSize: '12px' }}>
                  {formErrors.find((e) => e.field === 'price')?.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Quantity (Stock) *</label>
              <input
                type="number"
                name="quantity"
                placeholder="0"
                min="0"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
              {formErrors.find((e) => e.field === 'quantity') && (
                <span style={{ color: '#c33', fontSize: '12px' }}>
                  {formErrors.find((e) => e.field === 'quantity')?.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Publisher</label>
              <input
                type="text"
                name="publisher"
                placeholder="Enter publisher name"
                value={formData.publisher}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Guide' : 'Create Guide'}
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

export default GuideCreationPage;
