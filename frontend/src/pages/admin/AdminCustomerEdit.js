import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../../services/dataService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getUser(id);
        const u = res.data.data;
        setFormData({ name: u.name, email: u.email, phone: u.phone || '', address: u.address || '', isActive: u.isActive });
      } catch { navigate('/admin/customers'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateUser(id, formData);
      navigate(`/admin/customers/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>Edit Customer</h1></div>
      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Name *</label><input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
          <div className="form-group"><label>Phone</label><input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
          <div className="form-group"><label>Address</label><textarea className="form-control" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="3" /></div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Active Account
            </label>
          </div>
          <div className="btn-group" style={{ marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCustomerEdit;
