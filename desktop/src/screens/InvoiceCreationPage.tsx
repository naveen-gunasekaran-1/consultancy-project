import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAPI, guideAPI, invoiceAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

interface Client {
  _id: string;
  name: string;
  email: string;
}

interface Guide {
  _id: string;
  name: string;
  price: number;
}

interface DraftItem {
  id: string;
  guideId: string;
  quantity: string;
  unitPrice: string;
}

const createDraftItem = (): DraftItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  guideId: '',
  quantity: '1',
  unitPrice: '',
});

const InvoiceCreationPage: React.FC = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [selectedClientId, setSelectedClientId] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('18');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([createDraftItem()]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientRes, guideRes] = await Promise.all([clientAPI.getAll(), guideAPI.getAll()]);
      setClients(clientRes.data.data || []);
      setGuides(guideRes.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load clients or guides');
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      if (!item.guideId || !Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
        return sum;
      }
      if (quantity <= 0 || unitPrice < 0) {
        return sum;
      }
      return sum + quantity * unitPrice;
    }, 0);

    const taxPct = Number(taxPercentage);
    const tax = Number.isFinite(taxPct) ? (subtotal * taxPct) / 100 : 0;
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }, [items, taxPercentage]);

  const updateItem = (id: string, key: keyof DraftItem, value: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (key === 'guideId') {
          const selectedGuide = guides.find((guide) => guide._id === value);
          return {
            ...item,
            guideId: value,
            unitPrice: selectedGuide ? String(selectedGuide.price) : item.unitPrice,
          };
        }

        return { ...item, [key]: value };
      })
    );
  };

  const addItemRow = () => {
    setItems((currentItems) => [...currentItems, createDraftItem()]);
  };

  const removeItemRow = (id: string) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }
      return currentItems.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      setError('Please select a client.');
      return;
    }

    const processedItems = items
      .map((item) => ({
        guideId: item.guideId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }))
      .filter((item) => item.guideId && Number.isFinite(item.quantity) && Number.isFinite(item.unitPrice) && item.quantity > 0 && item.unitPrice >= 0);

    if (processedItems.length === 0) {
      setError('Add at least one valid invoice item.');
      return;
    }

    const taxPct = Number(taxPercentage);
    if (!Number.isFinite(taxPct) || taxPct < 0 || taxPct > 100) {
      setError('Tax percentage must be between 0 and 100.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await invoiceAPI.create({
        clientId: selectedClientId,
        items: processedItems,
        taxPercentage: taxPct,
        notes: notes.trim(),
      });
      navigate('/invoices');
    } catch (err: any) {
      console.error('Failed to create invoice:', err);
      setError(err?.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/invoices');
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
          <h1>Create Invoice</h1>
        </header>

        <div style={{ maxWidth: '1000px', margin: '20px' }}>
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', marginBottom: '16px', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Client Selection */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h3>Invoice Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Select Client *</label>
                  <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} required>
                    <option value="">-- Choose a client --</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tax Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="18"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h3>Invoice Items</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Product</th>
                    <th style={{ textAlign: 'center', padding: '8px', width: '100px' }}>Quantity</th>
                    <th style={{ textAlign: 'right', padding: '8px', width: '120px' }}>Unit Price (₹)</th>
                    <th style={{ textAlign: 'right', padding: '8px', width: '120px' }}>Total (₹)</th>
                    <th style={{ textAlign: 'center', padding: '8px', width: '60px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const itemTotal = Number.isFinite(Number(item.quantity)) && Number.isFinite(Number(item.unitPrice)) ? Number(item.quantity) * Number(item.unitPrice) : 0;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px' }}>
                          <select
                            value={item.guideId}
                            onChange={(e) => updateItem(item.id, 'guideId', e.target.value)}
                            style={{ width: '100%', padding: '6px' }}
                            required
                          >
                            <option value="">Select product</option>
                            {guides.map((guide) => (
                              <option key={guide._id} value={guide._id}>
                                {guide.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '6px', textAlign: 'center' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                            style={{ width: '100%', padding: '6px', textAlign: 'right' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>₹{itemTotal.toFixed(2)}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removeItemRow(item.id)}
                            style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button
                type="button"
                onClick={addItemRow}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                }}
              >
                + Add Item
              </button>
            </div>

            {/* Totals */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #ddd' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Subtotal:</strong> ₹{totals.subtotal.toFixed(2)}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Tax ({taxPercentage}%):</strong> ₹{totals.tax.toFixed(2)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
                  <strong>Total:</strong> ₹{totals.total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Notes</label>
              <textarea
                placeholder="Add any notes for this invoice"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ddd' }}
              />
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
                style={{ padding: '10px 20px', fontSize: '16px' }}
              >
                {saving ? 'Creating...' : 'Create Invoice'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={saving}
                style={{ padding: '10px 20px', fontSize: '16px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreationPage;
