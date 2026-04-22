import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUser, getUserProperties } from '../../services/dataService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';

const AdminCustomerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [userRes, propRes] = await Promise.all([getUser(id), getUserProperties(id)]);
        setCustomer(userRes.data.data);
        setProperties(propRes.data.data || []);
      } catch { navigate('/admin/customers'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!customer) return null;

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate('/admin/customers')}><FiArrowLeft /> Back</button>
        <h1>{customer.name}</h1>
        <Link to={`/admin/customers/${id}/edit`} className="btn btn-primary"><FiEdit /> Edit</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3>Personal Information</h3>
          <div className="detail-grid">
            <div><span className="detail-label">Name</span><span>{customer.name}</span></div>
            <div><span className="detail-label">Email</span><span>{customer.email}</span></div>
            <div><span className="detail-label">Phone</span><span>{customer.phone || '-'}</span></div>
            <div><span className="detail-label">Address</span><span>{customer.address || '-'}</span></div>
            <div><span className="detail-label">Status</span><StatusBadge status={customer.isActive ? 'active' : 'inactive'} /></div>
            <div><span className="detail-label">Joined</span><span>{formatDate(customer.createdAt)}</span></div>
          </div>
        </div>

        <div className="card">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{properties.length}</div><div className="stat-label">Properties</div></div>
            <div className="stat-card"><div className="stat-value">{formatCurrency(properties.reduce((sum, p) => sum + (p.totalPaid || 0), 0))}</div><div className="stat-label">Total Paid</div></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Owned Properties</h3>
        {properties.length === 0 ? (
          <p>No properties assigned</p>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Property</th><th>Type</th><th>Price</th><th>Payment Status</th><th>Construction</th></tr></thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p._id}>
                    <td><Link to={`/admin/properties/${p._id}`}>{p.title}</Link></td>
                    <td>{p.type}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td><StatusBadge status={p.paymentStatus} /></td>
                    <td><StatusBadge status={p.constructionStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerView;
