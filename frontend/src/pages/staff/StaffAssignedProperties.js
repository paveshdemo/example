import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedProperties } from '../../services/dataService';
import { formatCurrency } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiEye } from 'react-icons/fi';

const StaffAssignedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAssignedProperties();
        setProperties(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>Assigned Properties</h1></div>
      {properties.length === 0 ? (
        <div className="empty-state"><p>No properties assigned to you</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Property</th><th>Type</th><th>Price</th><th>Construction</th><th>Progress</th><th>Actions</th></tr></thead>
            <tbody>
              {properties.map(p => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.type}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td><StatusBadge status={p.constructionStatus} /></td>
                  <td>
                    <div className="progress-bar" style={{ width: '100px' }}>
                      <div className="progress-fill" style={{ width: `${p.constructionPercentage || 0}%` }}></div>
                    </div>
                    <small>{p.constructionPercentage || 0}%</small>
                  </td>
                  <td><Link to={`/staff/properties/${p._id}`} className="btn btn-sm btn-primary"><FiEye /> View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffAssignedProperties;
