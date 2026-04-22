import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyChangeRequests } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiSearch, FiTool, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const CustomerChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState('table');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyChangeRequests();
        setRequests(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = requests.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.property?.title?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="customer-requests-page">
      <style>{`
        .customer-requests-page {
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
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .btn-new-request {
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn-new-request:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .page-content {
          padding: 0 30px;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
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
          transform: translateY(-4px);
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 12px;
        }

        .stat-icon.pending {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-icon.approved {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-icon.rejected {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .stat-icon.completed {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
          font-size: 24px;
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

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-box input {
          width: 100%;
          padding: 10px 16px 10px 38px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          transition: all 0.2s ease;
          background: white;
        }

        .search-box input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-box svg {
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

        .requests-table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          background: white;
          margin-bottom: 30px;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
        }

        .requests-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .requests-table th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .requests-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }

        .requests-table tbody tr:hover {
          background: #f9fafb;
        }

        .request-title {
          font-weight: 600;
          color: #1f2937;
        }

        .request-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .request-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .request-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }

        .request-header small {
          color: #9ca3af;
          font-size: 12px;
        }

        .request-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .request-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin: 12px 0;
          padding: 12px 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }

        .request-detail {
          font-size: 12px;
        }

        .request-detail label {
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }

        .request-detail value {
          color: #1f2937;
          font-weight: 600;
          display: block;
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

        @media (max-width: 768px) {
          .page-header-section {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
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

          .search-box {
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

          .requests-table {
            font-size: 12px;
          }

          .requests-table th,
          .requests-table td {
            padding: 10px 8px;
          }

          .request-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header-section">
        <div>
          <h1><FiTool /> My Maintenance Requests</h1>
          <p>Track and manage your maintenance and repair requests</p>
        </div>
        <Link to="/customer/change-requests/new" className="btn-new-request">
          <FiPlus /> New Request
        </Link>
      </div>

      <div className="page-content">
        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon pending"><FiClock /></div>
            <div className="stat-label">Pending</div>
            <div className="stat-value">{statusCounts.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved"><FiCheckCircle /></div>
            <div className="stat-label">Approved</div>
            <div className="stat-value">{statusCounts.approved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected"><FiAlertCircle /></div>
            <div className="stat-label">Rejected</div>
            <div className="stat-value">{statusCounts.rejected}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed"><FiCheckCircle /></div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{statusCounts.completed}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="search-and-filters">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search by title or property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              {['all', 'pending', 'approved', 'rejected', 'completed'].map(f => (
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
            <button 
              className={`view-btn ${viewType === 'card' ? 'active' : ''}`}
              onClick={() => setViewType('card')}
            >
              Cards
            </button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="empty-state-section">
            <div className="empty-icon">🔧</div>
            <h2>No Requests Found</h2>
            <p>No {filter !== 'all' ? filter : ''} maintenance requests found matching your search</p>
          </div>
        ) : viewType === 'table' ? (
          <div className="requests-table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Property</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td><span className="request-title">{r.title}</span></td>
                    <td>{r.type}</td>
                    <td>{r.property?.title || 'N/A'}</td>
                    <td><StatusBadge status={r.priority} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            {filtered.map(r => (
              <div key={r._id} className="request-card">
                <div className="request-header">
                  <h3>{r.title}</h3>
                  <small>{formatDate(r.createdAt)}</small>
                </div>
                <div className="request-badges">
                  <StatusBadge status={r.type} />
                  <StatusBadge status={r.priority} />
                  <StatusBadge status={r.status} />
                </div>
                <div className="request-details">
                  <div className="request-detail">
                    <label>Property</label>
                    <value>{r.property?.title || 'N/A'}</value>
                  </div>
                  <div className="request-detail">
                    <label>Type</label>
                    <value>{r.type}</value>
                  </div>
                  <div className="request-detail">
                    <label>Priority</label>
                    <value>{r.priority}</value>
                  </div>
                  <div className="request-detail">
                    <label>Status</label>
                    <value>{r.status}</value>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerChangeRequests;
