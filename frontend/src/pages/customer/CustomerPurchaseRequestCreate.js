import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPurchaseRequest } from '../../services/dataService';

const CustomerPurchaseRequestCreate = () => {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createPurchaseRequest({
        propertyId: propertyId,
        customerPhone: phone,
        notes
      });
      navigate('/customer/purchase-requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-header"><h1>Submit Purchase Request</h1></div>
      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" className="form-control" value={user?.name || ''} disabled />
          </div>
          <div className="form-group">
            <label>Your Email</label>
            <input type="email" className="form-control" value={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" placeholder="Any additional information..." />
          </div>
          <div className="btn-group" style={{ marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerPurchaseRequestCreate;
