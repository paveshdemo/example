import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPurchaseRequests } from '../../services/dataService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiFileText, FiCheckCircle, FiClock, FiXCircle, FiArrowRight } from 'react-icons/fi';

const CustomerPurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('cards'); // cards or list

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyPurchaseRequests();
        setRequests(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle className="status-icon approved" />;
      case 'rejected':
        return <FiXCircle className="status-icon rejected" />;
      case 'pending':
        return <FiClock className="status-icon pending" />;
      default:
        return <FiFileText className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="purchase-requests-page">
      <style>{`
        .purchase-requests-page {
          padding: 0;
        }

        .header-section {
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

        .header-content h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-content p {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .browse-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .browse-btn:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .controls-bar {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 30px;
          padding: 0 30px;
          flex-wrap: wrap;
        }

        .view-toggle {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }

        .view-toggle button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .view-toggle button.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .requests-container {
          padding: 0 30px;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
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
        }

        .request-card:hover {
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          transform: translateY(-4px);
        }

        .request-card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .request-card-title {
          flex: 1;
        }

        .request-card-title h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .request-card-title p {
          margin: 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .status-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }

        .status-icon.approved {
          color: #10b981;
        }

        .status-icon.rejected {
          color: #ef4444;
        }

        .status-icon.pending {
          color: #f59e0b;
        }

        .request-card-body {
          padding: 20px;
        }

        .card-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-info-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .info-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-top: 4px;
        }

        .price-value {
          color: #667eea;
          font-size: 16px;
        }

        .status-badge-custom {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge-custom.approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge-custom.rejected {
          background: #fee2e2;
          color: #7f1d1d;
        }

        .status-badge-custom.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .request-card-footer {
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }

        .card-notes {
          background: #f9fafb;
          padding: 12px 20px;
          margin: 0 -20px -20px -20px;
          border-radius: 0 0 12px 12px;
          font-size: 13px;
          color: #6b7280;
          font-style: italic;
        }

        .card-notes strong {
          color: #1f2937;
          font-style: normal;
        }

        .requests-list {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .list-item {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 20px;
          align-items: center;
          transition: all 0.2s ease;
          background: white;
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .list-item:hover {
          background: #f9fafb;
        }

        .list-item-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          font-size: 24px;
        }

        .list-item-content {
          flex: 1;
        }

        .list-item-title {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .list-item-details {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 16px;
          font-size: 13px;
          color: #6b7280;
          margin-top: 8px;
        }

        .detail-item span {
          display: block;
          font-weight: 600;
          color: #1f2937;
          margin-top: 2px;
        }

        .list-item-actions {
          display: flex;
          gap: 8px;
        }

        .action-link {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          text-decoration: none;
          color: #667eea;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-link:hover {
          border-color: #667eea;
          background: #f3f4f6;
        }

        .empty-state-section {
          text-align: center;
          padding: 80px 30px;
        }

        .empty-icon-large {
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
          margin: 0 0 30px 0;
        }

        .stats-box {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 15px 20px;
          display: inline-block;
          margin-right: 15px;
          font-size: 12px;
          color: #6b7280;
        }

        .stats-box strong {
          display: block;
          font-size: 24px;
          color: #667eea;
          margin-bottom: 4px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .header-section {
            flex-direction: column;
            align-items: flex-start;
            padding: 30px 20px;
          }

          .header-content h1 {
            font-size: 24px;
          }

          .controls-bar {
            padding: 0 20px;
          }

          .requests-container {
            padding: 0 20px;
          }

          .requests-grid {
            grid-template-columns: 1fr;
          }

          .list-item-details {
            grid-template-columns: 1fr 1fr;
          }

          .list-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="header-section">
        <div className="header-content">
          <h1><FiFileText /> My Purchase Requests</h1>
          <p>Track and manage all your property purchase requests</p>
        </div>
        <div className="header-actions">
          <Link to="/properties" className="browse-btn">
            <FiArrowRight /> Browse Properties
          </Link>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="requests-container">
          <div className="empty-state-section">
            <div className="empty-icon-large">📋</div>
            <h2>No Purchase Requests Yet</h2>
            <p>You haven't made any purchase requests. Start exploring properties!</p>
            <Link to="/properties" className="browse-btn">
              <FiArrowRight /> Browse Available Properties
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="controls-bar">
            <div className="view-toggle">
              <button 
                className={viewType === 'cards' ? 'active' : ''} 
                onClick={() => setViewType('cards')}
              >
                Card View
              </button>
              <button 
                className={viewType === 'list' ? 'active' : ''} 
                onClick={() => setViewType('list')}
              >
                List View
              </button>
            </div>
          </div>

          <div className="requests-container">
            {viewType === 'cards' ? (
              <div className="requests-grid">
                {requests.map(req => (
                  <div key={req._id} className="request-card">
                    <div className="request-card-header">
                      <div className="request-card-title">
                        <h3>{req.property ? req.property.title : 'Property'}</h3>
                        <p>{req.property ? req.property.location?.city : 'Location unknown'}</p>
                      </div>
                      {getStatusIcon(req.status)}
                    </div>

                    <div className="request-card-body">
                      <div className="card-info-row">
                        <div>
                          <div className="info-label">Status</div>
                          <div className="info-value">
                            <span className={`status-badge-custom ${req.status}`}>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="info-label">Price</div>
                          <div className="info-value price-value">
                            {req.property ? formatCurrency(req.property.price) : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="card-info-row">
                        <div>
                          <div className="info-label">Requested Date</div>
                          <div className="info-value">{formatDate(req.createdAt)}</div>
                        </div>
                        {req.reviewedAt && (
                          <div>
                            <div className="info-label">Reviewed Date</div>
                            <div className="info-value">{formatDate(req.reviewedAt)}</div>
                          </div>
                        )}
                      </div>

                      {req.adminNotes && (
                        <div className="card-notes">
                          <strong>Admin Notes:</strong> {req.adminNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="requests-list">
                {requests.map(req => (
                  <div key={req._id} className="list-item">
                    <div className="list-item-icon">
                      {getStatusIcon(req.status)}
                    </div>
                    <div className="list-item-content">
                      <div className="list-item-title">
                        {req.property ? req.property.title : 'Property'}
                        <span className={`status-badge-custom ${req.status}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                      <div className="list-item-details">
                        <div className="detail-item">
                          Location
                          <span>{req.property ? req.property.location?.city : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          Price
                          <span>{req.property ? formatCurrency(req.property.price) : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          Requested
                          <span>{formatDate(req.createdAt)}</span>
                        </div>
                        {req.adminNotes && (
                          <div className="detail-item">
                            Notes
                            <span>{req.adminNotes.substring(0, 30)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerPurchaseRequests;
