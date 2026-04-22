import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <div>
      <h1 style={{ fontSize: '72px', color: '#1a73e8', marginBottom: '16px' }}>404</h1>
      <h2 style={{ marginBottom: '8px' }}>Page Not Found</h2>
      <p style={{ color: '#5f6368', marginBottom: '24px' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  </div>
);

export default NotFound;
