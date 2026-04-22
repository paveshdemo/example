import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPayments } from '../../services/dataService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiCreditCard, FiCheckCircle, FiClock, FiArrowRight } from 'react-icons/fi';

const CustomerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('cards');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyPayments();
        setPayments(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const totalVerified = payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="customer-payments-page">
      <style>{`
        .customer-payments-page {
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

        .make-payment-btn {
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

        .make-payment-btn:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .stats-section {
          padding: 0 30px;
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card-modern {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .stat-card-modern:hover {
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 12px;
          font-size: 24px;
        }

        .stat-label {
          font-size: 13px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #667eea;
        }

        .controls-bar {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 0 30px;
          margin-bottom: 25px;
          justify-content: flex-end;
          flex-wrap: wrap;
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

        .content-section {
          padding: 0 30px;
        }

        .payments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .payment-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }

        .payment-card:hover {
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          transform: translateY(-4px);
        }

        .card-status-bar {
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .payment-card-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-property-name {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-payment-type {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .payment-card-body {
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

        .card-value.amount {
          color: #667eea;
          font-size: 14px;
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

        .payment-card-footer {
          padding: 12px 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }

        .payments-table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          background: white;
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
          font-size: 13px;
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
          margin: 0 0 30px 0;
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

          .stats-section,
          .controls-bar,
          .content-section {
            padding: 0 20px;
          }

          .controls-bar {
            justify-content: center;
          }

          .payments-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header-section">
        <div className="header-left">
          <h1><FiCreditCard /> My Payments</h1>
          <p>Track and manage your property payments</p>
        </div>
        <Link to="/customer/payments/new" className="make-payment-btn">
          <FiPlus /> Make Payment
        </Link>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card-modern">
            <div className="stat-icon"><FiCheckCircle /></div>
            <div className="stat-label">Total Verified</div>
            <div className="stat-value">{formatCurrency(totalVerified)}</div>
          </div>
          <div className="stat-card-modern">
            <div className="stat-icon"><FiClock /></div>
            <div className="stat-label">Pending Verification</div>
            <div className="stat-value">{formatCurrency(totalPending)}</div>
          </div>
          <div className="stat-card-modern">
            <div className="stat-icon"><FiCreditCard /></div>
            <div className="stat-label">Total Payments</div>
            <div className="stat-value">{payments.length}</div>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="content-section">
          <div className="empty-state-section">
            <div className="empty-icon">💳</div>
            <h2>No Payments Made</h2>
            <p>Start making payments for your properties</p>
            <Link to="/customer/payments/new" className="make-payment-btn">
              <FiArrowRight /> Make Your First Payment
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="controls-bar">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewType === 'cards' ? 'active' : ''}`}
                onClick={() => setViewType('cards')}
              >
                Card View
              </button>
              <button 
                className={`view-btn ${viewType === 'table' ? 'active' : ''}`}
                onClick={() => setViewType('table')}
              >
                Table View
              </button>
            </div>
          </div>

          <div className="content-section">
            {viewType === 'cards' ? (
              <div className="payments-grid">
                {payments.map(p => (
                  <div key={p._id} className="payment-card">
                    <div className="card-status-bar"></div>
                    
                    <div className="payment-card-header">
                      <h3 className="card-property-name">{p.property?.title || 'Property'}</h3>
                      <p className="card-payment-type">
                        {p.installmentOption === '3x' ? 'Installment Payment' : 'Full Payment'}
                      </p>
                    </div>

                    <div className="payment-card-body">
                      <div className="card-row">
                        <span className="card-label">Payment Amount</span>
                        <span className="card-value amount">{formatCurrency(p.amount)}</span>
                      </div>

                      <div className="card-row">
                        <span className="card-label">Status</span>
                        <span className={`status-badge-custom ${p.status}`}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </div>

                      <div className="card-row">
                        <span className="card-label">Payment Plan</span>
                        <span className={`term-badge ${p.installmentOption === '3x' ? '' : 'full'}`}>
                          {p.installmentOption === '3x' ? `Term ${p.installmentTerm}/3` : 'Full Payment'}
                        </span>
                      </div>

                      <div className="card-row">
                        <span className="card-label">Total Plan</span>
                        <span className="card-value amount">
                          {formatCurrency(p.totalInstallmentAmount)}
                        </span>
                      </div>

                      {p.remainingBalance > 0 && (
                        <div className="card-row">
                          <span className="card-label">Remaining</span>
                          <span className="card-value" style={{ color: '#ef4444' }}>
                            {formatCurrency(p.remainingBalance)}
                          </span>
                        </div>
                      )}

                      <div className="card-row">
                        <span className="card-label">Method</span>
                        <span className="card-value">{p.paymentMethod?.replace('_', ' ')}</span>
                      </div>

                      <div className="card-row">
                        <span className="card-label">Date</span>
                        <span className="card-value">{formatDate(p.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="payments-table-wrapper">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Amount</th>
                      <th>Total Plan</th>
                      <th>Status</th>
                      <th>Plan</th>
                      <th>Remaining</th>
                      <th>Method</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id}>
                        <td><strong>{p.property?.title || 'N/A'}</strong></td>
                        <td>{formatCurrency(p.amount)}</td>
                        <td>{formatCurrency(p.totalInstallmentAmount)}</td>
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
                            <strong style={{ color: '#ef4444' }}>{formatCurrency(p.remainingBalance)}</strong>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{p.paymentMethod?.replace('_', ' ')}</td>
                        <td>{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerPayments;
