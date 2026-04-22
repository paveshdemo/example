import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { FiEye, FiEdit, FiSearch, FiTrash, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState('grid'); // grid or table
  const [deleteModal, setDeleteModal] = useState({ show: false, customer: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllUsers();
        setCustomers(res.data.data.filter(u => u.role === 'customer'));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.customer) return;
    setDeleting(true);
    try {
      await deleteUser(deleteModal.customer._id);
      setCustomers(customers.filter(c => c._id !== deleteModal.customer._id));
      setDeleteModal({ show: false, customer: null });
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-customers-page">
      <style>{`
        .admin-customers-page {
          padding: 0;
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

        .controls-section {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .search-box-modern {
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .search-box-modern input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: white;
        }

        .search-box-modern input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-box-modern svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 18px;
          height: 18px;
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

        .customers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .customer-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .customer-card:hover {
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .customer-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .customer-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
        }

        .customer-name {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .customer-status {
          display: inline-block;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .customer-info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #6b7280;
        }

        .customer-info-item svg {
          width: 16px;
          height: 16px;
          color: #667eea;
          flex-shrink: 0;
        }

        .customer-info-item strong {
          color: #1f2937;
          font-weight: 600;
          word-break: break-all;
        }

        .customer-card-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 16px 0;
        }

        .customer-card-actions {
          display: flex;
          gap: 8px;
        }

        .customer-card-actions a,
        .customer-card-actions button {
          flex: 1;
          padding: 10px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
          color: #667eea;
        }

        .customer-card-actions a:hover,
        .customer-card-actions button:hover {
          border-color: #667eea;
          background: #f3f4f6;
        }

        .customer-card-actions button.btn-danger {
          color: #ef4444;
        }

        .customer-card-actions button.btn-danger:hover {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .empty-state-modern {
          text-align: center;
          padding: 60px 30px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-state-modern p {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }

        .customers-table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .customers-table {
          width: 100%;
          border-collapse: collapse;
        }

        .customers-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .customers-table th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .customers-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }

        .customers-table tbody tr:hover {
          background: #f9fafb;
        }

        .table-actions {
          display: flex;
          gap: 6px;
        }

        .table-actions a,
        .table-actions button {
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
          text-decoration: none;
        }

        .table-actions a:hover,
        .table-actions button:hover {
          border-color: #667eea;
          background: #f3f4f6;
        }

        .table-actions button.btn-danger {
          color: #ef4444;
        }

        .table-actions button.btn-danger:hover {
          border-color: #ef4444;
          background: #fef2f2;
        }

        @media (max-width: 768px) {
          .page-header-section {
            padding: 30px 20px;
          }

          .page-header-section h1 {
            font-size: 24px;
          }

          .controls-section {
            flex-direction: column;
          }

          .search-box-modern {
            min-width: 100%;
          }

          .customers-grid {
            grid-template-columns: 1fr;
          }

          .view-toggle {
            width: 100%;
          }

          .view-toggle button {
            flex: 1;
          }
        }
      `}</style>

      <div className="page-header-section">
        <h1><FiUser /> Customers</h1>
        <p>Manage and view all your customers • Total: {customers.length}</p>
      </div>

      <div style={{ padding: '0 30px' }}>
        <div className="controls-section">
          <div className="search-box-modern">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button 
              className={viewType === 'grid' ? 'active' : ''} 
              onClick={() => setViewType('grid')}
            >
              Grid View
            </button>
            <button 
              className={viewType === 'table' ? 'active' : ''} 
              onClick={() => setViewType('table')}
            >
              Table View
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon">👥</div>
            <p>No customers found matching your search</p>
          </div>
        ) : viewType === 'grid' ? (
          <div className="customers-grid">
            {filtered.map(c => (
              <div key={c._id} className="customer-card">
                <div className="customer-card-header">
                  <div className="customer-avatar">{c.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <h3 className="customer-name">{c.name}</h3>
                    <div className="customer-status">
                      <StatusBadge status={c.isActive ? 'active' : 'inactive'} />
                    </div>
                  </div>
                </div>

                <div className="customer-info">
                  <div className="customer-info-item">
                    <FiMail />
                    <strong>{c.email}</strong>
                  </div>
                  <div className="customer-info-item">
                    <FiPhone />
                    <strong>{c.phone || 'N/A'}</strong>
                  </div>
                  <div className="customer-info-item">
                    <FiCalendar />
                    <strong>{formatDate(c.createdAt)}</strong>
                  </div>
                </div>

                <div className="customer-card-divider"></div>

                <div className="customer-card-actions">
                  <Link to={`/admin/customers/${c._id}`} title="View details">
                    <FiEye />
                  </Link>
                  <Link to={`/admin/customers/${c._id}/edit`} title="Edit customer">
                    <FiEdit />
                  </Link>
                  {!c.isActive && (
                    <button 
                      className="btn-danger"
                      onClick={() => setDeleteModal({ show: true, customer: c })}
                      title="Delete customer"
                    >
                      <FiTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phone || '-'}</td>
                    <td><StatusBadge status={c.isActive ? 'active' : 'inactive'} /></td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/admin/customers/${c._id}`} title="View">
                          <FiEye />
                        </Link>
                        <Link to={`/admin/customers/${c._id}/edit`} title="Edit">
                          <FiEdit />
                        </Link>
                        {!c.isActive && (
                          <button 
                            className="btn-danger"
                            onClick={() => setDeleteModal({ show: true, customer: c })}
                            title="Delete"
                          >
                            <FiTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        show={deleteModal.show}
        title="Delete Customer"
        message={`Are you sure you want to permanently delete ${deleteModal.customer?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ show: false, customer: null })}
        confirmText="Delete"
        danger={true}
      />
    </div>
  );
};

export default AdminCustomers;
