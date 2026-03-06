import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { guideAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import './BaseScreen.css';
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
  const navigate = useNavigate();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Guides Management</h1>
          <button onClick={() => navigate('/guides/create')} className="add-btn">
            + Add Guide
          </button>
        </header>

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
                      <button onClick={() => navigate(`/guides/create?id=${guide._id}`)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(guide._id)} className="delete-btn">
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
