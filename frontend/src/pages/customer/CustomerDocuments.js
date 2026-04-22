import React, { useState, useEffect } from 'react';
import { getMyDocuments } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDownload, FiFileText } from 'react-icons/fi';

const CustomerDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyDocuments();
        setDocuments(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? documents : documents.filter(d => d.type === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1><FiFileText /> My Documents</h1>
      </div>

      <div className="filters-bar">
        {['all', 'mandatory', 'additional'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No documents available</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Category</th><th>Property</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id}>
                  <td>{d.title}</td>
                  <td><StatusBadge status={d.type} /></td>
                  <td>{d.category?.replace('_', ' ')}</td>
                  <td>{d.property?.title || 'N/A'}</td>
                  <td>{formatDate(d.createdAt)}</td>
                  <td>
                    <a href={`http://localhost:5000${d.filePath}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                      <FiDownload /> Download
                    </a>
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

export default CustomerDocuments;
