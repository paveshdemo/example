import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/dataService';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiHome, FiUsers, FiDollarSign, FiFileText, FiTool, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-dashboard-page">
      <style>{`
        .admin-dashboard-page {
          padding: 0;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          border-radius: 0 0 20px 0;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
          margin-bottom: 30px;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dashboard-header p {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .dashboard-content {
          padding: 0 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-card:hover {
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          transform: translateY(-4px);
        }

        .stat-card-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-card:nth-child(1) .stat-card-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-card:nth-child(2) .stat-card-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-card:nth-child(3) .stat-card-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-card:nth-child(4) .stat-card-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .stat-card:nth-child(5) .stat-card-icon {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .stat-card:nth-child(6) .stat-card-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .stat-card:nth-child(7) .stat-card-icon {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: white;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .dashboard-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .dashboard-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-body {
          padding: 20px;
        }

        .property-status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .property-item {
          text-align: center;
          padding: 16px;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .property-item:hover {
          border-color: #667eea;
          background: #f3f4f6;
        }

        .property-item-value {
          font-size: 28px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 6px;
        }

        .property-item-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .payments-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .payment-item {
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
        }

        .payment-item:last-child {
          border-bottom: none;
        }

        .payment-item:hover {
          background: #f9fafb;
          padding-left: 8px;
          padding-right: 8px;
        }

        .payment-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .payment-customer {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .payment-detail {
          font-size: 12px;
          color: #6b7280;
        }

        .payment-amount {
          font-size: 14px;
          font-weight: 700;
          color: #667eea;
        }

        .empty-message {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        @media (max-width: 1024px) {
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 30px 20px;
          }

          .dashboard-header h1 {
            font-size: 24px;
          }

          .dashboard-content {
            padding: 0 20px;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 22px;
          }

          .property-status-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-header">
        <h1><FiBarChart2 /> Dashboard</h1>
        <p>Welcome to your property management system • Overview of your business</p>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <Link to="/admin/properties" className="stat-card">
            <div className="stat-card-icon"><FiHome /></div>
            <div className="stat-label">Total Properties</div>
            <div className="stat-value">{stats?.properties?.total || 0}</div>
          </Link>

          <Link to="/admin/customers" className="stat-card">
            <div className="stat-card-icon"><FiUsers /></div>
            <div className="stat-label">Total Customers</div>
            <div className="stat-value">{stats?.users?.customers || 0}</div>
          </Link>

          <Link to="/admin/payments" className="stat-card">
            <div className="stat-card-icon"><FiDollarSign /></div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(stats?.financial?.totalRevenue || 0)}</div>
          </Link>

          <Link to="/admin/purchase-requests" className="stat-card">
            <div className="stat-card-icon"><FiFileText /></div>
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value">{stats?.pendingActions?.purchaseRequests || 0}</div>
          </Link>

          <Link to="/admin/payments" className="stat-card">
            <div className="stat-card-icon"><FiTrendingUp /></div>
            <div className="stat-label">Pending Installments</div>
            <div className="stat-value">{stats?.financial?.pendingInstallments ? formatCurrency(stats.financial.pendingInstallments) : formatCurrency(0)}</div>
          </Link>

          <Link to="/admin/change-requests" className="stat-card">
            <div className="stat-card-icon"><FiTool /></div>
            <div className="stat-label">Change Requests</div>
            <div className="stat-value">{stats?.pendingActions?.changeRequests || 0}</div>
          </Link>

          <Link to="/admin/construction" className="stat-card">
            <div className="stat-card-icon"><FiTool /></div>
            <div className="stat-label">Construction Projects</div>
            <div className="stat-value">{stats?.construction?.pending || 0}</div>
          </Link>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-card">
            <div className="card-header">
              <FiHome /> <h3>Property Status Overview</h3>
            </div>
            <div className="card-body">
              <div className="property-status-grid">
                <div className="property-item">
                  <div className="property-item-value">{stats?.properties?.available || 0}</div>
                  <div className="property-item-label">Available</div>
                </div>
                <div className="property-item">
                  <div className="property-item-value">{stats?.properties?.sold || 0}</div>
                  <div className="property-item-label">Sold</div>
                </div>
                <div className="property-item">
                  <div className="property-item-value">{stats?.properties?.reserved || 0}</div>
                  <div className="property-item-label">Reserved</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <FiDollarSign /> <h3>Recent Payments</h3>
            </div>
            <div className="card-body">
              {stats?.recentPayments && stats.recentPayments.length > 0 ? (
                <div className="payments-list">
                  {stats.recentPayments.map((p, i) => (
                    <div key={i} className="payment-item">
                      <div className="payment-info">
                        <div className="payment-customer">{p.customer?.name}</div>
                        <div className="payment-detail">{p.property?.title}</div>
                      </div>
                      <div className="payment-amount">{formatCurrency(p.amount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-message">
                  <div className="empty-icon">💳</div>
                  <p>No recent payments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
