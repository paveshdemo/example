import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/dataService';
import { getStatusLabel } from '../../utils/helpers';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await updateProfile(formData);
      updateUser(res.data.data);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p className="subtitle">Manage your account information</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header"><h3>Account Details</h3></div>
          <div className="detail-item">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
          <div className="detail-item">
            <label>Role</label>
            <p>{getStatusLabel(user?.role)}</p>
          </div>
          <div className="detail-item">
            <label>Account Status</label>
            <p style={{ color: user?.isActive ? '#28a745' : '#dc3545' }}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div className="detail-item">
            <label>Member Since</label>
            <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Edit Profile</h3></div>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text" className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text" className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                className="form-control" rows="3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
