import React, { useEffect, useMemo, useState } from 'react';
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

interface InvoiceItem {
  guideId: string;
  guideName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: Client | string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxPercentage: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string;
  notes?: string;
}

interface DraftItem {
  id: string;
  guideId: string;
  quantity: string;
  unitPrice: string;
}

const INVOICE_STATUSES: Array<Invoice['status']> = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

const createDraftItem = (): DraftItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  guideId: '',
  quantity: '1',
  unitPrice: '',
});

const InvoicesScreen: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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
      const [invoiceRes, clientRes, guideRes] = await Promise.all([
        invoiceAPI.getAll(),
        clientAPI.getAll(),
        guideAPI.getAll(),
      ]);
      setInvoices(invoiceRes.data.data || []);
      setClients(clientRes.data.data || []);
      setGuides(guideRes.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch invoice data:', err);
      setError('Failed to load invoices. Please refresh.');
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

  const resetForm = () => {
    setSelectedClientId('');
    setTaxPercentage('18');
    setNotes('');
    setItems([createDraftItem()]);
    setShowForm(false);
    setError('');
  };

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

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
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
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error('Failed to create invoice:', err);
      setError(err?.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const getClientName = (clientRef: Client | string): string => {
    if (typeof clientRef === 'string') {
      const client = clients.find((c) => c._id === clientRef);
      return client?.name || 'Unknown client';
    }
    return clientRef?.name || 'Unknown client';
  };

  const handleStatusChange = async (invoiceId: string, status: Invoice['status']) => {
    try {
      const response = await invoiceAPI.updateStatus(invoiceId, status);
      const updated = response.data?.data;
      setInvoices((currentInvoices) =>
        currentInvoices.map((invoice) => (invoice._id === invoiceId ? { ...invoice, ...(updated || { status }) } : invoice))
      );
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err?.response?.data?.message || 'Failed to update invoice status');
    }
  };

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await invoiceAPI.downloadPDF(invoiceId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download PDF:', err);
      setError(err?.response?.data?.message || 'Failed to download invoice PDF');
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedInvoice(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this invoice?')) {
      return;
    }

    try {
      await invoiceAPI.delete(id);
      setInvoices((currentInvoices) => currentInvoices.filter((invoice) => invoice._id !== id));
    } catch (err: any) {
      console.error('Failed to delete invoice:', err);
      setError(err?.response?.data?.message || 'Failed to delete invoice');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Invoices Management</h1>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Create Invoice
          </button>
        </header>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Create Invoice</h2>
              <form onSubmit={handleCreateInvoice}>
                <div className="form-group">
                  <label>Client *</label>
                  <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                    <option value="">Select client</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                {items.map((item, index) => (
                  <div className="form-group" key={item.id}>
                    <label>Item {index + 1}</label>
                    <select value={item.guideId} onChange={(e) => updateItem(item.id, 'guideId', e.target.value)}>
                      <option value="">Select guide</option>
                      {guides.map((guide) => (
                        <option key={guide._id} value={guide._id}>
                          {guide.name} (Rs {guide.price})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                    />
                    <button type="button" className="delete-btn" onClick={() => removeItemRow(item.id)}>
                      Remove Item
                    </button>
                  </div>
                ))}

                <button type="button" className="edit-btn" onClick={addItemRow}>
                  + Add Another Item
                </button>

                <div className="form-group">
                  <label>Tax Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Subtotal: Rs {totals.subtotal.toFixed(2)}</label>
                  <label>Tax: Rs {totals.tax.toFixed(2)}</label>
                  <label>Total: Rs {totals.total.toFixed(2)}</label>
                </div>

                {error && <span className="field-error">{error}</span>}

                <div className="modal-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Creating...' : 'Create'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={resetForm} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetails && selectedInvoice && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2>Invoice Details</h2>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Client:</strong> {getClientName(selectedInvoice.clientId)}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedInvoice.status}</span>
                </div>
                {selectedInvoice.dueDate && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </div>
                )}
                {selectedInvoice.notes && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Notes:</strong> {selectedInvoice.notes}
                  </div>
                )}
              </div>

              <h3>Items</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Guide</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{item.guideName}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>Rs {item.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>Rs {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                <div style={{ marginBottom: '5px' }}>Subtotal: Rs {selectedInvoice.subtotal.toFixed(2)}</div>
                <div style={{ marginBottom: '5px' }}>Tax ({selectedInvoice.taxPercentage}%): Rs {selectedInvoice.tax.toFixed(2)}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Total: Rs {selectedInvoice.total.toFixed(2)}</div>
              </div>

              <div className="modal-actions">
                <button className="edit-btn" onClick={() => handleDownloadPDF(selectedInvoice._id, selectedInvoice.invoiceNumber)}>
                  Download PDF
                </button>
                <button className="cancel-btn" onClick={handleCloseDetails}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content-area">
          {loading ? (
            <p>Loading...</p>
          ) : invoices.length === 0 ? (
            <div className="empty-state">
              <p>No invoices found.</p>
            </div>
          ) : (
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{getClientName(invoice.clientId)}</td>
                    <td>Rs {Number(invoice.total || 0).toFixed(2)}</td>
                    <td>
                      <select
                        className={`status-badge status-${invoice.status}`}
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice._id, e.target.value as Invoice['status'])}
                      >
                        {INVOICE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {invoice.status !== 'paid' && invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString()
                        : invoice.status === 'paid'
                        ? '—'
                        : 'No date'}
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => handleViewDetails(invoice)}>
                        View
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(invoice._id)}>
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

export default InvoicesScreen;
