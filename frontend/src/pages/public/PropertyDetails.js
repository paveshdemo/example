import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProperty } from '../../services/dataService';
import { formatCurrency, API_URL, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { FiMapPin, FiHome, FiCalendar } from 'react-icons/fi';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProperty(id);
        setProperty(res.data.data);
      } catch (err) { navigate('/properties'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!property) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header">
        <div>
          <h1>{property.title}</h1>
          <p className="subtitle">
            <FiMapPin /> {property.location?.address}, {property.location?.city}, {property.location?.state}
          </p>
        </div>
        <div className="btn-group">
          <StatusBadge status={property.status} />
          {property.status === 'available' && user && user.role === 'customer' && (
            <Link to={`/customer/purchase-requests/new/${property._id}`} className="btn btn-primary">
              Request to Purchase
            </Link>
          )}
          {!user && property.status === 'available' && (
            <Link to="/login" className="btn btn-primary">Login to Purchase</Link>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          {/* Image Gallery */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '400px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {property.images && property.images.length > 0 ? (
                <img src={`${API_URL}${property.images[selectedImage]}`} alt={property.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '80px' }}>🏠</span>
              )}
            </div>
            {property.images && property.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto' }}>
                {property.images.map((img, i) => (
                  <img key={i} src={`${API_URL}${img}`} alt={`${i + 1}`}
                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer',
                      border: i === selectedImage ? '2px solid #1a73e8' : '2px solid transparent' }}
                    onClick={() => setSelectedImage(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card">
            <div className="card-header"><h3>Description</h3></div>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#5f6368' }}>{property.description}</p>
          </div>
        </div>

        <div>
          {/* Price & Details */}
          <div className="card">
            <div className="price" style={{ fontSize: '28px', fontWeight: '700', color: '#1a73e8', marginBottom: '16px' }}>
              {formatCurrency(property.price)}
            </div>

            <div className="detail-item">
              <label><FiHome /> Property Type</label>
              <p style={{ textTransform: 'capitalize' }}>{property.type}</p>
            </div>
            <div className="detail-item">
              <label><FiCalendar /> Listed On</label>
              <p>{formatDate(property.createdAt)}</p>
            </div>

            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #dadce0' }} />

            <h4 style={{ marginBottom: '12px' }}>Features</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="detail-item">
                <label>Bedrooms</label>
                <p>{property.features?.bedrooms || 0}</p>
              </div>
              <div className="detail-item">
                <label>Bathrooms</label>
                <p>{property.features?.bathrooms || 0}</p>
              </div>
              <div className="detail-item">
                <label>Area</label>
                <p>{property.features?.area || 0} sqft</p>
              </div>
              <div className="detail-item">
                <label>Parking</label>
                <p>{property.features?.parking ? 'Yes' : 'No'}</p>
              </div>
              <div className="detail-item">
                <label>Furnished</label>
                <p>{property.features?.furnished ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #dadce0' }} />

            <h4 style={{ marginBottom: '12px' }}>Location</h4>
            <div className="detail-item">
              <label>Address</label>
              <p>{property.location?.address}</p>
            </div>
            <div className="detail-item">
              <label>City</label>
              <p>{property.location?.city}</p>
            </div>
            <div className="detail-item">
              <label>State</label>
              <p>{property.location?.state}</p>
            </div>
            {property.location?.zipCode && (
              <div className="detail-item">
                <label>Zip Code</label>
                <p>{property.location.zipCode}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
