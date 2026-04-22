import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPurchaseRequests, approvePurchaseRequest, rejectPurchaseRequest } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { FiEye, FiCheck, FiX, FiClipboard, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AdminPurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewType, setViewType] = useState('table');
  const [actionModal, setActionModal] = useState({ show: false, request: null, action: '' });
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await getAllPurchaseRequests();
      setRequests(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAction = async () => {
    try {
      const data = { adminNotes };
      
      if (actionModal.action === 'approved') {
        await approvePurchaseRequest(actionModal.request._id, data);
      } else if (actionModal.action === 'rejected') {
        await rejectPurchaseRequest(actionModal.request._id, data);
      }
      
      setActionModal({ show: false, request: null, action: '' });
      setAdminNotes('');
      fetchRequests();
    } catch (err) { 
      console.error('Error updating purchase request:', err);
      alert(err.response?.data?.message || 'Failed to update request');
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-purchase-requests-page">
      <style>{`
        .admin-purchase-requests-page {
          padding: 0;
        }

        .page-header-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          border-radius: 0 0 20px 0;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-left h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-left p {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .stats-row {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 12px 16px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
        }

        .filters-section {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 0 30px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .view-controls {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
          margin-left: auto;
        }

        .view-btn {
          padding: 6px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .view-btn.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .content-section {
          padding: 0 30px;
        }

        .requests-table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          background: white;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
        }

        .requests-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .requests-table th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .requests-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }

        .requests-table tbody tr:hover {
          background: #f9fafb;
        }

        .property-name {
          font-weight: 600;
          color: #667eea;
          text-decoration: none;
        }

        .property-name:hover {
          text-decoration: underline;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          text-decoration: none;
        }

        .action-btn:hover {
          border-color: #667eea;
          background: #f3f4f6;
        }

        .action-btn.btn-success {
          color: #10b981;
        }

        .action-btn.btn-success:hover {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .action-btn.btn-danger {
          color: #ef4444;
        }

        .action-btn.btn-danger:hover {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .request-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }

        .request-card:hover {
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          transform: translateY(-4px);
        }

        .card-header-bar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 4px;
        }

        .request-card-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-property-title {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-customer-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .request-card-body {
          padding: 16px;
          flex: 1;
        }

        .card-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 13px;
        }

        .card-row:last-child {
          margin-bottom: 0;
        }

        .card-label {
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .card-value {
          color: #1f2937;
          font-weight: 600;
        }

        .status-badge-card {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge-card.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge-card.approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge-card.rejected {
          background: #fee2e2;
          color: #7f1d1d;
        }

        .request-card-footer {
          padding: 12px 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }

        .request-card-footer .action-btn {
          flex: 1;
        }

        .empty-state-section {
          text-align: center;
          padding: 80px 30px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
          opacity: 0.6;
        }

        .empty-state-section h2 {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 10px 0;
        }

        .empty-state-section p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        @media (max-width: 768px) {
          .page-header-section {
            flex-direction: column;
            align-items: flex-start;
            padding: 30px 20px;
          }

          .header-left h1 {
            font-size: 24px;
          }

          .stats-row {
            width: 100%;
          }

          .filters-section {
            padding: 0 20px;
            flex-direction: column;
            align-items: flex-start;
          }

          .view-controls {
            margin-left: 0;
            width: 100%;
          }

          .view-btn {
            flex: 1;
          }

          .content-section {
            padding: 0 20px;
          }

          .requests-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header-section">
        <div className="header-left">
          <h1><FiClipboard /> Purchase Requests</h1>
          <p>Review and manage all customer purchase requests</p>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <span>Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card">
            <span>Pending</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-card">
            <span>Approved</span>
            <span className="stat-value">{stats.approved}</span>
          </div>
          <div className="stat-card">
            <span>Rejected</span>
            <span className="stat-value">{stats.rejected}</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-buttons">
          {[
            { value: 'all', label: 'All', icon: FiClipboard },
            { value: 'pending', label: 'Pending', icon: FiClock },
            { value: 'approved', label: 'Approved', icon: FiCheckCircle },
            { value: 'rejected', label: 'Rejected', icon: FiXCircle }
          ].map(f => (
            <button 
              key={f.value}
              className={`filter-btn ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label} ({f.value === 'all' ? requests.length : requests.filter(r => r.status === f.value).length})
            </button>
          ))}
        </div>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewType === 'table' ? 'active' : ''}`}
            onClick={() => setViewType('table')}
          >
            Table
          </button>
          <button 
            className={`view-btn ${viewType === 'grid' ? 'active' : ''}`}
            onClick={() => setViewType('grid')}
          >
            Grid
          </button>
        </div>
      </div>

      <div className="content-section">
        {filtered.length === 0 ? (
          <div className="empty-state-section">
            <div className="empty-icon">📋</div>
            <h2>No Purchase Requests</h2>
            <p>No {filter !== 'all' ? filter : ''} purchase requests found</p>
          </div>
        ) : viewType === 'table' ? (
          <div className="requests-table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req._id}>
                    <td>
                      <a href={`/admin/properties/${req.property?._id}`} className="property-name">
                        {req.property?.title || 'N/A'}
                      </a>
                    </td>
                    <td><strong>{req.customerName}</strong></td>
                    <td>{req.customerEmail}</td>
                    <td>{req.customerPhone}</td>
                    <td>
                      <span className={`status-badge-card ${req.status}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(req.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/purchase-requests/${req._id}`} className="action-btn" title="View">
                          <FiEye />
                        </Link>
                        {req.status === 'pending' && (
                          <>
                            <button 
                              className="action-btn btn-success" 
                              onClick={() => setActionModal({ show: true, request: req, action: 'approved' })}
                              title="Approve"
                            >
                              <FiCheck />
                            </button>
                            <button 
                              className="action-btn btn-danger" 
                              onClick={() => setActionModal({ show: true, request: req, action: 'rejected' })}
                              title="Reject"
                            >
                              <FiX />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="requests-grid">
            {filtered.map(req => (
              <div key={req._id} className="request-card">
                <div className="card-header-bar"></div>
                <div className="request-card-header">
                  <h3 className="card-property-title">{req.property?.title || 'Property'}</h3>
                  <div className="card-customer-info">
                    <strong>{req.customerName}</strong>
                  </div>
                </div>

                <div className="request-card-body">
                  <div className="card-row">
                    <span className="card-label">Status</span>
                    <span className={`status-badge-card ${req.status}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Email</span>
                    <span className="card-value">{req.customerEmail}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Phone</span>
                    <span className="card-value">{req.customerPhone}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Requested</span>
                    <span className="card-value">{formatDate(req.createdAt)}</span>
                  </div>
                </div>

                <div className="request-card-footer">
                  <Link to={`/admin/purchase-requests/${req._id}`} className="action-btn" title="View">
                    <FiEye /> View
                  </Link>
                  {req.status === 'pending' && (
                    <>
                      <button 
                        className="action-btn btn-success" 
                        onClick={() => setActionModal({ show: true, request: req, action: 'approved' })}
                        title="Approve"
                      >
                        <FiCheck /> Approve
                      </button>
                      <button 
                        className="action-btn btn-danger" 
                        onClick={() => setActionModal({ show: true, request: req, action: 'rejected' })}
                        title="Reject"
                      >
                        <FiX /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        show={actionModal.show}
        title={`${actionModal.action === 'approved' ? 'Approve' : 'Reject'} Request`}
        message={
          <div>
            <p>Are you sure you want to <strong>{actionModal.action === 'approved' ? 'approve' : 'reject'}</strong> this purchase request from <strong>{actionModal.request?.customerName}</strong>?</p>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Admin Notes</label>
              <textarea className="form-control" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows="3" placeholder="Add notes..." />
            </div>
          </div>
        }
        onConfirm={handleAction}
        onCancel={() => { setActionModal({ show: false, request: null, action: '' }); setAdminNotes(''); }}
        confirmText={actionModal.action === 'approved' ? 'Approve' : 'Reject'}
      />
    </div>
  );
};

export default AdminPurchaseRequests;
