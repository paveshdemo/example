import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createChangeRequest, getMyProperties } from '../../services/dataService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CustomerChangeRequestCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    property: searchParams.get('property') || '',
    type: 'modification',
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyProperties();
        setProperties(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createChangeRequest(form);
      navigate('/customer/change-requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>🔧 Submit New Maintenance Request</h1></div>
      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Property *</label>
            <select className="form-control" value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} required>
              <option value="">Select Property</option>
              {properties.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="modification">Modification</option>
                <option value="repair">Repair</option>
                <option value="upgrade">Upgrade</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Title *</label><input type="text" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group"><label>Description *</label><textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="4" required /></div>
          <div className="btn-group" style={{ marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/customer/change-requests')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerChangeRequestCreate;
