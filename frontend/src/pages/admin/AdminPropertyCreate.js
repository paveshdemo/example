import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../../services/dataService';

const AdminPropertyCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'apartment', price: '',
    'location.address': '', 'location.city': '', 'location.state': '', 'location.zipCode': '', 'location.country': 'India',
    'features.bedrooms': '', 'features.bathrooms': '', 'features.area': '', 'features.parking': false, 'features.furnished': false
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('type', formData.type);
      data.append('price', formData.price);
      data.append('location[address]', formData['location.address']);
      data.append('location[city]', formData['location.city']);
      data.append('location[state]', formData['location.state']);
      data.append('location[zipCode]', formData['location.zipCode']);
      data.append('location[country]', formData['location.country']);
      data.append('features[bedrooms]', formData['features.bedrooms'] || 0);
      data.append('features[bathrooms]', formData['features.bathrooms'] || 0);
      data.append('features[area]', formData['features.area'] || 0);
      data.append('features[parking]', formData['features.parking']);
      data.append('features[furnished]', formData['features.furnished']);

      images.forEach(img => data.append('images', img));

      await createProperty(data);
      navigate('/admin/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add New Property</h1>
      </div>

      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card-header"><h3>Basic Information</h3></div>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
                <option value="condo">Condo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price *</label>
              <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required min="0" />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} required rows="4" />
          </div>

          <div className="card-header" style={{ marginTop: '16px' }}><h3>Location</h3></div>
          <div className="form-row">
            <div className="form-group">
              <label>Address *</label>
              <input type="text" name="location.address" className="form-control" value={formData['location.address']} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>City *</label>
              <input type="text" name="location.city" className="form-control" value={formData['location.city']} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>State *</label>
              <input type="text" name="location.state" className="form-control" value={formData['location.state']} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input type="text" name="location.zipCode" className="form-control" value={formData['location.zipCode']} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input type="text" name="location.country" className="form-control" value={formData['location.country']} onChange={handleChange} />
            </div>
          </div>

          <div className="card-header" style={{ marginTop: '16px' }}><h3>Features</h3></div>
          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input type="number" name="features.bedrooms" className="form-control" value={formData['features.bedrooms']} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Bathrooms</label>
              <input type="number" name="features.bathrooms" className="form-control" value={formData['features.bathrooms']} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Area (sqft)</label>
              <input type="number" name="features.area" className="form-control" value={formData['features.area']} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" name="features.parking" checked={formData['features.parking']} onChange={handleChange} />
                Parking Available
              </label>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" name="features.furnished" checked={formData['features.furnished']} onChange={handleChange} />
                Furnished
              </label>
            </div>
          </div>

          <div className="card-header" style={{ marginTop: '16px' }}><h3>Images</h3></div>
          <div className="form-group">
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
            <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '4px' }}>
              Upload up to 10 images (JPEG, PNG, GIF, WebP)
            </p>
          </div>

          <div className="btn-group" style={{ marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Creating...' : 'Create Property'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/properties')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPropertyCreate;
