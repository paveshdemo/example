import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFeedback } from '../../services/dataService';
import { FiStar } from 'react-icons/fi';

const CustomerFeedbackCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', message: '', category: 'general', rating: 5 });
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createFeedback(form);
      navigate('/customer/feedback');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-header"><h1>Submit Feedback</h1></div>
      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title *</label><input type="text" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="general">General</option>
              <option value="service">Service</option>
              <option value="construction">Construction</option>
              <option value="payment">Payment</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Rating</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar
                  key={star}
                  size={28}
                  style={{ cursor: 'pointer' }}
                  fill={(hover || form.rating) >= star ? '#ffd166' : 'none'}
                  color="#ffd166"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setForm({ ...form, rating: star })}
                />
              ))}
            </div>
          </div>
          <div className="form-group"><label>Message *</label><textarea className="form-control" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="5" required /></div>
          <div className="btn-group" style={{ marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Feedback'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/customer/feedback')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFeedbackCreate;
