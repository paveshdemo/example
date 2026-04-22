import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProperties, deleteProperty } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  const [deleteId, setDeleteId] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      const res = await getAdminProperties(params);
      setProperties(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    try {
      await deleteProperty(deleteId);
      setDeleteId(null);
      fetchProperties();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Manage Properties</h1>
          <p className="subtitle">{properties.length} total properties</p>
        </div>
        <Link to="/admin/properties/create" className="btn btn-primary"><FiPlus /> Add Property</Link>
      </div>

      <div className="filters-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Search</label>
          <input type="text" className="form-control" placeholder="Search properties..."
            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select className="form-control" value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
            <option value="condo">Condo</option>
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select className="form-control" value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
        <div className="form-group">
          <label>&nbsp;</label>
          <button className="btn btn-primary" onClick={fetchProperties}>Filter</button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr key={prop._id}>
                  <td>
                    <strong>{prop.title}</strong>
                    <br />
                    <small style={{ color: '#5f6368' }}>{prop.location?.city}, {prop.location?.state}</small>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{prop.type}</td>
                  <td>{formatCurrency(prop.price)}</td>
                  <td><StatusBadge status={prop.status} /></td>
                  <td>{prop.owner?.name || '-'}</td>
                  <td>{formatDate(prop.createdAt)}</td>
                  <td>
                    <div className="btn-group">
                      <Link to={`/properties/${prop._id}`} className="btn btn-sm btn-info"><FiEye /></Link>
                      <Link to={`/admin/properties/edit/${prop._id}`} className="btn btn-sm btn-warning"><FiEdit /></Link>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(prop._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No properties found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        show={!!deleteId}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminProperties;
