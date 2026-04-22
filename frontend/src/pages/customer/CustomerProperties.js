import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProperties } from '../../services/dataService';
import { formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiEye } from 'react-icons/fi';

const CustomerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyProperties();
        setProperties(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>My Properties</h1></div>
      {properties.length === 0 ? (
        <div className="empty-state">
          <p>You don't own any properties yet.</p>
          <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
        </div>
      ) : (
        <div className="property-grid">
          {properties.map(p => (
            <div key={p._id} className="property-card">
              <div className="property-card-image">
                {p.images && p.images.length > 0 ? (
                  <img src={`http://localhost:5000${p.images[0]}`} alt={p.title} />
                ) : <div style={{ height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>}
              </div>
              <div className="property-card-content">
                <h3>{p.title}</h3>
                <p className="property-card-price">{formatCurrency(p.price)}</p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <StatusBadge status={p.paymentStatus} />
                  <StatusBadge status={p.constructionStatus} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Paid: {p.paymentPercentage || 0}%</span>
                  <Link to={`/customer/properties/${p._id}`} className="btn btn-sm btn-primary"><FiEye /> View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerProperties;
