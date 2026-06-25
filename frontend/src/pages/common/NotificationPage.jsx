import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaCheckDouble } from 'react-icons/fa';
import './NotificationPage.css';

const NotificationPage = ({ notificationsAPI, showToast }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsAPI.getAll();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            showToast?.('Failed to load notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            showToast?.('Notification marked as read', 'success');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showToast?.('Failed to mark notification as read', 'error');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const data = await notificationsAPI.markAllAsRead();
            setNotifications(data);
            showToast?.('All notifications marked as read', 'success');
        } catch (error) {
            console.error('Error marking all as read:', error);
            showToast?.('Failed to mark all notifications as read', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationsAPI.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            showToast?.('Notification deleted', 'success');
        } catch (error) {
            console.error('Error deleting notification:', error);
            showToast?.('Failed to delete notification', 'error');
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications?')) {
            return;
        }

        try {
            await notificationsAPI.deleteAll();
            setNotifications([]);
            showToast?.('All notifications deleted', 'success');
        } catch (error) {
            console.error('Error deleting all notifications:', error);
            showToast?.('Failed to delete all notifications', 'error');
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }

        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getTimeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return new Date(date).toLocaleDateString();
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'task': return '#007bff';
            case 'project': return '#28a745';
            case 'complaint': return '#dc3545';
            case 'account': return '#6c757d';
            default: return '#17a2b8';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notification-page">
            <div className="notification-header">
                <div className="header-left">
                    <FaBell className="header-icon" />
                    <h1>Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount} unread</span>
                    )}
                </div>

                <div className="header-actions">
                    {unreadCount > 0 && (
                        <button
                            className="btn-secondary"
                            onClick={handleMarkAllAsRead}
                        >
                            <FaCheckDouble /> Mark All as Read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            className="btn-danger"
                            onClick={handleDeleteAll}
                        >
                            <FaTrash /> Delete All
                        </button>
                    )}
                </div>
            </div>

            <div className="notification-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({notifications.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    Read ({notifications.filter(n => n.read).length})
                </button>
            </div>

            <div className="notification-list">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <FaBell className="empty-icon" />
                        <h3>No notifications</h3>
                        <p>You&apos;re all caught up!</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                        >
                            <div
                                className="notification-card-header"
                                style={{ borderLeftColor: getTypeColor(notification.type) }}
                            >
                                <div className="notification-card-info">
                                    <span className="notification-type" style={{ color: getTypeColor(notification.type) }}>
                                        {notification.type.toUpperCase()}
                                    </span>
                                    <span className="notification-date">{getTimeSince(notification.createdAt)}</span>
                                </div>
                                <div className="notification-card-actions">
                                    {!notification.read && (
                                        <button
                                            className="action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification._id);
                                            }}
                                            title="Mark as read"
                                        >
                                            <FaCheck />
                                        </button>
                                    )}
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(notification._id);
                                        }}
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            <div
                                className="notification-card-body"
                                onClick={() => handleNotificationClick(notification)}
                                style={{ cursor: notification.link ? 'pointer' : 'default' }}
                            >
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>
                                {notification.link && (
                                    <span className="notification-link-hint">Click to view</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
