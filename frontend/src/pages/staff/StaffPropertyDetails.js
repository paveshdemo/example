import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, createConstructionUpdate, getConstructionUpdates } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiArrowLeft, FiPlus, FiUpload } from 'react-icons/fi';

const StaffPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ status: 'in_progress', percentage: 0, notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => { fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      const [propRes, updRes] = await Promise.all([
        getProperty(id),
        getConstructionUpdates(id).catch(() => ({ data: { data: [] } }))
      ]);
      setProperty(propRes.data.data);
      setUpdates(updRes.data.data || []);
    } catch { navigate('/staff/properties'); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
    });

    if (validFiles.length > 0) {
      setUploadedImages(validFiles);
      const previews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('status', formData.status);
      data.append('percentage', formData.percentage);
      data.append('notes', formData.notes);
      data.append('property', id);
      
      // Append images if any
      uploadedImages.forEach(img => {
        data.append('images', img);
      });

      await createConstructionUpdate(id, data);
      setShowForm(false);
      setFormData({ status: 'in_progress', percentage: 0, notes: '' });
      setUploadedImages([]);
      setImagePreviews([]);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!property) return null;

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate('/staff/properties')}><FiArrowLeft /> Back</button>
        <h1>{property.title}</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> Add Update</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3>Property Info</h3>
          <div className="detail-grid">
            <div><span className="detail-label">Type</span><span>{property.type}</span></div>
            <div><span className="detail-label">Price</span><span>{formatCurrency(property.price)}</span></div>
            <div><span className="detail-label">Location</span><span>{property.location?.city}, {property.location?.state}</span></div>
            <div><span className="detail-label">Owner</span><span>{property.owner?.name || 'Unassigned'}</span></div>
            <div><span className="detail-label">Construction</span><StatusBadge status={property.constructionStatus} /></div>
            <div><span className="detail-label">Progress</span><span>{property.constructionPercentage || 0}%</span></div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${property.constructionPercentage || 0}%` }}></div></div>
          </div>
        </div>

        {showForm && (
          <div className="card">
            <h3>New Construction Update</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="foundation">Foundation</option>
                  <option value="framing">Framing</option>
                  <option value="roofing">Roofing</option>
                  <option value="interior">Interior</option>
                  <option value="finishing">Finishing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Percentage ({formData.percentage}%)</label>
                <input type="range" min="0" max="100" value={formData.percentage} onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-control" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" />
              </div>
              <div className="form-group">
                <label><FiUpload style={{ marginRight: '6px' }} />Upload Progress Images</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="form-control"
                />
                <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>Max 5MB per file. Upload multiple images to show construction progress.</small>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, marginBottom: '8px' }}>📸 {imagePreviews.length} Image(s) Selected</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img 
                          src={preview} 
                          alt={`Preview ${idx}`} 
                          style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '2px solid #143665' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="btn-group">
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Update'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Construction History</h3>
        {updates.length === 0 ? <p>No updates yet</p> : (
          <div className="timeline">
            {updates.map(u => (
              <div key={u._id} className="timeline-item">
                <div className="timeline-date">{formatDate(u.createdAt)}</div>
                <div className="timeline-content">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <StatusBadge status={u.status} />
                    <span>{u.percentage}% complete</span>
                    <small>by {u.updatedBy?.name || 'Unknown'}</small>
                  </div>
                  {u.notes && <p style={{ marginTop: '8px' }}>{u.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPropertyDetails;
