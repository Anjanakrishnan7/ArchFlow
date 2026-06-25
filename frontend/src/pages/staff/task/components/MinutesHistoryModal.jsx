import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaStickyNote, FaRegClock, FaTrash } from 'react-icons/fa';
import { staffAPI } from '../../../../utils/api';
import '../staffTask.css';

const MinutesHistoryModal = ({ isOpen, onClose, taskId, projectId }) => {
    const [minutes, setMinutes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMinutes = async () => {
            if (!projectId || !isOpen) return;
            try {
                setLoading(true);
                const data = await staffAPI.getProjectMinutes(projectId);
                const sortedMinutes = (data.minutes || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setMinutes(sortedMinutes);
            } catch (err) {
                console.error("Failed to fetch minutes", err);
                setMinutes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMinutes();
    }, [projectId, isOpen]);

    if (!isOpen) return null;

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const handleDelete = async (minuteId) => {
        if (window.confirm("Are you sure you want to delete this minute?")) {
            try {
                await staffAPI.deleteMinutes(minuteId);
                // Refresh list
                const remainingMinutes = minutes.filter(m => m._id !== minuteId);
                setMinutes(remainingMinutes);
            } catch (err) {
                console.error("Failed to delete minute", err);
                alert("Failed to delete minute. Please try again.");
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content minutes-history-extra-wide" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                <h3 className="modal-title-bold">Minutes History</h3>

                <div className="minutes-history-container">
                    {loading ? (
                        <div className="loading-state">Loading minutes...</div>
                    ) : minutes.length === 0 ? (
                        <div className="empty-state">No minutes recorded for this task.</div>
                    ) : (
                        <div className="minutes-list-modern">
                            {minutes.map((m) => (
                                <div key={m._id} className="minute-modern-card">
                                    <div className="minute-card-header">
                                        <div className="minute-card-date">
                                            <FaCalendarAlt className="minute-icon-large" />
                                            <span>{new Date(m.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div className="minute-card-timeago">
                                                <FaRegClock className="minute-icon-large" />
                                                <span>{timeAgo(m.createdAt)}</span>
                                            </div>
                                            <button
                                                className="delete-btn-simple"
                                                onClick={() => handleDelete(m._id)}
                                                title="Delete Minute"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="minute-card-divider"></div>

                                    <div className="minute-card-body">
                                        <FaStickyNote className="minute-icon-large summary-icon" />
                                        <p className="minute-summary-text">{m.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MinutesHistoryModal;
