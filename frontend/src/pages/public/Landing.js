import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiDollarSign, FiTool, FiBarChart2, FiFileText, FiMessageSquare } from 'react-icons/fi';

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
    if (user.role === 'maintenance_staff') return <Navigate to="/staff/assigned-properties" replace />;
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <h1>Property Management System</h1>
        <p>
          Centralized, real-time management of properties, tenants, maintenance and
          financial information to improve efficiency, transparency and stakeholder satisfaction.
        </p>
        <div className="btn-group">
          <Link to="/login" className="btn btn-lg" style={{ background: 'white', color: '#1a73e8' }}>
            Login
          </Link>
          <Link to="/register" className="btn btn-lg btn-outline" style={{ borderColor: 'white', color: 'white' }}>
            Register
          </Link>
          <Link to="/properties" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            Browse Properties
          </Link>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <div className="icon"><FiGrid /></div>
          <h3>Property Management</h3>
          <p>Create, manage and track property listings with detailed information, images and status updates.</p>
        </div>
        <div className="feature-card">
          <div className="icon"><FiDollarSign /></div>
          <h3>Payment Tracking</h3>
          <p>Secure payment processing with real-time tracking, progress visualization and comprehensive reports.</p>
        </div>
        <div className="feature-card">
          <div className="icon"><FiTool /></div>
          <h3>Construction Tracking</h3>
          <p>Monitor construction progress with timeline updates, status history and instant notifications.</p>
        </div>
        <div className="feature-card">
          <div className="icon"><FiFileText /></div>
          <h3>Document Management</h3>
          <p>Secure storage and management of legal documents with role-based access control.</p>
        </div>
        <div className="feature-card">
          <div className="icon"><FiBarChart2 /></div>
          <h3>Analytics & Reports</h3>
          <p>Comprehensive dashboards with KPIs, sales analytics and financial summaries.</p>
        </div>
        <div className="feature-card">
          <div className="icon"><FiMessageSquare /></div>
          <h3>Customer Feedback</h3>
          <p>Built-in feedback system enabling customers to share their experience and improvement suggestions.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #dadce0', color: '#5f6368', fontSize: '14px' }}>
        <p>&copy; 2026 Property Management System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Landing;
