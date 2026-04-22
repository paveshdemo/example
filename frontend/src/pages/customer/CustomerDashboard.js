import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProperties, getMyPayments, getMyPurchaseRequests, getMyChangeRequests } from '../../services/dataService';
import { formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiHome, FiDollarSign, FiFileText, FiTool } from 'react-icons/fi';

const CustomerDashboard = () => {
  const [data, setData] = useState({ properties: [], payments: [], requests: [], changeRequests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [propRes, payRes, reqRes, crRes] = await Promise.all([
          getMyProperties().catch(() => ({ data: { data: [] } })),
          getMyPayments().catch(() => ({ data: { data: [] } })),
          getMyPurchaseRequests().catch(() => ({ data: { data: [] } })),
          getMyChangeRequests().catch(() => ({ data: { data: [] } }))
        ]);
        setData({
          properties: propRes.data.data || [],
          payments: payRes.data.data || [],
          requests: reqRes.data.data || [],
          changeRequests: crRes.data.data || []
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const totalPaid = data.payments.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0);
  const pendingInstallments = data.payments.filter(p => p.status === 'pending' && p.installmentOption === '3x');
  const totalPendingInstallments = pendingInstallments.reduce((s, p) => s + p.remainingBalance, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>My Dashboard</h1></div>

      <div className="stats-grid">
        <Link to="/customer/properties" className="stat-card" style={{ textDecoration: 'none' }}>
          <FiHome size={24} color="var(--primary-color)" />
          <div className="stat-value">{data.properties.length}</div>
          <div className="stat-label">My Properties</div>
        </Link>
        <Link to="/customer/payments" className="stat-card" style={{ textDecoration: 'none' }}>
          <FiDollarSign size={24} color="var(--success-color)" />
          <div className="stat-value">{formatCurrency(totalPaid)}</div>
          <div className="stat-label">Total Paid</div>
        </Link>
        {totalPendingInstallments > 0 && (
          <Link to="/customer/payments" className="stat-card" style={{ textDecoration: 'none' }}>
            <FiDollarSign size={24} color="var(--danger-color)" />
            <div className="stat-value">{formatCurrency(totalPendingInstallments)}</div>
            <div className="stat-label">Pending Installments</div>
          </Link>
        )}
        <Link to="/customer/purchase-requests" className="stat-card" style={{ textDecoration: 'none' }}>
          <FiFileText size={24} color="var(--warning-color)" />
          <div className="stat-value">{data.requests.filter(r => r.status === 'pending').length}</div>
          <div className="stat-label">Pending Requests</div>
        </Link>
        <Link to="/customer/change-requests" className="stat-card" style={{ textDecoration: 'none' }}>
          <FiTool size={24} color="var(--info-color)" />
          <div className="stat-value">{data.changeRequests.length}</div>
          <div className="stat-label">Change Requests</div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <h3>My Properties</h3>
          {data.properties.length === 0 ? <p>No properties yet. <Link to="/properties">Browse</Link></p> : (
            <div>
              {data.properties.slice(0, 3).map(p => (
                <div key={p._id} style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Link to={`/customer/properties/${p._id}`}><strong>{p.title}</strong></Link>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <StatusBadge status={p.paymentStatus} />
                      <StatusBadge status={p.constructionStatus} />
                    </div>
                  </div>
                  <span>{p.paymentPercentage || 0}% paid</span>
                </div>
              ))}
              {data.properties.length > 3 && <Link to="/customer/properties" style={{ display: 'block', marginTop: '12px' }}>View all ({data.properties.length})</Link>}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Recent Payments</h3>
          {data.payments.length === 0 ? <p>No payments yet</p> : (
            <div>
              {data.payments.slice(0, 5).map(p => (
                <div key={p._id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{formatCurrency(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </div>
              ))}
              {data.payments.length > 5 && <Link to="/customer/payments" style={{ display: 'block', marginTop: '12px' }}>View all</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
