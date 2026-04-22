import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: '72px', color: '#dc3545', marginBottom: '16px' }}>403</h1>
        <h2 style={{ marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: '#5f6368', marginBottom: '24px' }}>
          You don't have permission to access this page.
        </p>
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'customer' ? '/customer/dashboard' : '/staff/assigned-properties'}
              className="btn btn-primary"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
          )}
          <Link to="/" className="btn btn-outline">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
