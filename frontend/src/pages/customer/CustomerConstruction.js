import React, { useState, useEffect } from 'react';
import { getMyProperties } from '../../services/dataService';
import { getConstructionUpdates } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './CustomerConstruction.css';

const CustomerConstruction = () => {
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyProperties();
        setProperties(res.data.data);
        if (res.data.data.length > 0) {
          setSelected(res.data.data[0]._id);
          await fetchUpdates(res.data.data[0]._id);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const fetchUpdates = async (propId) => {
    setLoadingUpdates(true);
    try {
      const res = await getConstructionUpdates(propId);
      setUpdates(res.data.data || []);
    } catch { setUpdates([]); }
    finally { setLoadingUpdates(false); }
  };

  const handleSelect = (propId) => {
    setSelected(propId);
    fetchUpdates(propId);
  };

  const selectedProp = properties.find(p => p._id === selected);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="customer-construction-container">
      <div className="page-header"><h1>🏗️ Construction Status</h1></div>

      {properties.length === 0 ? (
        <div className="empty-state"><p>No properties under construction</p></div>
      ) : (
        <>
          <div className="property-selector">
            {properties.map(p => (
              <button 
                key={p._id} 
                className={`property-btn ${selected === p._id ? 'active' : ''}`} 
                onClick={() => handleSelect(p._id)}
              >
                {p.title}
              </button>
            ))}
          </div>

          {selectedProp && (
            <div className="property-status-card">
              <h3>{selectedProp.title}</h3>
              <p className="property-location">{selectedProp.location?.city}, {selectedProp.location?.state}</p>
              
              <div className="status-grid">
                <div className="status-item">
                  <span className="label">Status</span>
                  <StatusBadge status={selectedProp.constructionStatus} />
                </div>
                <div className="status-item">
                  <span className="label">Progress</span>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${selectedProp.constructionPercentage || 0}%` }}></div>
                    </div>
                    <div className="progress-text">{selectedProp.constructionPercentage || 0}% Complete</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loadingUpdates ? <LoadingSpinner /> : (
            <div className="timeline-container">
              <h3>📋 Construction Timeline</h3>
              {updates.length === 0 ? (
                <div className="no-updates">
                  <p>No updates yet. Check back soon for construction progress!</p>
                </div>
              ) : (
                <div className="construction-timeline">
                  {updates.map((u, index) => (
                    <div key={u._id} className="timeline-item">
                      <div className="timeline-marker">
                        <div className="marker-dot"></div>
                      </div>
                      <div className="timeline-body">
                        <div className="update-header">
                          <span className="update-date">{formatDate(u.createdAt)}</span>
                          <div className="update-badges">
                            <span className="stage-name" style={{ textTransform: 'capitalize' }}>{u.status.replace('_', ' ')}</span>
                            <span className="progress-badge">{u.percentage}% complete</span>
                          </div>
                        </div>
                        {u.notes && <p className="update-notes">{u.notes}</p>}
                        {u.images && u.images.length > 0 && (
                          <div className="update-images">
                            {u.images.map((img, i) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt={`Construction Update ${i}`} 
                                className="update-image"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerConstruction;
