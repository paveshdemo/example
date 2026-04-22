import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/dataService';
import { FiBell } from 'react-icons/fi';

const Header = ({ title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setUnread(res.data.unreadCount);
      } catch (err) {
        // silent fail
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const getBaseRoute = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'customer') return '/customer';
    if (user?.role === 'maintenance_staff') return '/staff';
    return '/';
  };

  const baseRoute = getBaseRoute();

  return (
    <header className="header">
      <div className="header-left">
        <h2>{title || 'Dashboard'}</h2>
      </div>
      <div className="header-right">
        <button className="notification-bell" onClick={() => navigate(`${baseRoute}/notifications`)}>
          <FiBell />
          {unread > 0 && <span className="notification-badge">{unread > 9 ? '9+' : unread}</span>}
        </button>
        <button className="user-menu" onClick={() => navigate(`${baseRoute}/profile`)}>
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '14px' }}>{user?.name}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
