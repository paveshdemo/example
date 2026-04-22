import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiGrid, FiUsers, FiFileText, FiTool, FiDollarSign, FiBarChart2, FiMessageSquare, FiSettings, FiLogOut, FiUser, FiClipboard, FiLayers, FiBriefcase } from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { section: 'Dashboard', links: [
      { to: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    ]},
    { section: 'Properties', links: [
      { to: '/admin/properties', icon: <FiGrid />, label: 'Properties' },
      { to: '/admin/purchase-requests', icon: <FiClipboard />, label: 'Purchase Requests' },
    ]},
    { section: 'Construction', links: [
      { to: '/admin/construction', icon: <FiTool />, label: 'Construction Tracking' },
    ]},
    { section: 'Users', links: [
      { to: '/admin/customers', icon: <FiUsers />, label: 'Customers' },
      { to: '/admin/users', icon: <FiUser />, label: 'Staff Users' },
    ]},
    { section: 'Documents', links: [
      { to: '/admin/documents', icon: <FiFileText />, label: 'Documents' },
    ]},
    { section: 'Payments', links: [
      { to: '/admin/payments', icon: <FiDollarSign />, label: 'Payments' },
      { to: '/admin/payment-reports', icon: <FiBarChart2 />, label: 'Payment Reports' },
    ]},
    { section: 'Analytics', links: [
      { to: '/admin/analytics-sales', icon: <FiBarChart2 />, label: 'Sales Analytics' },
    ]},
    { section: 'Feedback', links: [
      { to: '/admin/feedback', icon: <FiMessageSquare />, label: 'Feedback' },
    ]},
  ];

  const customerLinks = [
    { section: 'Dashboard', links: [
      { to: '/customer/dashboard', icon: <FiHome />, label: 'Dashboard' },
    ]},
    { section: 'Properties', links: [
      { to: '/properties', icon: <FiGrid />, label: 'Browse Properties' },
      { to: '/customer/properties', icon: <FiLayers />, label: 'My Properties' },
      { to: '/customer/purchase-requests', icon: <FiClipboard />, label: 'My Requests' },
    ]},
    { section: 'Documents', links: [
      { to: '/customer/documents', icon: <FiFileText />, label: 'My Documents' },
    ]},
    { section: 'Maintenance', links: [
      { to: '/customer/construction', icon: <FiTool />, label: 'Construction Status' },
      { to: '/customer/change-requests', icon: <FiClipboard />, label: 'Submit Maintenance Request' },
    ]},
    { section: 'Payments', links: [
      { to: '/customer/payments', icon: <FiDollarSign />, label: 'Payments' },
    ]},
    { section: 'Feedback', links: [
      { to: '/customer/feedback', icon: <FiMessageSquare />, label: 'Feedback' },
    ]},
  ];

  const staffLinks = [
    { section: 'Dashboard', links: [
      { to: '/staff', icon: <FiHome />, label: 'Dashboard' },
      { to: '/staff/properties', icon: <FiLayers />, label: 'Assigned Properties' },
    ]},
    { section: 'Account', links: [
      { to: '/staff/profile', icon: <FiUser />, label: 'Profile' },
      { to: '/staff/notifications', icon: <FiMessageSquare />, label: 'Notifications' },
    ]},
  ];

  let navSections = [];
  if (user?.role === 'admin') navSections = adminLinks;
  else if (user?.role === 'customer') navSections = customerLinks;
  else if (user?.role === 'maintenance_staff') navSections = staffLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>🏠 PropManager</h1>
        <p>Property Management System</p>
      </div>
      <nav className="sidebar-nav">
        {navSections.map((section, i) => (
          <div className="nav-section" key={i}>
            <div className="nav-section-title">{section.section}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="icon">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <NavLink 
          to={user?.role === 'admin' ? '/admin/profile' : user?.role === 'customer' ? '/customer/profile' : '/staff/profile'} 
          className="nav-link"
        >
          <span className="icon"><FiSettings /></span>
          Profile Settings
        </NavLink>
        <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <span className="icon"><FiLogOut /></span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
