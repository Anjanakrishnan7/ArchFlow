import React, { useState, useEffect } from 'react';
import { FaTimes, FaFileAlt, FaDownload, FaCalendarAlt, FaInbox } from 'react-icons/fa';
import { documentAPI, BASE_URL } from '../../../utils/api';
import './ProjectDocumentsModal.css';

const ProjectDocumentsModal = ({ project, onClose }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, [project]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const projectId = project._id || project.id;
            const data = await documentAPI.getByProject(projectId);
            if (data.success) {
                setDocuments(data.documents);
            } else {
                setError(data.message || "Failed to fetch documents");
            }
        } catch (err) {
            console.error("Error fetching documents:", err);
            setError("Error occurred while loading documents");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        const cleanPath = url.replace(/\\/g, '/');
        return `${BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content project-docs-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-left">
                        <h2>Client Documents</h2>
                    </div>
                    <button className="close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body custom-scrollbar">
                    {loading ? (
                        <div className="loading-docs">
                            <div className="spinner"></div>
                            <span>Loading documents...</span>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : documents.length > 0 ? (
                        <div className="docs-list">
                            {documents.map((doc) => (
                                <div key={doc._id} className="doc-card">
                                    <div className="doc-info">
                                        <div className="doc-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="doc-details">
                                            <h3>{doc.title}</h3>
                                            <div className="doc-meta">

                                                <span>
                                                    <FaCalendarAlt /> {formatDate(doc.uploadedAt || doc.createdAt)}
                                                </span>
                                            </div>
                                            {doc.description && (
                                                <p className="doc-description">{doc.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="doc-actions">
                                        <a
                                            href={getFileUrl(doc.fileUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="view-doc-btn"
                                            title="View/Download Document"
                                        >
                                            <FaDownload /> View
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-docs">
                            <FaInbox />
                            <p>No documents uploaded by client yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDocumentsModal;
