import React, { useState, useEffect } from 'react';
import { guideAPI } from '../services/api';
import { validateGuideForm, ValidationError } from '../utils/validation';
import Sidebar from '../components/Sidebar';
import './GuidesScreen.css';

interface Guide {
  _id: string;
  name: string;
  class: string;
  subject: string;
  price: number;
  quantity: number;
  publisher?: string;
}

const GuidesScreen: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<ValidationError[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    subject: '',
    price: '',
    quantity: '',
    publisher: '',
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await guideAPI.getAll();
      setGuides(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch guides:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateGuideForm(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingId) {
        await guideAPI.update(editingId, formData);
      } else {
        await guideAPI.create(formData);
      }
      resetForm();
      fetchGuides();
    } catch (error) {
      console.error('Failed to save guide:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      try {
        await guideAPI.delete(id);
        fetchGuides();
      } catch (error) {
        console.error('Failed to delete guide:', error);
      }
    }
  };

  const handleEdit = (guide: Guide) => {
    setFormData({
      name: guide.name,
      class: guide.class,
      subject: guide.subject,
      price: guide.price.toString(),
      quantity: guide.quantity.toString(),
      publisher: guide.publisher || '',
    });
    setEditingId(guide._id);
    setShowForm(true);
    setFormErrors([]);
  };

  const resetForm = () => {
    setFormData({ name: '', class: '', subject: '', price: '', quantity: '', publisher: '' });
    setEditingId(null);
    setShowForm(false);
    setFormErrors([]);
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return formErrors.find((e) => e.field === fieldName)?.message;
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Guides Management</h1>
          <button onClick={() => setShowForm(true)} className="add-btn">
            + Add Guide
          </button>
        </header>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editingId ? 'Edit Guide' : 'Add New Guide'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Guide Name *</label>
                  <input
                    type="text"
                    placeholder="Guide Name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors(formErrors.filter((e) => e.field !== 'name'));
                    }}
                    className={getFieldError('name') ? 'error' : ''}
                  />
                  {getFieldError('name') && <span className="field-error">{getFieldError('name')}</span>}
                </div>

                <div className="form-group">
                  <label>Class *</label>
                  <input
                    type="text"
                    placeholder="Class (e.g., 10th, 12th)"
                    value={formData.class}
                    onChange={(e) => {
                      setFormData({ ...formData, class: e.target.value });
                      setFormErrors(formErrors.filter((e) => e.field !== 'class'));
                    }}
                    className={getFieldError('class') ? 'error' : ''}
                  />
                  {getFieldError('class') && <span className="field-error">{getFieldError('class')}</span>}
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => {
                      setFormData({ ...formData, subject: e.target.value });
                      setFormErrors(formErrors.filter((e) => e.field !== 'subject'));
                    }}
                    className={getFieldError('subject') ? 'error' : ''}
                  />
                  {getFieldError('subject') && <span className="field-error">{getFieldError('subject')}</span>}
                </div>

                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      setFormErrors(formErrors.filter((e) => e.field !== 'price'));
                    }}
                    className={getFieldError('price') ? 'error' : ''}
                  />
                  {getFieldError('price') && <span className="field-error">{getFieldError('price')}</span>}
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(e) => {
                      setFormData({ ...formData, quantity: e.target.value });
                      setFormErrors(formErrors.filter((e) => e.field !== 'quantity'));
                    }}
                    className={getFieldError('quantity') ? 'error' : ''}
                  />
                  {getFieldError('quantity') && <span className="field-error">{getFieldError('quantity')}</span>}
                </div>

                <div className="form-group">
                  <label>Publisher (optional)</label>
                  <input
                    type="text"
                    placeholder="Publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="save-btn">
                    Save
                  </button>
                  <button type="button" onClick={resetForm} className="cancel-btn">
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
          ) : guides.length === 0 ? (
            <p className="empty-state">No guides found</p>
          ) : (
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Publisher</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((guide) => (
                  <tr key={guide._id}>
                    <td>{guide.name}</td>
                    <td>{guide.class}</td>
                    <td>{guide.subject}</td>
                    <td>₹{guide.price}</td>
                    <td>{guide.quantity}</td>
                    <td>{guide.publisher || '-'}</td>
                    <td>
                      <button onClick={() => handleEdit(guide)} className="edit-btn">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(guide._id)}
                        className="delete-btn"
                      >
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

export default GuidesScreen;
