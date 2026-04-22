import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, updateProperty, getMaintenanceStaff, assignStaffToProperty, removeStaffFromProperty } from '../../services/dataService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiX } from 'react-icons/fi';

const AdminPropertyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'apartment', price: 0, status: 'available',
    'location.address': '', 'location.city': '', 'location.state': '', 'location.zipCode': '', 'location.country': 'India',
    'features.bedrooms': 0, 'features.bathrooms': 0, 'features.area': 0, 'features.parking': false, 'features.furnished': false
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Staff management states
  const [availableStaff, setAvailableStaff] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [propRes, staffRes] = await Promise.all([
          getProperty(id),
          getMaintenanceStaff()
        ]);
        const p = propRes.data.data;
        setFormData({
          title: p.title || '', description: p.description || '', type: p.type || 'apartment', price: p.price || 0, status: p.status || 'available',
          'location.address': p.location?.address || '', 'location.city': p.location?.city || '', 'location.state': p.location?.state || '', 
          'location.zipCode': p.location?.zipCode || '', 'location.country': p.location?.country || 'India',
          'features.bedrooms': p.features?.bedrooms || 0, 'features.bathrooms': p.features?.bathrooms || 0,
          'features.area': p.features?.area || 0, 'features.parking': p.features?.parking || false, 'features.furnished': p.features?.furnished || false
        });
        setAssignedStaff(p.assignedStaff || []);
        setAvailableStaff(staffRes.data.data || []);
        console.log('Property loaded:', p);
        console.log('Staff loaded:', staffRes.data.data);
      } catch (err) { 
        console.error('Error loading data:', err);
        navigate('/admin/properties'); 
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(`File "${file.name}" is not a valid image type`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImages(validFiles);
      setError('');
      
      // Create preview URLs
      const previews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreview(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!formData.title?.trim() || !formData.description?.trim() || !formData.price || formData.price <= 0) {
      setError('Please fill in all required fields (Title, Description, Price > 0)');
      return;
    }

    setSaving(true);
    try {
      console.log('=== FORM SUBMIT ===');
      console.log('Current formData state:', JSON.stringify(formData, null, 2));
      
      const data = new FormData();
      
      // Append all fields with proper type handling
      const fieldsToSend = {
        title: (formData.title || '').toString().trim(),
        description: (formData.description || '').toString().trim(),
        type: formData.type || 'apartment',
        price: Math.max(0, parseFloat(formData.price) || 0),
        status: formData.status || 'available',
        'location[address]': (formData['location.address'] || '').toString().trim(),
        'location[city]': (formData['location.city'] || '').toString().trim(),
        'location[state]': (formData['location.state'] || '').toString().trim(),
        'location[zipCode]': (formData['location.zipCode'] || '').toString().trim(),
        'location[country]': formData['location.country'] || 'India',
        'features[bedrooms]': Math.max(0, parseInt(formData['features.bedrooms']) || 0),
        'features[bathrooms]': Math.max(0, parseInt(formData['features.bathrooms']) || 0),
        'features[area]': Math.max(0, parseInt(formData['features.area']) || 0),
        'features[parking]': formData['features.parking'] === true ? 'true' : 'false',
        'features[furnished]': formData['features.furnished'] === true ? 'true' : 'false'
      };

      // Log what we're sending
      console.log('Fields to send:', fieldsToSend);
      
      // Append each field to FormData
      Object.entries(fieldsToSend).forEach(([key, val]) => {
        data.append(key, val);
        console.log(`Appended: ${key} = ${val}`);
      });
      
      // Append image files if any selected
      if (images.length > 0) {
        images.forEach((img, idx) => {
          data.append('images', img);
          console.log(`Appended image ${idx + 1}: ${img.name}`);
        });
      }

      console.log('Sending PUT request to /api/properties/' + id);
      const response = await updateProperty(id, data);
      console.log('✅ Update successful:', response);
      
      // Verify the response data matches what was sent
      const updatedProp = response.data.data;
      console.log('✓ Verification of saved data:', {
        sentBedrooms: fieldsToSend['features[bedrooms]'],
        receivedBedrooms: updatedProp.features?.bedrooms,
        sentPrice: fieldsToSend.price,
        receivedPrice: updatedProp.price,
        sentTitle: fieldsToSend.title,
        receivedTitle: updatedProp.title
      });
      
      setSuccessMsg('Property updated successfully! Redirecting...');
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/admin/properties');
      }, 1500);
    } catch (err) { 
      console.error('❌ Update property error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data,
        error: err.message
      });
      const message = err.response?.data?.message || err.message || 'Failed to update property';
      setError(message);
    } finally { 
      setSaving(false); 
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    
    // Handle different input types
    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'number') {
      // Convert to number, but allow empty string for clearing the field
      finalValue = value === '' ? 0 : parseFloat(value);
    } else if (type === 'text' || type === 'textarea') {
      finalValue = value;
    } else {
      finalValue = value;
    }
    
    console.log(`Field ${name} changed to:`, finalValue, `(type: ${type})`);
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId) {
      setStaffError('Please select a staff member');
      return;
    }

    setLoadingStaff(true);
    setStaffError('');
    try {
      const res = await assignStaffToProperty(id, { staffId: selectedStaffId });
      setAssignedStaff(res.data.data.assignedStaff || []);
      setSelectedStaffId('');
    } catch (err) {
      setStaffError(err.response?.data?.message || 'Failed to assign staff');
      console.error(err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm('Remove this staff member from the property?')) return;

    try {
      const res = await removeStaffFromProperty(id, staffId);
      setAssignedStaff(res.data.data.assignedStaff || []);
    } catch (err) {
      setStaffError(err.response?.data?.message || 'Failed to remove staff');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header"><h1>Edit Property</h1></div>
      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select name="type" className="form-control" value={formData.type} onChange={handleChange} required>
                <option value="apartment">Apartment</option><option value="house">House</option>
                <option value="villa">Villa</option><option value="commercial">Commercial</option>
                <option value="land">Land</option><option value="condo">Condo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price *</label>
              <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
              <option value="available">Available</option><option value="sold">Sold</option><option value="reserved">Reserved</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} required rows="4" />
          </div>
          <div className="form-row">
            <div className="form-group"><label>Address *</label><input type="text" name="location.address" className="form-control" value={formData['location.address']} onChange={handleChange} required /></div>
            <div className="form-group"><label>City *</label><input type="text" name="location.city" className="form-control" value={formData['location.city']} onChange={handleChange} required /></div>
            <div className="form-group"><label>State *</label><input type="text" name="location.state" className="form-control" value={formData['location.state']} onChange={handleChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Bedrooms</label><input type="number" name="features.bedrooms" className="form-control" value={formData['features.bedrooms']} onChange={handleChange} /></div>
            <div className="form-group"><label>Bathrooms</label><input type="number" name="features.bathrooms" className="form-control" value={formData['features.bathrooms']} onChange={handleChange} /></div>
            <div className="form-group"><label>Area (sqft)</label><input type="number" name="features.area" className="form-control" value={formData['features.area']} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" name="features.parking" checked={formData['features.parking']} onChange={handleChange} /> Parking</label></div>
            <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" name="features.furnished" checked={formData['features.furnished']} onChange={handleChange} /> Furnished</label></div>
          </div>
          <div className="form-group">
            <label>Add More Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange}
              className="form-control"
            />
            <small style={{ color: '#666', marginTop: '8px' }}>Max 5MB per file. Supported: JPG, PNG, GIF, WebP</small>
            
            {/* Show image previews */}
            {imagePreview.length > 0 && (
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                {imagePreview.map((preview, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img 
                      src={preview} 
                      alt={`Preview ${idx}`} 
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <small style={{ display: 'block', marginTop: '4px', textAlign: 'center', color: '#666' }}>
                      {images[idx]?.name?.substring(0, 15)}...
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staff Assignment Section */}
          <div className="card" style={{ marginTop: '24px', padding: '20px', border: '1px solid #e8eaed', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '16px', color: '#143665' }}>👷 Assign Maintenance Staff</h3>
            
            {staffError && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{staffError}</div>}

            {/* Current Assigned Staff */}
            {assignedStaff.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#5f6368' }}>Assigned Staff ({assignedStaff.length})</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {assignedStaff.map(staff => (
                    <div key={staff._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div>
                        <p style={{ margin: '0', fontWeight: 600, color: '#143665' }}>{staff.name}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f6368' }}>{staff.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStaff(staff._id)}
                        className="btn btn-sm btn-danger"
                        style={{ padding: '6px 12px' }}
                      >
                        <FiX style={{ marginRight: '4px' }} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Staff */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Select Maintenance Staff</label>
                <select 
                  className="form-control" 
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <option value="">Choose a staff member...</option>
                  {availableStaff.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleAssignStaff}
                  disabled={loadingStaff || !selectedStaffId}
                  className="btn btn-success"
                  style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}
                >
                  {loadingStaff ? 'Assigning...' : '✓ Assign Staff'}
                </button>
              </div>
            </div>
          </div>
          <div className="btn-group" style={{ marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/properties')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPropertyEdit;
