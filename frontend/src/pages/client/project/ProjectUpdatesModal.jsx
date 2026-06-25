import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaUser, FaFileAlt } from 'react-icons/fa';
import { clientAPI, taskAPI, BASE_URL } from '../../../utils/api';
import './ProjectUpdates.css';

const UPDATE_TYPES = [
    { label: "All Updates", value: "all" },
    { label: "Site Visit", value: "site-visit" },
    { label: "Work Progress", value: "work-progress" },
    { label: "Documents Submission", value: "documents" },
    { label: "Design Work", value: "design" },
    { label: "Material Check", value: "material-check" },
    { label: "Others", value: "general" }
];

const ProjectUpdatesModal = ({ project, onClose }) => {
    const [updates, setUpdates] = useState([]);
    const [filteredUpdates, setFilteredUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedUpdate, setSelectedUpdate] = useState(null);

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const projectId = project._id || project.id;
                const data = await clientAPI.getProjectUpdates(projectId);
                if (data.success) {
                    setUpdates(data.updates);
                    setFilteredUpdates(data.updates);
                }
            } catch (error) {
                console.error("Failed to fetch updates:", error);
            } finally {
                setLoading(false);
            }
        };

        if (project) {
            fetchUpdates();
        }
    }, [project]);

    useEffect(() => {
        if (filter === "all") {
            setFilteredUpdates(updates);
        } else {
            setFilteredUpdates(updates.filter(u => u.type === filter));
        }
    }, [filter, updates]);

    const getBadgeClass = (type) => {
        const map = {
            "site-visit": "badge-site-visit",
            "work-progress": "badge-work-progress",
            "documents": "badge-documents",
            "design": "badge-design",
            "material-check": "badge-material-check",
            "general": "badge-general"
        };
        return map[type] || "badge-general";
    };

    const getTypeLabel = (type) => {
        const found = UPDATE_TYPES.find(t => t.value === type);
        return found ? found.label : type.replace('-', ' ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    };

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `${BASE_URL}${finalPath}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content project-updates-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="header-left">
                        <h2>Project Activity Updates</h2>
                        <p className="project-subtitle">{project.name}</p>
                    </div>

                    {/* Filter Moved Here - Right Side */}
                    <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <select
                            className="updates-filter-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            {UPDATE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <button className="close-modal" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="modal-body custom-scrollbar">
                    {/* List */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading updates...</div>
                    ) : filteredUpdates.length > 0 ? (
                        <div className="updates-list">
                            {filteredUpdates.map(update => (
                                <div key={update._id} style={{ width: '100%' }}>
                                    <div className="update-header">
                                        {formatDate(update.createdAt)}
                                    </div>
                                    <div className="update-row">
                                        <div className="left-content">
                                            <div style={{ marginBottom: '10px' }}>
                                                <span className={`update-type-badge ${getBadgeClass(update.type)}`}>
                                                    {getTypeLabel(update.type)}
                                                </span>
                                            </div>

                                            <div className="update-content">
                                                <p className="update-description">
                                                    {update.description}
                                                </p>

                                                <div className="feedback-container">
                                                    <textarea
                                                        id={`feedback-${update._id}`}
                                                        className="feedback-textarea"
                                                        placeholder="Enter feedback (Optional)..."
                                                        defaultValue={update.feedback?.message || (typeof update.feedback === 'string' ? update.feedback : "")}
                                                        disabled={update.feedback?.seen}
                                                    />
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <button
                                                            className="card-ok-btn"
                                                            disabled={update.feedback?.seen}
                                                            onClick={async () => {
                                                                try {
                                                                    const feedbackMsg = document.getElementById(`feedback-${update._id}`).value;
                                                                    await taskAPI.markUpdateSeen(update._id, {
                                                                        seen: true,
                                                                        seenAt: new Date(),
                                                                        message: feedbackMsg
                                                                    });
                                                                    // Update local state to reflect 'Seen'
                                                                    setUpdates(prev => prev.map(u =>
                                                                        u._id === update._id
                                                                            ? { ...u, feedback: { ...u.feedback, seen: true, message: feedbackMsg } }
                                                                            : u
                                                                    ));

                                                                } catch (err) {
                                                                    console.error("Failed to mark as seen:", err);
                                                                }
                                                            }}
                                                        >
                                                            OK
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="right-content">
                                            {update.images && update.images.length > 0 && (
                                                <>
                                                    <div className="files-title">Files:</div>
                                                    <div className="update-files-list">
                                                        {update.images.map((img, idx) => {
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
                            ))}
                        </div>
                    ) : (
                        <div className="no-updates-message">No updates found for this category.</div>
                    )}
                </div>

                {/* Footer Removed - Actions are now per card */}
            </div>

        </div>
    );
};

export default ProjectUpdatesModal;
