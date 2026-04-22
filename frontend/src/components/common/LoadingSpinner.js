import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="loading">
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
      <p style={{ color: '#5f6368', fontSize: '14px' }}>{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;
