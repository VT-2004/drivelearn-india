import { useState, useEffect, useRef } from 'react';
import { getMyNotifications, markMyNotificationRead, markAllNotificationsRead, deleteNotification } from '../services/api';

const NotificationBell = ({ onSelectNotification }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s for live updates
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markMyNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => {
        const wasUnread = notifications.find((n) => n.id === id && !n.isRead);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={bellRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        title="Notifications & Q&A Messages"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#FFFFFF',
          border: '1.5px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontSize: '18px' }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '999px',
              padding: '2px 6px',
              fontSize: '10.5px',
              fontWeight: 800,
              minWidth: '18px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
              border: '2px solid #FFFFFF',
              lineHeight: 1.2,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '360px',
            maxWidth: '90vw',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
            border: '1px solid var(--line)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--paper)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '12px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Checking notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) handleMarkRead(notif.id);
                    if (onSelectNotification) onSelectNotification(notif);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--line)',
                    background: notif.isRead ? '#FFFFFF' : 'rgba(240, 90, 40, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notif.isRead ? '#FFFFFF' : 'rgba(240, 90, 40, 0.04)')
                  }
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontWeight: notif.isRead ? 600 : 700, fontSize: '13px', color: 'var(--ink)' }}>
                      {notif.title}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {formatTimestamp(notif.createdAt)}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--ink-light)', marginTop: '4px', lineHeight: 1.4 }}>
                    {notif.message}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {!notif.isRead ? (
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>● Unread</span>
                      ) : (
                        'Read'
                      )}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkRead(notif.id, e)}
                          title="Mark read"
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '11px',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          ✓ Read
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(notif.id, e)}
                        title="Delete notification"
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '11px',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>All caught up!</div>
                <div style={{ fontSize: '12px' }}>No new messages or notifications.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
