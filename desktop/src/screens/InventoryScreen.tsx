import React, { useState, useEffect } from 'react';
import { inventoryAPI, guideAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

interface Guide {
  _id: string;
  id: number;
  name: string;
  price: number;
  category?: string;
}

interface Inventory {
  _id?: string;
  id: number;
  guideId: number;
  guideName: string;
  guidePrice: number;
  guideCategory?: string;
  warehouseLocation?: string;
  stockQuantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastRestocked?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  notes?: string;
}

const InventoryScreen: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    guideId: '',
    warehouseLocation: '',
    stockQuantity: '0',
    reorderLevel: '10',
    reorderQuantity: '50',
    status: 'in-stock' as Inventory['status'],
    notes: '',
  });

  // Stock adjustment state
  const [adjustment, setAdjustment] = useState('0');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, guidesRes] = await Promise.all([
        inventoryAPI.getAll(),
        guideAPI.getAll(),
      ]);
      
      const inventoryData = inventoryRes.data.data || [];
      const guidesData = guidesRes.data.data || guidesRes.data || [];
      
      setInventory(inventoryData);
      setGuides(guidesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load inventory data');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      guideId: '',
      warehouseLocation: '',
      stockQuantity: '0',
      reorderLevel: '10',
      reorderQuantity: '50',
      status: 'in-stock',
      notes: '',
    });
    setSelectedItem(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (item: Inventory) => {
    setFormData({
      guideId: String(item.guideId),
      warehouseLocation: item.warehouseLocation || '',
      stockQuantity: String(item.stockQuantity),
      reorderLevel: String(item.reorderLevel),
      reorderQuantity: String(item.reorderQuantity),
      status: item.status,
      notes: item.notes || '',
    });
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.guideId) {
      setError('Please select a guide');
      return;
    }

    try {
      const data = {
        guideId: Number(formData.guideId),
        warehouseLocation: formData.warehouseLocation,
        stockQuantity: Number(formData.stockQuantity),
        reorderLevel: Number(formData.reorderLevel),
        reorderQuantity: Number(formData.reorderQuantity),
        status: formData.status,
        notes: formData.notes,
      };

      if (selectedItem) {
        await inventoryAPI.update(String(selectedItem.id), data);
      } else {
        await inventoryAPI.create(data);
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save inventory:', error);
      setError(error.response?.data?.message || 'Failed to save inventory item');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await inventoryAPI.delete(String(id));
        fetchData();
      } catch (error) {
        console.error('Failed to delete inventory:', error);
        setError('Failed to delete inventory item');
      }
    }
  };

  const openAdjustStock = (item: Inventory) => {
    setSelectedItem(item);
    setAdjustment('0');
    setAdjustmentReason('');
    setShowAdjustStock(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const adjustValue = Number(adjustment);
    if (!Number.isFinite(adjustValue)) {
      setError('Invalid adjustment value');
      return;
    }

    try {
      await inventoryAPI.adjustStock(String(selectedItem.id), adjustValue, adjustmentReason);
      setShowAdjustStock(false);
      setSelectedItem(null);
      setAdjustment('0');
      setAdjustmentReason('');
      fetchData();
    } catch (error: any) {
      console.error('Failed to adjust stock:', error);
      setError(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'status-badge status-paid';
      case 'low-stock':
        return 'status-badge status-pending';
      case 'out-of-stock':
        return 'status-badge status-overdue';
      case 'discontinued':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Inventory Management</h1>
          <button onClick={() => setShowForm(true)} className="add-btn">
            + Add Inventory Item
          </button>
        </header>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', margin: '10px', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{selectedItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Guide *</label>
                  <select
                    value={formData.guideId}
                    onChange={(e) => setFormData({ ...formData, guideId: e.target.value })}
                    required
                    disabled={!!selectedItem}
                  >
                    <option value="">Select Guide</option>
                    {guides.map((guide) => (
                      <option key={guide._id || guide.id} value={guide.id}>
                        {guide.name} - ₹{guide.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Warehouse Location</label>
                  <input
                    type="text"
                    value={formData.warehouseLocation}
                    onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    placeholder="e.g., Warehouse A, Section 1"
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Level *</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Quantity *</label>
                  <input
                    type="number"
                    value={formData.reorderQuantity}
                    onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Inventory['status'] })}
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="save-btn">
                    {selectedItem ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAdjustStock && selectedItem && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Adjust Stock - {selectedItem.guideName}</h2>
              <p>Current Stock: <strong>{selectedItem.stockQuantity}</strong></p>
              <form onSubmit={handleAdjustStock}>
                <div className="form-group">
                  <label>Adjustment (use negative for decrease) *</label>
                  <input
                    type="number"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    required
                    placeholder="e.g., 50 or -10"
                  />
                </div>

                <div className="form-group">
                  <label>Reason</label>
                  <input
                    type="text"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="e.g., Restocking, Damage, Sale"
                  />
                </div>

                <p style={{ marginTop: '10px', color: '#666' }}>
                  New Stock: <strong>{selectedItem.stockQuantity + Number(adjustment)}</strong>
                </p>

                <div className="modal-actions">
                  <button type="submit" className="save-btn">
                    Adjust Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustStock(false);
                      setSelectedItem(null);
                    }}
                    className="cancel-btn"
                  >
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
          ) : inventory.length === 0 ? (
            <p className="empty-state">No inventory items found</p>
          ) : (
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Guide Name</th>
                  <th>Location</th>
                  <th>Stock</th>
                  <th>Reorder Level</th>
                  <th>Reorder Qty</th>
                  <th>Status</th>
                  <th>Last Restocked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.guideName}</td>
                    <td>{item.warehouseLocation || '-'}</td>
                    <td>
                      <strong style={{ color: item.stockQuantity <= item.reorderLevel ? '#EF4444' : '#22C55E' }}>
                        {item.stockQuantity}
                      </strong>
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>{item.reorderQuantity}</td>
                    <td>
                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.lastRestocked 
                        ? new Date(item.lastRestocked).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td>
                      <button onClick={() => openAdjustStock(item)} className="edit-btn" style={{ marginRight: '5px' }}>
                        Adjust
                      </button>
                      <button onClick={() => handleEdit(item)} className="edit-btn" style={{ marginRight: '5px' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="delete-btn">
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

export default InventoryScreen;
