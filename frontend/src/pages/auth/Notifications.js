import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications } from '../../services/dataService';
import { formatDateTime } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  };

  const handleClearAll = async () => {
    await clearNotifications();
    setNotifications([]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="subtitle">{notifications.length} notification(s)</p>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
            <FiCheck /> Mark All Read
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleClearAll}>
            <FiTrash2 /> Clear All
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><FiBell /></div>
          <h3>No Notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <div
              key={n._id}
              className="card"
              style={{
                borderLeft: `4px solid ${n.isRead ? '#dadce0' : '#1a73e8'}`,
                opacity: n.isRead ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{n.title}</h4>
                  <p style={{ fontSize: '14px', color: '#5f6368' }}>{n.message}</p>
                  <p style={{ fontSize: '12px', color: '#9aa0a6', marginTop: '4px' }}>{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <button className="btn btn-sm btn-outline" onClick={() => handleMarkRead(n._id)}>
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
