import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { Link } from 'react-router-dom';
import { getAllPayments, verifyPayment, rejectPayment } from '../../services/dataService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiCheck, FiX, FiSearch, FiCreditCard, FiCheckCircle, FiClock } from 'react-icons/fi';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState('table');
  const [actionModal, setActionModal] = useState({ show: false, payment: null, action: '' });
  const [remarks, setRemarks] = useState('');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await getAllPayments();
      setPayments(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id, status) => {
    try {
      const data = { adminRemarks: remarks };
      if (status === 'verified') {
        await verifyPayment(id, data);
      } else if (status === 'rejected') {
        await rejectPayment(id, data);
      }
      setActionModal({ show: false, payment: null, action: '' });
      setRemarks('');
      fetchPayments();
    } catch (err) { console.error(err); }
  };

  const filtered = payments.filter(p => {
    // Treat rejected payments as pending (need admin/customer action)
    const matchFilter = filter === 'all' || 
                        (filter === 'pending' && (p.status === 'pending' || p.status === 'rejected')) ||
                        (filter !== 'pending' && p.status === filter);
    const matchSearch = !search || p.customer?.name?.toLowerCase().includes(search.toLowerCase()) || p.property?.title?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalVerified = payments.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending' || p.status === 'rejected').reduce((s, p) => s + p.amount, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-payments-page">
      <style>{`
        .admin-payments-page {
          padding: 0;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          border-radius: 0 0 20px 0;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
          margin-bottom: 30px;
        }

        .page-header-section h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-header-section p {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .page-content {
          padding: 0 30px;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card-modern {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-card-modern:hover {
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          transform: translateY(-4px);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 12px;
        }

        .stat-icon.verified {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-icon.pending {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-icon.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .controls-bar {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          justify-content: space-between;
        }

        .search-and-filters {
          display: flex;
          gap: 10px;
          align-items: center;
          flex: 1;
          min-width: 300px;
          flex-wrap: wrap;
        }

        .search-box-modern {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-box-modern input {
          width: 100%;
          padding: 10px 16px 10px 38px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          transition: all 0.2s ease;
          background: white;
        }

        .search-box-modern input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-box-modern svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 16px;
          height: 16px;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 10px 16px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
          color: #6b7280;
          white-space: nowrap;
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

        .view-toggle {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }

        .view-btn {
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

        .view-btn.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .payments-table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          background: white;
          margin-bottom: 30px;
        }

        .payments-table {
          width: 100%;
          border-collapse: collapse;
        }

        .payments-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .payments-table th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payments-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }

        .payments-table tbody tr:hover {
          background: #f9fafb;
        }

        .payment-customer-name {
          font-weight: 600;
          color: #1f2937;
        }

        .status-badge-custom {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge-custom.verified {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge-custom.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge-custom.rejected {
          background: #fee2e2;
          color: #7f1d1d;
        }

        .term-badge {
          display: inline-block;
          background: #e0e7ff;
          color: #667eea;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .term-badge.full {
          background: #d1fae5;
          color: #065f46;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
        }

        .alert p {
          margin: 6px 0;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .form-control {
          width: 100%;
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-control:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 24px;
        }

        .modal-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-btn.verify {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .modal-btn.verify:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .modal-btn.reject {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .modal-btn.reject:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .modal-btn.cancel {
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .modal-btn.cancel:hover {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .page-header-section {
            padding: 30px 20px;
          }

          .page-header-section h1 {
            font-size: 24px;
          }

          .page-content {
            padding: 0 20px;
          }

          .controls-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .search-and-filters {
            width: 100%;
            flex-direction: column;
          }

          .search-box-modern {
            width: 100%;
            min-width: 100%;
          }

          .filter-buttons {
            width: 100%;
            flex-wrap: wrap;
          }

          .view-toggle {
            width: 100%;
          }

          .view-btn {
            flex: 1;
          }

          .payments-table {
            font-size: 12px;
          }

          .payments-table th,
          .payments-table td {
            padding: 10px 8px;
          }
        }
      `}</style>

      <div className="page-header-section">
        <h1><FiCreditCard /> Payment Management</h1>
        <p>Review and manage all payment transactions</p>
      </div>

      <div className="page-content">
        <div className="stats-section">
          <div className="stat-card-modern">
            <div className="stat-icon verified"><FiCheckCircle /></div>
            <div className="stat-label">Total Verified</div>
            <div className="stat-value">{formatCurrency(totalVerified)}</div>
          </div>
          <div className="stat-card-modern">
            <div className="stat-icon pending"><FiClock /></div>
            <div className="stat-label">Pending Verification</div>
            <div className="stat-value">{formatCurrency(totalPending)}</div>
          </div>
          <div className="stat-card-modern">
            <div className="stat-icon total"><FiCreditCard /></div>
            <div className="stat-label">Total Payments</div>
            <div className="stat-value">{payments.length}</div>
          </div>
        </div>

        <div className="controls-bar">
          <div className="search-and-filters">
            <div className="search-box-modern">
              <FiSearch />
              <input
                type="text"
                placeholder="Search by customer or property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              {['all', 'pending', 'verified', 'rejected'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewType === 'table' ? 'active' : ''}`}
              onClick={() => setViewType('table')}
            >
              Table
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state-section">
            <div className="empty-icon">💳</div>
            <h2>No Payments Found</h2>
            <p>No {filter !== 'all' ? filter : ''} payments found matching your search</p>
          </div>
        ) : (
          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Property</th>
                  <th>Total Plan</th>
                  <th>Term Payment</th>
                  <th>Status</th>
                  <th>Term</th>
                  <th>Remaining Balance</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td><span className="payment-customer-name">{p.customer?.name || 'N/A'}</span></td>
                    <td>{p.property?.title || 'N/A'}</td>
                    <td>
                      {p.installmentOption === '3x' ? (
                        <strong>{formatCurrency(p.totalInstallmentAmount)}</strong>
                      ) : (
                        <strong>{formatCurrency(p.amount)}</strong>
                      )}
                    </td>
                    <td>{formatCurrency(p.amount)}</td>
                    <td>
                      <span className={`status-badge-custom ${p.status}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`term-badge ${p.installmentOption === '3x' ? '' : 'full'}`}>
                        {p.installmentOption === '3x' ? `Term ${p.installmentTerm}/3` : 'Full'}
                      </span>
                    </td>
                    <td>
                      {p.remainingBalance > 0 ? (
                        <div>
                          <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatCurrency(p.remainingBalance)}</div>
                          {p.installmentOption === '3x' && p.status === 'pending' && (
                            <small style={{ color: '#666' }}>
                              {p.installmentTerm === 2 ? 'Term 2 + 3' : 'Term 3'}
                            </small>
                          )}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>{p.paymentMethod?.replace('_', ' ')}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      {p.status === 'pending' && (
                        <div className="action-buttons">
                          <button 
                            className="action-btn btn-success" 
                            onClick={() => setActionModal({ show: true, payment: p, action: 'verified' })}
                            title="Verify"
                          >
                            <FiCheck />
                          </button>
                          <button 
                            className="action-btn btn-danger" 
                            onClick={() => setActionModal({ show: true, payment: p, action: 'rejected' })}
                            title="Reject"
                          >
                            <FiX />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {actionModal.show && (
        <div className="modal-overlay" onClick={() => setActionModal({ show: false, payment: null, action: '' })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{actionModal.action === 'verified' ? 'Verify Payment' : 'Reject Payment'}</h3>
            
            <div className="alert">
              <p><strong>Customer:</strong> {actionModal.payment?.customer?.name}</p>
              <p><strong>Property:</strong> {actionModal.payment?.property?.title}</p>
              <p><strong>Term Payment Amount:</strong> {formatCurrency(actionModal.payment?.amount)}</p>
              {actionModal.payment?.installmentOption === '3x' && (
                <>
                  <p><strong>Payment Plan:</strong> Term {actionModal.payment?.installmentTerm}/3</p>
                  <p><strong>Total Plan Amount:</strong> {formatCurrency(actionModal.payment?.totalInstallmentAmount)}</p>
                  <p style={{ color: '#ef4444', marginTop: '8px' }}><strong>Remaining Balance After This:</strong> {formatCurrency(actionModal.payment?.remainingBalance)}</p>
                </>
              )}
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea 
                className="form-control" 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                rows="3"
                placeholder="Add any remarks or notes..."
              />
            </div>

            <div className="modal-actions">
              <button 
                className={`modal-btn ${actionModal.action === 'verified' ? 'verify' : 'reject'}`}
                onClick={() => handleVerify(actionModal.payment._id, actionModal.action)}
              >
                {actionModal.action === 'verified' ? 'Verify Payment' : 'Reject Payment'}
              </button>
              <button 
                className="modal-btn cancel"
                onClick={() => { setActionModal({ show: false, payment: null, action: '' }); setRemarks(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
