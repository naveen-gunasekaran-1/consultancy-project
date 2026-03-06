import React, { useEffect, useState } from 'react';
import { orderAPI, guideAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
import './GuidesScreen.css';

interface Guide {
  _id: string;
  name: string;
  price: number;
}

interface Order {
  _id: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber?: string;
  guideId: string;
  productName: string;
  quantity: number;
  dispatchDate: string;
  amount: number;
  amountReceived: number;
  balanceAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
  notes?: string;
}

const PAYMENT_STATUSES = ['pending', 'partial', 'paid'] as const;
const PAYMENT_METHODS = ['cash', 'upi', 'bank', 'cheque', 'credit_card'] as const;

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    guideId: '',
    quantity: '1',
    amount: '',
    notes: '',
  });

  // Update form
  const [updateData, setUpdateData] = useState({
    amountReceived: '',
    paymentStatus: 'pending' as 'pending' | 'partial' | 'paid',
    paymentMethod: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const ordersRes = await orderAPI.getAll();
      const guidesRes = await guideAPI.getAll();
      
      setOrders(ordersRes.data?.data || []);
      setGuides(guidesRes.data?.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load orders. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!formData.driverName || !formData.driverPhone || !formData.guideId || !formData.amount) {
        setError('Please fill all required fields');
        setSaving(false);
        return;
      }

      const response = await orderAPI.create({
        driverName: formData.driverName,
        driverPhone: formData.driverPhone,
        vehicleNumber: formData.vehicleNumber || undefined,
        guideId: formData.guideId,
        quantity: parseInt(formData.quantity),
        amount: parseFloat(formData.amount),
        notes: formData.notes || undefined,
      });

      setOrders([response.data.data, ...orders]);
      resetForm();
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setError(err?.response?.data?.message || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setSaving(true);
    setError('');

    try {
      const response = await orderAPI.update(selectedOrder._id, {
        amountReceived: updateData.amountReceived ? parseFloat(updateData.amountReceived) : selectedOrder.amountReceived,
        paymentStatus: updateData.paymentStatus || selectedOrder.paymentStatus,
        paymentMethod: updateData.paymentMethod || selectedOrder.paymentMethod,
        notes: updateData.notes || selectedOrder.notes,
      });

      setOrders(orders.map((o) => (o._id === selectedOrder._id ? response.data.data : o)));
      handleCloseDetails();
    } catch (err: any) {
      console.error('Failed to update order:', err);
      setError(err?.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this order?')) {
      return;
    }

    try {
      await orderAPI.delete(id);
      setOrders((currentOrders) => currentOrders.filter((order) => order._id !== id));
    } catch (err: any) {
      console.error('Failed to delete order:', err);
      setError(err?.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      amountReceived: order.amountReceived.toString(),
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || '',
      notes: order.notes || '',
    });
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedOrder(null);
  };

  const resetForm = () => {
    setFormData({
      driverName: '',
      driverPhone: '',
      vehicleNumber: '',
      guideId: '',
      quantity: '1',
      amount: '',
      notes: '',
    });
    setShowForm(false);
    setError('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#22C55E';
      case 'partial':
        return '#F59E0B';
      case 'pending':
        return '#EF4444';
      default:
        return '#666';
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Orders & Dispatch Management</h1>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + New Order
          </button>
        </header>

        {error && <div style={{ padding: '10px', backgroundColor: '#fee', color: '#c33', marginBottom: '10px', borderRadius: '4px' }}>{error}</div>}

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Create Dispatch Order</h2>
              <form onSubmit={handleCreateOrder}>
                <div className="form-group">
                  <label>Driver Name *</label>
                  <input
                    type="text"
                    placeholder="Enter driver name"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Driver Phone *</label>
                  <input
                    type="tel"
                    placeholder="Enter driver phone"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="Enter vehicle number"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Product *</label>
                  <select value={formData.guideId} onChange={(e) => setFormData({ ...formData, guideId: e.target.value })} required>
                    <option value="">Select product</option>
                    {guides.map((guide) => (
                      <option key={guide._id} value={guide._id}>
                        {guide.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Order'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={resetForm} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetails && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '600px' }}>
              <h2>Update Order - {selectedOrder.driverName}</h2>

              <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Product:</strong> {selectedOrder.productName}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Quantity:</strong> {selectedOrder.quantity}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Total Amount:</strong> ₹{selectedOrder.amount.toFixed(2)}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Amount Received:</strong> ₹{selectedOrder.amountReceived.toFixed(2)}
                </div>
                <div>
                  <strong>Balance:</strong> ₹{selectedOrder.balanceAmount.toFixed(2)}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateOrder();
                }}
              >
                <div className="form-group">
                  <label>Amount Received (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={selectedOrder.amount}
                    placeholder="Amount received"
                    value={updateData.amountReceived}
                    onChange={(e) => setUpdateData({ ...updateData, amountReceived: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Status</label>
                  <select value={updateData.paymentStatus} onChange={(e) => setUpdateData({ ...updateData, paymentStatus: e.target.value as typeof updateData.paymentStatus })}>
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={updateData.paymentMethod} onChange={(e) => setUpdateData({ ...updateData, paymentMethod: e.target.value })}>
                    <option value="">Select method</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={updateData.notes} onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })} />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Updating...' : 'Update'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCloseDetails} disabled={saving}>
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="content-area">
          {loading ? (
            <p>Loading...</p>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found.</p>
            </div>
          ) : (
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Received</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.driverName}</td>
                    <td>{order.productName}</td>
                    <td>{order.quantity}</td>
                    <td>₹{order.amount.toFixed(2)}</td>
                    <td>₹{order.amountReceived.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold', color: order.balanceAmount > 0 ? '#EF4444' : '#22C55E' }}>₹{order.balanceAmount.toFixed(2)}</td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: getStatusColor(order.paymentStatus), color: 'white', fontSize: '12px' }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(order.dispatchDate).toLocaleDateString()}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleViewDetails(order)}>
                        Update
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(order._id)}>
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

export default OrdersScreen;
