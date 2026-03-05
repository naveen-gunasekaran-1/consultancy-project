import React, { useEffect, useState } from 'react';
import { invoiceAPI, paymentAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

interface InvoiceRef {
  _id: string;
  invoiceNumber: string;
  total?: number;
}

interface Payment {
  _id: string;
  invoiceId: InvoiceRef | string;
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'bank' | 'cheque' | 'credit_card';
  transactionId?: string;
  paymentDate: string;
  notes?: string;
}

const PAYMENT_METHODS: Payment['paymentMethod'][] = ['cash', 'upi', 'bank', 'cheque', 'credit_card'];

const EMPTY_FORM = {
  invoiceId: '',
  amount: '',
  paymentMethod: 'cash' as Payment['paymentMethod'],
  transactionId: '',
  notes: '',
};

const PaymentsScreen: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [paymentRes, invoiceRes] = await Promise.all([paymentAPI.getAll(), invoiceAPI.getAll()]);
      setPayments(paymentRes.data.data || []);
      setInvoices(invoiceRes.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch payment data:', err);
      setError('Failed to load payments. Please refresh.');
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

  const resolveInvoiceText = (invoiceRef: InvoiceRef | string): string => {
    if (typeof invoiceRef === 'string') {
      const invoice = invoices.find((item) => item._id === invoiceRef);
      return invoice?.invoiceNumber || invoiceRef;
    }
    return invoiceRef.invoiceNumber;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!editingId) {
      if (!formData.invoiceId) {
        setError('Invoice is required');
        return;
      }

      const amount = Number(formData.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        setError('Amount must be greater than 0');
        return;
      }
    }

    setSaving(true);
    try {
      if (editingId) {
        await paymentAPI.update(editingId, {
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId.trim(),
          notes: formData.notes.trim(),
        });
      } else {
        await paymentAPI.create({
          invoiceId: formData.invoiceId,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        });
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error('Failed to save payment:', err);
      setError(err?.response?.data?.message || 'Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingId(payment._id);
    setFormData({
      invoiceId: typeof payment.invoiceId === 'string' ? payment.invoiceId : payment.invoiceId._id,
      amount: String(payment.amount),
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId || '',
      notes: payment.notes || '',
    });
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this payment?')) {
      return;
    }

    try {
      await paymentAPI.delete(id);
      setPayments((currentPayments) => currentPayments.filter((payment) => payment._id !== id));
    } catch (err: any) {
      console.error('Failed to delete payment:', err);
      setError(err?.response?.data?.message || 'Failed to delete payment');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Payments Management</h1>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Record Payment
          </button>
        </header>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editingId ? 'Update Payment' : 'Record Payment'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Invoice *</label>
                  <select
                    value={formData.invoiceId}
                    onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                    disabled={Boolean(editingId)}
                  >
                    <option value="">Select invoice</option>
                    {invoices.map((invoice) => (
                      <option key={invoice._id} value={invoice._id}>
                        {invoice.invoiceNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    disabled={Boolean(editingId)}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as Payment['paymentMethod'] })}
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction ID</label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
          ) : payments.length === 0 ? (
            <div className="empty-state">
              <p>No payments recorded.</p>
            </div>
          ) : (
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{resolveInvoiceText(payment.invoiceId)}</td>
                    <td>Rs {Number(payment.amount || 0).toFixed(2)}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{payment.transactionId || '-'}</td>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(payment)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(payment._id)}>
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

export default PaymentsScreen;
