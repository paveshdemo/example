import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProperties, getMaintenanceStaff, getAllChangeRequests, getPropertyConstructionUpdates, createConstructionUpdate, approveChangeRequest, assignStaffToProperty, assignStaffToChangeRequest } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiEye, FiUser, FiFilter, FiImage } from 'react-icons/fi';
import './AdminConstructionRequests.css';

const AdminConstructionRequests = () => {
  const [properties, setProperties] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [updates, setUpdates] = useState({});
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: 'foundation',
    percentage: 0,
    notes: '',
    images: []
  });
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsRes, staffRes, changeReqRes] = await Promise.all([
        getAdminProperties(),
        getMaintenanceStaff(),
        getAllChangeRequests()
      ]);
      
      // Get properties with construction status
      const constructionProps = propsRes.data.data.filter(
        p => p.constructionStatus && (p.constructionStatus === 'in_progress' || p.constructionStatus === 'not_started')
      );
      
      // Add customer change requests (maintenance requests) as construction projects
      const changeRequests = changeReqRes.data.data || [];
      
      // Combine both
      const allProjects = [
        ...constructionProps,
        ...changeRequests.map(cr => ({
          _id: cr._id,
          title: cr.title,
          description: cr.description,
          location: null,
          type: cr.type,
          constructionStatus: 'pending_request',
          constructionPercentage: 0,
          assignedStaff: cr.assignedStaff || [],
          owner: cr.customer,
          isChangeRequest: true,
          originalData: cr
        }))
      ];
      
      setProperties(allProjects);
      setStaffUsers(staffRes.data.data);
      
      // Fetch construction updates for each property
      const updatesMap = {};
      for (const prop of constructionProps) {
        try {
          const updatesRes = await getPropertyConstructionUpdates(prop._id);
          updatesMap[prop._id] = updatesRes.data.data || [];
        } catch (err) {
          console.log('No updates for property', prop._id);
          updatesMap[prop._id] = [];
        }
      }
      setUpdates(updatesMap);
      console.log('Properties:', constructionProps);
      console.log('Change Requests:', changeRequests);
    } catch (err) {
      console.error('Error fetching data:', err);
      setProperties([]);
      setStaffUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    return properties.filter(p => {
      const matchStatus = !filters.status || p.constructionStatus === filters.status;
      const matchSearch = !filters.search || 
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.location?.city?.toLowerCase().includes(filters.search.toLowerCase());
      return matchStatus && matchSearch;
    });
  };

  const getAvailableStaff = (property) => {
    return staffUsers.filter(s => !property.assignedStaff?.some(as => as._id === s._id));
  };

  const handleUpdateFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setUpdateForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...Array.from(files)]
      }));
    } else {
      setUpdateForm(prev => ({
        ...prev,
        [name]: name === 'percentage' ? parseInt(value) : value
      }));
    }
  };

  const removeImage = (index) => {
    setUpdateForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitUpdate = async () => {
    if (!expandedProperty) return;
    setSubmittingUpdate(true);
    try {
      const formData = new FormData();
      formData.append('status', updateForm.status);
      formData.append('percentage', updateForm.percentage);
      formData.append('notes', updateForm.notes);
      
      updateForm.images.forEach((img, index) => {
        if (img instanceof File) {
          formData.append('images', img);
        }
      });

      await createConstructionUpdate(expandedProperty._id, formData);
      
      // Reset form and refresh updates
      setUpdateForm({
        status: 'foundation',
        percentage: 0,
        notes: '',
        images: []
      });
      
      // Refresh updates for this property
      const updatesRes = await getPropertyConstructionUpdates(expandedProperty._id);
      setUpdates(prev => ({
        ...prev,
        [expandedProperty._id]: updatesRes.data.data || []
      }));
      
      alert('Construction update submitted successfully!');
    } catch (err) {
      console.error('Error submitting update:', err);
      alert('Failed to submit update: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId || !selectedProperty) return;
    
    setAssigning(true);
    try {
      let response;

      if (selectedProperty.isChangeRequest) {
        // For change requests, assign staff directly to the change request
        console.log('Assigning staff to Change Request:', selectedProperty.originalData._id, 'Staff ID:', selectedStaffId);
        response = await assignStaffToChangeRequest(selectedProperty.originalData._id, { staffId: selectedStaffId });
        
        // Update the local state with the response
        const updatedProps = properties.map(p => {
          if (p._id === selectedProperty._id) {
            return {
              ...p,
              assignedStaff: response.data.data.assignedStaff
            };
          }
          return p;
        });
        setProperties(updatedProps);
      } else {
        // For regular properties, assign staff to the property
        console.log('Assigning staff to Property:', selectedProperty._id, 'Staff ID:', selectedStaffId);
        response = await assignStaffToProperty(selectedProperty._id, { staffId: selectedStaffId });
        
        // Update the local state with the response
        const updatedProps = properties.map(p => {
          if (p._id === selectedProperty._id) {
            return {
              ...p,
              assignedStaff: response.data.data.assignedStaff
            };
          }
          return p;
        });
        setProperties(updatedProps);
      }
      
      setSelectedProperty(null);
      setSelectedStaffId('');
      alert('✓ Staff member assigned successfully!');
    } catch (err) {
      console.error('Error assigning staff:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
      alert('❌ Failed to assign staff:\n\n' + errorMsg);
    } finally {
      setAssigning(false);
    }
  };

  const handleApproveRequest = async (request) => {
    if (!request.originalData) return;
    
    setApprovingRequest(prev => ({ ...prev, [request._id]: true }));
    try {
      await approveChangeRequest(request.originalData._id, {});
      
      // Refresh the data to get updated request status
      await fetchData();
      alert('Construction request approved! Admin can now assign staff and update progress.');
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request: ' + (err.response?.data?.message || err.message));
    } finally {
      setApprovingRequest(prev => ({ ...prev, [request._id]: false }));
    }
  };

  if (loading) return <LoadingSpinner />;

  const filteredProps = getFilteredProperties();
  
  // Count only construction projects (not customer requests)
  const constructionProjects = properties.filter(p => !p.isChangeRequest);
  const ongoingCount = constructionProjects.filter(p => p.constructionStatus === 'in_progress').length;
  const pendingCount = constructionProjects.filter(p => p.constructionStatus === 'not_started').length;
  const avgProgress = constructionProjects.length > 0 
    ? Math.round(constructionProjects.reduce((sum, p) => sum + (p.constructionPercentage || 0), 0) / constructionProjects.length)
    : 0;
  const customerRequestsCount = properties.filter(p => p.isChangeRequest).length;

  return (
    <div className="construction-requests-container">
      <div className="page-header">
        <div>
          <h1>🏗️ Construction Progress Dashboard</h1>
          <p className="subtitle">{ongoingCount} Ongoing • {pendingCount} Pending • {customerRequestsCount} Customer Requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{ongoingCount}</div>
          <div className="stat-label">Ongoing Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending Start</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgProgress}%</div>
          <div className="stat-label">Avg Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{customerRequestsCount}</div>
          <div className="stat-label">Maintenance Requests</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="form-control"
            style={{ maxWidth: '300px' }}
          />
        </div>
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="form-control"
            style={{ maxWidth: '200px' }}
          >
            <option value="">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
      </div>

      {/* Customer Maintenance Requests Section */}
      {getFilteredProperties().filter(p => p.isChangeRequest).length > 0 && (
        <div className="maintenance-requests-section">
          <h2>📋 Customer Maintenance Requests - Awaiting Approval</h2>
          <div className="construction-grid">
            {getFilteredProperties().filter(p => p.isChangeRequest).map(request => {
              const requestStatus = request.originalData?.status || 'pending';
              const isApproved = requestStatus === 'approved';
              const isRejected = requestStatus === 'rejected';
              
              return (
                <div key={request._id} className={`construction-card maintenance-request-card ${requestStatus}`}>
                  <div className="card-header">
                    <div>
                      <h3>{request.title}</h3>
                      <p className="property-location">Maintenance Request</p>
                    </div>
                    <span className={`status-badge ${requestStatus}`}>
                      {requestStatus === 'pending' && '⏳ Pending Review'}
                      {requestStatus === 'approved' && '✅ Approved'}
                      {requestStatus === 'rejected' && '❌ Rejected'}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <p className="description">{request.description}</p>
                    <p className="type"><strong>Type:</strong> {request.type}</p>
                    <p><strong>Priority:</strong> {request.originalData?.priority || 'Normal'}</p>
                  </div>

                  <div className="staff-section">
                    <h4>Assigned Staff</h4>
                    {request.assignedStaff && request.assignedStaff.length > 0 ? (
                      <div className="staff-list">
                        {request.assignedStaff.map(staff => (
                          <span key={staff._id} className="staff-badge">{staff.name}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="no-staff">No staff assigned</p>
                    )}
                  </div>

                  {/* Status Message */}
                  {requestStatus === 'pending' && (
                    <div className="status-message warning">
                      ⚠️ This request must be approved before staff can be assigned or progress can be updated.
                    </div>
                  )}
                  {isApproved && (
                    <div className="status-message success">
                      ✅ Request approved. You can now assign staff and update progress.
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="card-actions">
                    {requestStatus === 'pending' && (
                      <button 
                        className="btn btn-success btn-block"
                        onClick={() => handleApproveRequest(request)}
                        disabled={approvingRequest[request._id]}
                      >
                        {approvingRequest[request._id] ? 'Approving...' : '✅ Approve Request'}
                      </button>
                    )}
                    
                    {isApproved && (!request.assignedStaff || request.assignedStaff.length === 0) && (
                      <button 
                        className="btn btn-primary btn-block"
                        onClick={() => {
                          setSelectedProperty(request);
                          setSelectedStaffId('');
                        }}
                        disabled={!staffUsers || staffUsers.length === 0}
                      >
                        {!staffUsers || staffUsers.length === 0 ? 'No staff available' : '👷 Assign Staff'}
                      </button>
                    )}

                    {isApproved && request.assignedStaff && request.assignedStaff.length > 0 && (
                      <div className="status-message info">
                        ✓ Staff assigned. Only one staff member can be assigned per maintenance request.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {filteredProps.filter(p => !p.isChangeRequest).length === 0 ? (
        <div className="empty-state">
          <p>No construction projects found</p>
        </div>
      ) : (
        <>
          <h2 style={{marginTop: '30px', marginBottom: '20px'}}>🏗️ Property Construction Projects</h2>
          <div className="construction-grid">
            {filteredProps.filter(p => !p.isChangeRequest).map(property => (
              <div key={property._id} className="construction-card">
              <div className="card-header">
                <div>
                  <h3>{property.title}</h3>
                  <p className="property-location">{property.location?.city}, {property.location?.state}</p>
                </div>
                <StatusBadge status={property.constructionStatus} />
              </div>

              <div className="progress-section">
                <div className="progress-info">
                  <span className="progress-label">Progress</span>
                  <span className="progress-percent">{property.constructionPercentage || 0}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${property.constructionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="property-details">
                <div className="detail-item">
                  <span className="label">Type:</span>
                  <span className="value" style={{ textTransform: 'capitalize' }}>{property.type}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Owner:</span>
                  <span className="value">{property.owner?.name || 'Unassigned'}</span>
                </div>
              </div>

              {/* Assigned Staff */}
              <div className="staff-section">
                <div className="staff-header">
                  <span className="staff-title">👷 Assigned Staff ({property.assignedStaff?.length || 0})</span>
                </div>
                {property.assignedStaff && property.assignedStaff.length > 0 ? (
                  <div className="staff-list">
                    {property.assignedStaff.map(staff => (
                      <div key={staff._id} className="staff-item">
                        <div className="staff-avatar">{staff.name?.charAt(0).toUpperCase()}</div>
                        <div className="staff-info">
                          <p className="staff-name">{staff.name}</p>
                          <p className="staff-email">{staff.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-staff">No staff assigned yet</p>
                )}
              </div>

              {/* Actions */}
              <div className="card-actions">
                {!property.approvedConstructionRequest && (
                  <div className="status-message warning">
                    ⚠️ No approved construction request. Cannot assign staff.
                  </div>
                )}
                
                {property.approvedConstructionRequest && getAvailableStaff(property).length > 0 && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedProperty(property)}
                    style={{ marginRight: '8px' }}
                  >
                    <FiUser style={{ marginRight: '4px' }} /> Assign Staff
                  </button>
                )}
                
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => setExpandedProperty(expandedProperty?._id === property._id ? null : property)}
                  style={{ marginRight: '8px' }}
                >
                  📊 {expandedProperty?._id === property._id ? 'Hide' : 'Update'} Progress
                </button>
                
                <Link to={`/admin/properties/edit/${property._id}`} className="btn btn-sm btn-info">
                  <FiEye style={{ marginRight: '4px' }} /> Edit
                </Link>
              </div>

              {/* Expanded Update Section */}
              {expandedProperty?._id === property._id && (
                <div className="update-section">
                  <h4>📝 Submit Construction Update</h4>
                  
                  <div className="form-group">
                    <label>Stage/Status</label>
                    <select 
                      name="status" 
                      value={updateForm.status}
                      onChange={handleUpdateFormChange}
                      className="form-control"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="foundation">Foundation</option>
                      <option value="framing">Framing</option>
                      <option value="roofing">Roofing</option>
                      <option value="interior">Interior</option>
                      <option value="finishing">Finishing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Progress Percentage: {updateForm.percentage}%</label>
                    <input 
                      type="range" 
                      name="percentage"
                      min="0"
                      max="100"
                      value={updateForm.percentage}
                      onChange={handleUpdateFormChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes/Description</label>
                    <textarea 
                      name="notes"
                      value={updateForm.notes}
                      onChange={handleUpdateFormChange}
                      placeholder="Describe the current progress, challenges, or next steps..."
                      className="form-control"
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>📸 Add Photos</label>
                    <div className="image-upload">
                      <input 
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUpdateFormChange}
                        className="form-control"
                      />
                    </div>
                    {updateForm.images && updateForm.images.length > 0 && (
                      <div className="image-preview">
                        {updateForm.images.map((img, index) => (
                          <div key={index} className="preview-item">
                            {img instanceof File ? (
                              <>
                                <img src={URL.createObjectURL(img)} alt={`Preview ${index}`} />
                                <button 
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="remove-btn"
                                >✕</button>
                              </>
                            ) : (
                              <img src={img} alt={`Existing ${index}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleSubmitUpdate}
                    disabled={submittingUpdate}
                    className="btn btn-primary btn-block"
                  >
                    {submittingUpdate ? 'Submitting...' : '✓ Submit Update'}
                  </button>
                </div>
              )}

              {/* Recent Updates Timeline */}
              {updates[property._id] && updates[property._id].length > 0 && (
                <div className="updates-timeline">
                  <h4>📋 Update History</h4>
                  {updates[property._id].map((update, idx) => (
                    <div key={update._id} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="update-header">
                          <span className="stage-badge">{update.status}</span>
                          <span className="percentage">{update.percentage}%</span>
                          <span className="date">{formatDate(update.createdAt)}</span>
                        </div>
                        {update.notes && <p className="notes">{update.notes}</p>}
                        {update.images && update.images.length > 0 && (
                          <div className="timeline-images">
                            {update.images.map((img, i) => (
                              <img key={i} src={img} alt={`Update ${i}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}  
        </div>
        </>
      )}

      {/* Staff Assignment Modal */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={() => setSelectedProperty(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👷 Assign Maintenance Staff</h2>
              <button className="modal-close" onClick={() => setSelectedProperty(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p className="property-info">
                <strong>Request:</strong> {selectedProperty.title}
              </p>

              <div className="form-group">
                <label>Select Staff Member *</label>
                {!staffUsers || staffUsers.length === 0 ? (
                  <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', color: '#92400e' }}>
                    No maintenance staff available in the system.
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    style={{ padding: '10px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="">-- Choose a staff member --</option>
                    {staffUsers.map(staff => {
                      const isAlreadyAssigned = selectedProperty.assignedStaff?.some(as => as._id === staff._id);
                      const roleDisplay = staff.role 
                        ? staff.role.replace(/_/g, ' ').toUpperCase() 
                        : 'STAFF';
                      return (
                        <option 
                          key={staff._id} 
                          value={staff._id}
                          disabled={isAlreadyAssigned}
                        >
                          {staff.name} - {roleDisplay} {isAlreadyAssigned ? '(Already Assigned)' : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {selectedProperty.assignedStaff && selectedProperty.assignedStaff.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                  <strong style={{ color: '#15803d' }}>Currently Assigned:</strong>
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedProperty.assignedStaff.map(staff => (
                      <span key={staff._id} style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        ✓ {staff.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedProperty(null)}
                style={{ padding: '10px 20px', background: '#f3f4f6', color: '#1f2937', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssignStaff}
                disabled={assigning || !selectedStaffId || !staffUsers || staffUsers.length === 0}
                style={{ 
                  padding: '10px 20px', 
                  background: selectedStaffId ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: selectedStaffId ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {assigning ? '⏳ Assigning...' : '✓ Assign Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConstructionRequests;
