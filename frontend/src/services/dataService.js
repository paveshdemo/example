import API from './api';

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getProfile = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// Properties
export const getProperties = (params) => API.get('/properties', { params });
export const getAdminProperties = (params) => API.get('/properties/admin', { params });
export const getProperty = (id) => API.get(`/properties/${id}`);
export const createProperty = (data) => API.post('/properties', data);
export const updateProperty = (id, data) => API.put(`/properties/${id}`, data);
export const deleteProperty = (id) => API.delete(`/properties/${id}`);
export const updatePropertyStatus = (id, data) => API.put(`/properties/${id}/status`, data);
export const assignStaffToProperty = (id, data) => API.put(`/properties/${id}/assign-staff`, data);
export const removeStaffFromProperty = (id, staffId) => API.delete(`/properties/${id}/assign-staff/${staffId}`);
export const getMyProperties = () => API.get('/properties/my-properties');
export const getAssignedProperties = () => API.get('/properties/assigned');

// Purchase Requests
export const createPurchaseRequest = (data) => API.post('/purchase-requests', data);
export const getMyPurchaseRequests = () => API.get('/purchase-requests/my');
export const getAllPurchaseRequests = (params) => API.get('/purchase-requests', { params });
export const getPurchaseRequest = (id) => API.get(`/purchase-requests/${id}`);
export const approvePurchaseRequest = (id, data) => API.put(`/purchase-requests/${id}/approve`, data);
export const rejectPurchaseRequest = (id, data) => API.put(`/purchase-requests/${id}/reject`, data);

// Users
export const getCustomers = (params) => API.get('/users/customers', { params });
export const getCustomer = (id) => API.get(`/users/customers/${id}`);
export const updateCustomer = (id, data) => API.put(`/users/customers/${id}`, data);
export const getStaffUsers = (params) => API.get('/users/staff', { params });
export const createStaffUser = (data) => API.post('/users/staff', data);
export const updateStaffUser = (id, data) => API.put(`/users/staff/${id}`, data);
export const toggleUserActive = (id) => API.put(`/users/${id}/toggle-active`);
export const getMaintenanceStaff = () => API.get('/users/maintenance-staff');

// Documents
export const uploadDocument = (data) => API.post('/documents', data);
export const getAllDocuments = (params) => API.get('/documents', { params });
export const getMyDocuments = () => API.get('/documents/my');
export const getDocument = (id) => API.get(`/documents/${id}`);
export const downloadDocument = (id) => API.get(`/documents/${id}/download`, { responseType: 'blob' });
export const deleteDocument = (id) => API.delete(`/documents/${id}`);

// Construction Updates
export const createConstructionUpdate = (propertyId, data) => {
  // If data is FormData, send it directly with proper content type
  if (data instanceof FormData) {
    data.append('property', propertyId);
    return API.post('/construction-updates', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  // Otherwise treat it as JSON
  return API.post('/construction-updates', { ...data, property: propertyId });
};
export const getPropertyConstructionUpdates = (propertyId) => API.get(`/construction-updates/property/${propertyId}`);
export const getMyConstructionUpdates = () => API.get('/construction-updates/my');

// Change Requests
export const createChangeRequest = (data) => API.post('/change-requests', data);
export const getMyChangeRequests = () => API.get('/change-requests/my');
export const getAllChangeRequests = (params) => API.get('/change-requests', { params });
export const getChangeRequest = (id) => API.get(`/change-requests/${id}`);
export const updateChangeRequest = (id, data) => API.put(`/change-requests/${id}`, data);
export const deleteChangeRequest = (id) => API.delete(`/change-requests/${id}`);
export const approveChangeRequest = (id, data) => API.put(`/change-requests/${id}/approve`, data);
export const rejectChangeRequest = (id, data) => API.put(`/change-requests/${id}/reject`, data);
export const assignStaffToChangeRequest = (id, data) => API.put(`/change-requests/${id}/assign-staff`, data);
export const removeStaffFromChangeRequest = (id, staffId) => API.delete(`/change-requests/${id}/assign-staff/${staffId}`);

// Payments
export const createPayment = (data) => API.post('/payments', data);
export const getMyPayments = (params) => API.get('/payments/my', { params });
export const getAllPayments = (params) => API.get('/payments', { params });
export const getPayment = (id) => API.get(`/payments/${id}`);
export const verifyPayment = (id, data) => API.put(`/payments/${id}/verify`, data);
export const rejectPayment = (id, data) => API.put(`/payments/${id}/reject`, data);
export const getPaymentProgress = (propertyId) => API.get(`/payments/progress/${propertyId}`);
export const getPaymentReports = (params) => API.get('/payments/reports', { params });

// Meetings
export const createMeetingRequest = (data) => API.post('/meetings', data);
export const getMyMeetingRequests = () => API.get('/meetings/my');
export const getAllMeetingRequests = (params) => API.get('/meetings', { params });
export const getMeetingRequest = (id) => API.get(`/meetings/${id}`);
export const scheduleMeetingRequest = (id, data) => API.put(`/meetings/${id}/schedule`, data);
export const completeMeetingRequest = (id, data) => API.put(`/meetings/${id}/complete`, data);
export const cancelMeetingRequest = (id, data) => API.put(`/meetings/${id}/cancel`, data);

// Feedback
export const createFeedback = (data) => API.post('/feedback', data);
export const getMyFeedback = () => API.get('/feedback/my');
export const getAllFeedback = (params) => API.get('/feedback', { params });
export const getFeedback = (id) => API.get(`/feedback/${id}`);
export const updateFeedback = (id, data) => API.put(`/feedback/${id}`, data);
export const deleteFeedback = (id) => API.delete(`/feedback/${id}`);
export const respondToFeedback = (id, data) => API.put(`/feedback/${id}/respond`, data);

// Dashboard
export const getAdminDashboard = () => API.get('/dashboard/admin');
export const getCustomerDashboard = () => API.get('/dashboard/customer');
export const getSalesAnalytics = () => API.get('/dashboard/analytics/sales');
export const getFinanceAnalytics = () => API.get('/dashboard/analytics/finance');

// Users (Admin)
export const getAllUsers = (params) => API.get('/users', { params });
export const getUser = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post('/users', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const getUserProperties = (id) => API.get(`/users/${id}/properties`);

// Property sub-resources
export const getPropertyDocuments = (propertyId) => API.get(`/documents/property/${propertyId}`);
export const getPropertyPayments = (propertyId) => API.get(`/payments/property/${propertyId}`);
export const getConstructionUpdates = (propertyId) => API.get(`/construction-updates/property/${propertyId}`);

// Dashboard aliases
export const getDashboardStats = () => API.get('/dashboard/admin');

// Purchase Request update
export const updatePurchaseRequest = (id, data) => API.put(`/purchase-requests/${id}`, data);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const clearNotifications = () => API.delete('/notifications');
