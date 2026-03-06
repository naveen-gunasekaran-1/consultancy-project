import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI, paymentAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

interface Client {
  _id: string;
  name: string;
  email: string;
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

const INVOICE_STATUSES: Array<Invoice['status']> = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

interface Payment {
  _id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentDate: string;
  notes?: string;
}

const InvoicesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const invoiceRes = await invoiceAPI.getAll();
      setInvoices(invoiceRes.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch invoice data:', err);
      setError('Failed to load invoices. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientRef: Client | string): string => {
    if (typeof clientRef === 'string') {
      return clientRef;
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

  const handleViewDetails = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSelectedPayment(null);
    
    // If invoice is paid, fetch its payment details
    if (invoice.status === 'paid') {
      try {
        const response = await paymentAPI.getByInvoiceId(invoice._id);
        const payments = response.data.data || [];
        if (payments.length > 0) {
          setSelectedPayment(payments[0]); // Show the first/most recent payment
        }
      } catch (err: any) {
        console.error('Failed to fetch payment details:', err);
      }
    }
    
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedInvoice(null);
    setSelectedPayment(null);
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
          <button className="add-btn" onClick={() => navigate('/invoices/create')}>
            + Create Invoice
          </button>
        </header>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c33', margin: '10px', borderRadius: '4px' }}>
            {error}
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
                  <strong>Status:</strong> <span style={{ textTransform: 'capitalize', padding: '4px 8px', borderRadius: '4px', backgroundColor: selectedInvoice.status === 'paid' ? '#22C55E' : selectedInvoice.status === 'draft' ? '#GRAY' : selectedInvoice.status === 'overdue' ? '#EF4444' : '#F59E0B', color: 'white' }}>{selectedInvoice.status}</span>
                </div>
                {selectedInvoice.status === 'paid' ? (
                  <>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Payment Status:</strong> Paid
                    </div>
                    {selectedPayment && (
                      <>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Amount Paid:</strong> Rs {selectedPayment.amount.toFixed(2)}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Payment Method:</strong> {selectedPayment.paymentMethod}
                        </div>
                        {selectedPayment.transactionId && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong>Transaction ID:</strong> {selectedPayment.transactionId}
                          </div>
                        )}
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Payment Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                        </div>
                        {selectedPayment.notes && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong>Payment Notes:</strong> {selectedPayment.notes}
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {selectedInvoice.dueDate && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Remaining Balance:</strong> Rs {selectedInvoice.total.toFixed(2)}
                    </div>
                  </>
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
