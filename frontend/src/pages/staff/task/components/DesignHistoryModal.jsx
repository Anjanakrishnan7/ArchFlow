import React, { useState, useEffect } from 'react';
import { FaTimes, FaFileAlt, FaStickyNote, FaClipboardList, FaTrash } from 'react-icons/fa';
import { staffAPI, taskAPI, BASE_URL } from '../../../../utils/api';
import '../staffTask.css';

const DesignHistoryModal = ({ isOpen, onClose, taskId }) => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        if (isOpen && taskId) {
            fetchUpdates();
        }
    }, [isOpen, taskId]);

    const fetchUpdates = async () => {
        try {
            setLoading(true);
            const data = await staffAPI.getTaskUpdates(taskId);
            // Sort updates descending by date (latest first)
            const sortedUpdates = (data.updates || []).sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt);
                const dateB = new Date(b.date || b.createdAt);
                return dateB - dateA;
            });
            setUpdates(sortedUpdates);
        } catch (error) {
            console.error("Failed to load updates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (updateId) => {
        if (window.confirm("Are you sure you want to delete this update?")) {
            try {
                await taskAPI.deleteUpdate(updateId);
                alert("Update deleted successfully");
                fetchUpdates(); // Refresh the list
            } catch (error) {
                console.error("Failed to delete update:", error);
                alert("Failed to delete update. Please try again.");
            }
        }
    };

    const getImageUrl = (path) => {
        if (!path) return '';
        // Normalize backslashes to forward slashes
        let normalized = path.replace(/\\/g, '/');

        // Already a full URL
        if (normalized.startsWith('http')) return normalized;

        // If path contains 'uploads/', extract from there onwards
        const uploadsIndex = normalized.indexOf('uploads/');
        if (uploadsIndex !== -1) {
            return `${BASE_URL}/${normalized.substring(uploadsIndex)}`;
        }

        // If it's just a filename or relative path without 'uploads/' prefix,
        // we might need to prefix it, but 'uploads/' should be there based on server config.
        return `${BASE_URL}/${normalized}`;
    };

    const openImage = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    if (!isOpen) return null;

    const getUpdateTitle = (item) => {
        if (item.type === 'work-update') {
            const type = item.data?.type || 'general';
            if (type === 'general') return "Others";
            return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        if (item.type === 'document') return "Document Added";
        if (item.type === 'minutes') return "Minutes Added";
        if (item.type === 'report') return "Report Submitted";
        return "Task Activity";
    };

    const renderCardContent = (item) => {
        const { type, data } = item;

        switch (type) {
            case 'document': {
                const hasDocFile = !!data.filePath;
                const docFileName = data.fileName || (data.filePath ? data.filePath.split('/').pop().split('\\').pop() : 'Document');
                return (
                    <div style={{ width: '100%' }}>
                        <div className="update-header">
                            {new Date(item.date).toLocaleString()}
                        </div>
                        <div className="update-row">
                            <button className="delete-btn" title="Delete Update" onClick={() => handleDelete(data._id)}>
                                <FaTrash />
                            </button>
                            <div className="left-content">
                                <h4>{getUpdateTitle(item)}</h4>
                                <div className="update-description">
                                    <strong>Title:</strong> {data.title}
                                </div>
                            </div>
                            <div className="right-content">
                                {hasDocFile && (
                                    <>
                                        <div className="files-title">Files:</div>
                                        <div className="update-files-list">
                                            <a
                                                href={getImageUrl(data.filePath)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="update-file-link"
                                            >
                                                <FaFileAlt style={{ marginRight: '8px' }} />
                                                {docFileName}
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
            case 'report': {
                const hasReportFiles = data.workImages && data.workImages.length > 0;
                return (
                    <div style={{ width: '100%' }}>
                        <div className="update-header">
                            {new Date(item.date).toLocaleString()}
                        </div>
                        <div className="update-row">
                            <button className="delete-btn" title="Delete Update" onClick={() => handleDelete(data._id)}>
                                <FaTrash />
                            </button>
                            <div className="left-content">
                                <h4>{getUpdateTitle(item)}</h4>
                                <div className="update-description">
                                    <strong>Summary:</strong> {data.summary || data.title}
                                    {data.issuesOrBlockers && (
                                        <>
                                            <br />
                                            <strong>Issues:</strong> {data.issuesOrBlockers}
                                        </>
                                    )}
                                    {data.content && <p>{data.content}</p>}
                                </div>
                            </div>
                            <div className="right-content">
                                {hasReportFiles && (
                                    <>
                                        <div className="files-title">Files:</div>
                                        <div className="update-files-list">
                                            {data.workImages.map((img, idx) => {
                                                const imgUrl = getImageUrl(img);
                                                const fileName = img.split('/').pop().split('\\').pop();
                                                return (
                                                    <a
                                                        key={idx}
                                                        href={imgUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="update-file-link"
                                                    >
                                                        <FaFileAlt style={{ marginRight: '8px' }} />
                                                        {fileName || `Report File ${idx + 1}`}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
            case 'work-update': {
                const hasImages = data.images && data.images.length > 0;
                return (
                    <div style={{ width: '100%' }}>
                        <div className="update-header">
                            {new Date(item.date).toLocaleString()}
                        </div>
                        <div className="update-row">
                            <button className="delete-btn" title="Delete Update" onClick={() => handleDelete(data._id)}>
                                <FaTrash />
                            </button>
                            <div className="left-content">
                                <h4>{getUpdateTitle(item)}</h4>
                                <div className="update-description">
                                    <strong>Description:</strong> {data.description}
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <p style={{ margin: 0 }}>
                                        <strong>Feedback:</strong> {data.feedback?.message || (typeof data.feedback === 'string' ? data.feedback : "No feedback provided yet")}
                                        <span className={data.feedback?.seen ? "seen-badge" : "unseen-badge"}>
                                            {data.feedback?.seen ? "Seen" : "Not Seen"}
                                        </span>
                                    </p>
                                    {data.feedback?.seen && data.feedback?.seenAt && (
                                        <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                            Seen on: {new Date(data.feedback.seenAt).toLocaleString()}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="right-content">
                                {hasImages && (
                                    <>
                                        <div className="files-title">Files:</div>
                                        <div className="update-files-list">
                                            {data.images.map((img, idx) => {
                                                const imgUrl = getImageUrl(img);
                                                const fileName = img.split('/').pop().split('\\').pop();
                                                return (
                                                    <a
                                                        key={idx}
                                                        href={imgUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="update-file-link"
                                                    >
                                                        <FaFileAlt style={{ marginRight: '8px' }} />
                                                        {fileName || `File ${idx + 1}`}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
            default:
                return <p>Activity details not available.</p>;
        }
    };

    const filteredUpdates = updates.filter(item => {
        if (filterType === 'all') return true;
        if (item.type === 'work-update') {
            return item.data?.type === filterType;
        }
        return item.type === filterType;
    });

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                <div className="modal-header-with-filter">
                    <h3 className="modal-title">Task Activity Log</h3>
                    <div className="filter-container">
                        <label htmlFor="update-type-filter">Filter by Type:</label>
                        <select
                            id="update-type-filter"
                            className="filter-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Updates</option>
                            <option value="site-visit">Site Visit</option>
                            <option value="work-progress">Work Progress</option>
                            <option value="documents">Documents Submission</option>
                            <option value="design">Design Work</option>
                            <option value="material-check">Material Check</option>
                            <option value="general">Others</option>
                        </select>
                    </div>
                </div>

                <div className="updates-modal-container">
                    <div className="timeline-list">
                        {loading ? (
                            <div className="loading-text">Loading updates...</div>
                        ) : filteredUpdates.length === 0 ? (
                            <p className="no-data-text">
                                {filterType === 'all' ? "No activity recorded yet." : "No updates found for this category."}
                            </p>
                        ) : (
                            filteredUpdates.map((item, index) => (
                                <div key={index} className="timeline-item">
                                    {renderCardContent(item)}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Fullscreen Image Popup */}
                {selectedImage && (
                    <div className="image-viewer" onClick={closeImage}>
                        <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
                            <img src={selectedImage} alt="Preview" />
                            <div className="image-viewer-close" onClick={closeImage}><FaTimes /></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignHistoryModal;
