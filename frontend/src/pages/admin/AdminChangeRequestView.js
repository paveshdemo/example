import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChangeRequest, updateChangeRequest } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiArrowLeft } from 'react-icons/fi';

const AdminChangeRequestView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getChangeRequest(id);
        setRequest(res.data.data);
        setAdminNotes(res.data.data.adminNotes || '');
      } catch { navigate('/admin/change-requests'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleAction = async (status) => {
    setProcessing(true);
    try {
      await updateChangeRequest(id, { status, adminNotes });
      const res = await getChangeRequest(id);
      setRequest(res.data.data);
    } catch (err) { console.error(err); }
    finally { setProcessing(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return null;

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate('/admin/change-requests')}><FiArrowLeft /> Back</button>
        <h1>Change Request Details</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3>Request Details</h3>
          <div className="detail-grid">
            <div><span className="detail-label">Title</span><span>{request.title}</span></div>
            <div><span className="detail-label">Type</span><span>{request.type}</span></div>
            <div><span className="detail-label">Priority</span><StatusBadge status={request.priority} /></div>
            <div><span className="detail-label">Status</span><StatusBadge status={request.status} /></div>
            <div><span className="detail-label">Created</span><span>{formatDate(request.createdAt)}</span></div>
          </div>
          <div style={{ marginTop: '16px' }}><span className="detail-label">Description</span><p>{request.description}</p></div>
        </div>

        <div className="card">
          <h3>Property & Customer</h3>
          <div className="detail-grid">
            <div><span className="detail-label">Property</span><span>{request.property?.title || 'N/A'}</span></div>
            <div><span className="detail-label">Customer</span><span>{request.customer?.name || 'N/A'}</span></div>
            <div><span className="detail-label">Email</span><span>{request.customer?.email || 'N/A'}</span></div>
          </div>
        </div>
      </div>

      {(request.status === 'pending' || request.status === 'in_review') && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>Take Action</h3>
          <div className="form-group">
            <label>Admin Notes</label>
            <textarea className="form-control" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows="3" />
          </div>
          <div className="btn-group" style={{ marginTop: '12px' }}>
            <button className="btn btn-success" onClick={() => handleAction('approved')} disabled={processing}>Approve</button>
            <button className="btn btn-warning" onClick={() => handleAction('in_review')} disabled={processing}>Mark In Review</button>
            <button className="btn btn-danger" onClick={() => handleAction('rejected')} disabled={processing}>Reject</button>
            <button className="btn btn-primary" onClick={() => handleAction('completed')} disabled={processing}>Mark Completed</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChangeRequestView;
