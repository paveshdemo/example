export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  const colors = {
    available: '#28a745',
    sold: '#dc3545',
    reserved: '#ffc107',
    pending: '#ffc107',
    approved: '#28a745',
    rejected: '#dc3545',
    verified: '#28a745',
    completed: '#28a745',
    in_progress: '#17a2b8',
    not_started: '#6c757d',
    submitted: '#17a2b8',
    reviewed: '#ffc107',
    responded: '#28a745',
    partial: '#ffc107',
    active: '#28a745',
    inactive: '#dc3545'
  };
  return colors[status] || '#6c757d';
};

export const getStatusLabel = (status) => {
  return status ? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
};

export const API_URL = 'http://localhost:5000';
