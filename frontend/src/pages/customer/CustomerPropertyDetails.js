import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProperty, getPropertyDocuments, getPropertyPayments, getConstructionUpdates } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDownload, FiFileText, FiDollarSign, FiTool } from 'react-icons/fi';

const CustomerPropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [propRes, docRes, payRes, conRes] = await Promise.all([
          getProperty(id),
          getPropertyDocuments(id).catch(() => ({ data: { data: [] } })),
          getPropertyPayments(id).catch(() => ({ data: { data: [] } })),
          getConstructionUpdates(id).catch(() => ({ data: { data: [] } }))
        ]);
        setProperty(propRes.data.data);
        setDocuments(docRes.data.data || []);
        setPayments(payRes.data.data || []);
        setUpdates(conRes.data.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!property) return <div className="empty-state"><p>Property not found</p></div>;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: 'Documents', icon: <FiFileText /> },
    { key: 'payments', label: 'Payments', icon: <FiDollarSign /> },
    { key: 'construction', label: 'Construction', icon: <FiTool /> }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>{property.title}</h1>
        <div className="btn-group">
          <Link to={`/customer/payments/new?property=${id}`} className="btn btn-primary"><FiDollarSign /> Make Payment</Link>
          <Link to={`/customer/change-requests/new?property=${id}`} className="btn btn-outline">Request Change</Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tabs.map(t => (
          <button key={t.key} className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card">
            <h3>Property Details</h3>
            <div className="detail-grid">
              <div><span className="detail-label">Type</span><span>{property.type}</span></div>
              <div><span className="detail-label">Price</span><span>{formatCurrency(property.price)}</span></div>
              <div><span className="detail-label">Location</span><span>{property.location?.address}, {property.location?.city}</span></div>
              <div><span className="detail-label">Bedrooms</span><span>{property.features?.bedrooms}</span></div>
              <div><span className="detail-label">Bathrooms</span><span>{property.features?.bathrooms}</span></div>
              <div><span className="detail-label">Area</span><span>{property.features?.area} sqft</span></div>
            </div>
          </div>
          <div className="card">
            <h3>Status</h3>
            <div className="detail-grid">
              <div><span className="detail-label">Payment Status</span><StatusBadge status={property.paymentStatus} /></div>
              <div><span className="detail-label">Payment Progress</span><span>{property.paymentPercentage || 0}%</span></div>
              <div><span className="detail-label">Total Paid</span><span>{formatCurrency(property.totalPaid || 0)}</span></div>
              <div><span className="detail-label">Construction</span><StatusBadge status={property.constructionStatus} /></div>
              <div><span className="detail-label">Construction Progress</span><span>{property.constructionPercentage || 0}%</span></div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${property.paymentPercentage || 0}%` }}></div></div>
              <small>Payment: {property.paymentPercentage || 0}%</small>
            </div>
            <div style={{ marginTop: '8px' }}>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${property.constructionPercentage || 0}%`, background: 'var(--warning-color)' }}></div></div>
              <small>Construction: {property.constructionPercentage || 0}%</small>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card">
          <h3>Documents</h3>
          {documents.length === 0 ? <p>No documents available</p> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Title</th><th>Type</th><th>Category</th><th>Uploaded</th><th>Actions</th></tr></thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d._id}>
                      <td>{d.title}</td>
                      <td><StatusBadge status={d.type} /></td>
                      <td>{d.category}</td>
                      <td>{formatDate(d.createdAt)}</td>
                      <td><a href={`http://localhost:5000${d.filePath}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline"><FiDownload /> Download</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card">
          <h3>Payment History</h3>
          {payments.length === 0 ? <p>No payments yet</p> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td>{formatCurrency(p.amount)}</td>
                      <td>{p.paymentMethod}</td>
                      <td>{p.transactionReference || '-'}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'construction' && (
        <div className="card">
          <h3>Construction Updates</h3>
          {updates.length === 0 ? <p>No construction updates yet</p> : (
            <div className="timeline">
              {updates.map(u => (
                <div key={u._id} className="timeline-item">
                  <div className="timeline-date">{formatDate(u.createdAt)}</div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <StatusBadge status={u.status} />
                      <span>{u.percentage}% complete</span>
                    </div>
                    {u.notes && <p>{u.notes}</p>}
                    {u.images && u.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {u.images.map((img, i) => (
                          <img key={i} src={`http://localhost:5000${img}`} alt="Update" style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '4px' }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerPropertyDetails;
