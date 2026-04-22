import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllChangeRequests, approveChangeRequest, rejectChangeRequest } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';

const AdminChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getAllChangeRequests();
      setRequests(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAction = async (id, status) => {
    try {
      if (status === 'approved') {
        await approveChangeRequest(id, {});
      } else if (status === 'rejected') {
        await rejectChangeRequest(id, {});
      }
      fetchData();
    } catch (err) { 
      console.error(err);
      alert('Failed to update request: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>Change Requests</h1></div>
      <div className="filters-bar">
        {['all', 'pending', 'in_review', 'approved', 'rejected', 'completed'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
            {f.replace('_', ' ').charAt(0).toUpperCase() + f.replace('_', ' ').slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No change requests found</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Property</th><th>Customer</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td>{r.type}</td>
                  <td>{r.property?.title || 'N/A'}</td>
                  <td>{r.customer?.name || 'N/A'}</td>
                  <td><StatusBadge status={r.priority} /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>
                    <div className="btn-group">
                      <Link to={`/admin/change-requests/${r._id}`} className="btn btn-sm btn-outline"><FiEye /></Link>
                      {r.status === 'pending' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleAction(r._id, 'approved')}><FiCheck /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleAction(r._id, 'rejected')}><FiX /></button>
                        </>
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
  );
};

export default AdminChangeRequests;
