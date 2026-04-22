import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest } from '../../services/dataService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiArrowLeft } from 'react-icons/fi';

const AdminPurchaseRequestView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPurchaseRequest(id);
        setRequest(res.data.data);
        setAdminNotes(res.data.data.adminNotes || '');
      } catch { navigate('/admin/purchase-requests'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleAction = async (status) => {
    setProcessing(true);
    try {
      const data = { adminNotes };
      
      if (status === 'approved') {
        await approvePurchaseRequest(id, data);
      } else if (status === 'rejected') {
        await rejectPurchaseRequest(id, data);
      }
      
      const res = await getPurchaseRequest(id);
      setRequest(res.data.data);
      setAdminNotes(res.data.data.adminNotes || '');
    } catch (err) { 
      console.error('Error updating purchase request:', err);
      alert(err.response?.data?.message || 'Failed to update request');
    }
    finally { setProcessing(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return null;

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate('/admin/purchase-requests')}><FiArrowLeft /> Back</button>
        <h1>Purchase Request Details</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3>Customer Information</h3>
          <div className="detail-grid">
            <div><span className="detail-label">Name</span><span>{request.customerName}</span></div>
            <div><span className="detail-label">Email</span><span>{request.customerEmail}</span></div>
            <div><span className="detail-label">Phone</span><span>{request.customerPhone}</span></div>
            <div><span className="detail-label">Submitted</span><span>{formatDate(request.createdAt)}</span></div>
            <div><span className="detail-label">Status</span><StatusBadge status={request.status} /></div>
          </div>
          {request.notes && (
            <div style={{ marginTop: '16px' }}>
              <span className="detail-label">Customer Notes</span>
              <p>{request.notes}</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Property Information</h3>
          {request.property ? (
            <div className="detail-grid">
              <div><span className="detail-label">Title</span><span>{request.property.title}</span></div>
              <div><span className="detail-label">Type</span><span>{request.property.type}</span></div>
              <div><span className="detail-label">Price</span><span>{formatCurrency(request.property.price)}</span></div>
              <div><span className="detail-label">Location</span><span>{request.property.location?.city}, {request.property.location?.state}</span></div>
              <div><span className="detail-label">Status</span><StatusBadge status={request.property.status} /></div>
            </div>
          ) : <p>Property not found</p>}
        </div>
      </div>

      {request.status === 'pending' && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>Take Action</h3>
          <div className="form-group">
            <label>Admin Notes</label>
            <textarea className="form-control" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows="3" placeholder="Add notes for this decision..." />
          </div>
          <div className="btn-group" style={{ marginTop: '12px' }}>
            <button className="btn btn-success" onClick={() => handleAction('approved')} disabled={processing}>Approve Request</button>
            <button className="btn btn-danger" onClick={() => handleAction('rejected')} disabled={processing}>Reject Request</button>
          </div>
        </div>
      )}

      {request.reviewedBy && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>Review Information</h3>
          <div className="detail-grid">
            <div><span className="detail-label">Reviewed By</span><span>{request.reviewedBy?.name}</span></div>
            <div><span className="detail-label">Reviewed At</span><span>{formatDate(request.reviewedAt)}</span></div>
            {request.adminNotes && <div><span className="detail-label">Admin Notes</span><span>{request.adminNotes}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPurchaseRequestView;
