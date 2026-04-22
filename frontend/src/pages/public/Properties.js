import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProperties } from '../../services/dataService';
import { formatCurrency, API_URL } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiSearch, FiMapPin } from 'react-icons/fi';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', type: '', minPrice: '', maxPrice: '', sort: '' });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;
      const res = await getProperties(params);
      setProperties(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header">
        <div>
          <h1>Available Properties</h1>
          <p className="subtitle">Browse and discover your dream property</p>
        </div>
      </div>

      <form onSubmit={handleFilter} className="filters-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label><FiSearch /> Search</label>
          <input
            type="text" className="form-control" placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select className="form-control" value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
            <option value="condo">Condo</option>
          </select>
        </div>
        <div className="form-group">
          <label>Min Price</label>
          <input type="number" className="form-control" placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Max Price</label>
          <input type="number" className="form-control" placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Sort By</label>
          <select className="form-control" value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <div className="form-group">
          <label>&nbsp;</label>
          <button type="submit" className="btn btn-primary">Search</button>
        </div>
      </form>

      {loading ? <LoadingSpinner /> : (
        properties.length === 0 ? (
          <div className="empty-state">
            <h3>No Properties Found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="property-grid">
            {properties.map((prop) => (
              <Link to={`/properties/${prop._id}`} key={prop._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="property-card">
                  <div className="property-card-image">
                    {prop.images && prop.images.length > 0 ? (
                      <img src={`${API_URL}${prop.images[0]}`} alt={prop.title} />
                    ) : (
                      '🏠'
                    )}
                  </div>
                  <div className="property-card-body">
                    <h3>{prop.title}</h3>
                    <div className="location"><FiMapPin /> {prop.location?.city}, {prop.location?.state}</div>
                    <div className="price">{formatCurrency(prop.price)}</div>
                    <div className="features">
                      {prop.features?.bedrooms > 0 && <span>{prop.features.bedrooms} Beds</span>}
                      {prop.features?.bathrooms > 0 && <span>{prop.features.bathrooms} Baths</span>}
                      {prop.features?.area > 0 && <span>{prop.features.area} sqft</span>}
                    </div>
                  </div>
                  <div className="property-card-footer">
                    <StatusBadge status={prop.status} />
                    <span style={{ fontSize: '12px', color: '#5f6368', textTransform: 'capitalize' }}>{prop.type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Properties;
