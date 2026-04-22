import React, { useState, useEffect } from 'react';
import { getAllDocuments, uploadDocument, getAdminProperties } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiUpload, FiDownload, FiSearch } from 'react-icons/fi';
import './AdminDocuments.css';

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [properties, setProperties] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState({ 
    type: 'all', 
    search: '',
    customer: 'all' // NEW: Customer filter
  });

  const [form, setForm] = useState({ title: '', type: 'mandatory', category: 'sale_agreement', property: '', customer: '', description: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocs();
    fetchProps();
    extractCustomers();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await getAllDocuments();
      setDocuments(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchProps = async () => {
    try {
      const res = await getAdminProperties();
      setProperties(res.data.data);
    } catch (err) { console.error(err); }
  };

  // Extract unique customers from documents
  const extractCustomers = async () => {
    try {
      const res = await getAllDocuments();
      const uniqueCustomers = [];
      const customerMap = new Map();
      
      res.data.data.forEach(doc => {
        const customerId = doc.customer?._id || doc.customer;
        const customerName = doc.customer?.name || 'Unknown';
        
        if (customerId && !customerMap.has(customerId)) {
          customerMap.set(customerId, customerName);
          uniqueCustomers.push({ _id: customerId, name: customerName });
        }
      });
      
      setCustomers(uniqueCustomers.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('document', file);
      Object.keys(form).forEach(k => { if (form[k]) data.append(k, form[k]); });
      await uploadDocument(data);
      setShowUpload(false);
      setForm({ title: '', type: 'mandatory', category: 'sale_agreement', property: '', customer: '', description: '' });
      setFile(null);
      fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const filtered = documents.filter(d => {
    const matchType = filter.type === 'all' || d.type === filter.type;
    const matchSearch = d.title.toLowerCase().includes(filter.search.toLowerCase());
    const customerId = d.customer?._id || d.customer;
    const matchCustomer = filter.customer === 'all' || customerId === filter.customer;
    return matchType && matchSearch && matchCustomer;
  });

  // Group documents by customer and property
  const groupedDocs = () => {
    const groups = {};
    filtered.forEach(doc => {
      const customerId = doc.customer?._id || doc.customer;
      const customerName = doc.customer?.name || 'Unknown';
      const propertyType = doc.property?.type || 'General';
      const propertyTitle = doc.property?.title || 'N/A';
      const key = `${customerName}|${propertyType}|${doc.property?._id || propertyTitle}`;
      
      if (!groups[key]) {
        groups[key] = {
          customerName,
          customerId,
          propertyType,
          propertyTitle,
          propertyId: doc.property?._id,
          documents: []
        };
      }
      groups[key].documents.push(doc);
    });
    return Object.values(groups);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Documents</h1>
        <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}><FiUpload /> Upload Document</button>
      </div>

      {showUpload && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Upload New Document</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleUpload}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="mandatory">Mandatory</option>
                  <option value="additional">Additional</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="sale_agreement">Sale Agreement</option>
                  <option value="ownership_certificate">Ownership Certificate</option>
                  <option value="tax_document">Tax Document</option>
                  <option value="insurance">Insurance</option>
                  <option value="inspection_report">Inspection Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Property *</label>
                <select className="form-control" value={form.property} onChange={(e) => {
                  const propId = e.target.value;
                  const prop = properties.find(p => p._id === propId);
                  setForm({ ...form, property: propId, customer: prop?.owner?._id || prop?.owner || '' });
                }} required>
                  <option value="">Select Property</option>
                  {properties.filter(p => p.status === 'sold' && p.owner).map(p => (
                    <option key={p._id} value={p._id}>{p.title} — {p.owner?.name || 'Owner assigned'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>File *</label>
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2" />
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="documents-filters">
        <div className="search-box"><FiSearch /><input type="text" placeholder="Search documents..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} /></div>
        
        <select className="form-control filter-select" value={filter.customer} onChange={(e) => setFilter({ ...filter, customer: e.target.value })}>
          <option value="all">👥 All Customers</option>
          {customers.map(c => (
            <option key={c._id} value={c._id}>👤 {c.name}</option>
          ))}
        </select>

        <select className="form-control filter-select" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <option value="all">📋 All Types</option>
          <option value="mandatory">📌 Mandatory</option>
          <option value="additional">📎 Additional</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>📭 No documents found</p></div>
      ) : (
        <div className="documents-grouped">
          {groupedDocs().map((group, idx) => (
            <div key={idx} className="document-group-card">
              {/* 2-Column Header: Customer Name | Property Type */}
              <div className="group-header">
                <div className="header-left">
                  <div className="customer-info">
                    <span className="customer-avatar">{group.customerName.charAt(0).toUpperCase()}</span>
                    <div>
                      <p className="customer-name">{group.customerName}</p>
                      <p className="property-title">{group.propertyTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="header-right">
                  <span className="property-type-badge">{group.propertyType}</span>
                  <span className="document-count">{group.documents.length} docs</span>
                </div>
              </div>

              {/* Documents for this customer-property combination */}
              <div className="documents-list">
                {group.documents.map(doc => (
                  <div key={doc._id} className="document-item">
                    <div className="doc-info">
                      <div className="doc-title">{doc.title}</div>
                      <div className="doc-meta">
                        <span><StatusBadge status={doc.type} /></span>
                        <span className="doc-category">{doc.category?.replace('_', ' ')}</span>
                        <span className="doc-date">{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                    <div className="doc-actions">
                      <a href={`http://localhost:5000${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="btn-download">
                        <FiDownload /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminDocuments;
