import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaCloudUploadAlt, FaFilePdf, FaFileWord,
    FaFileExcel, FaFileImage, FaFileAlt, FaEllipsisV,
    FaDownload, FaTrash, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import { documentAPI, clientAPI } from '../../../utils/api';
import './ClientProjectDocuments.css';

const ClientProjectDocuments = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Menu & Modal State
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        fetchData();
        // Click outside to close menus
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [projectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projData, docData] = await Promise.all([
                clientAPI.getProjectDetails(projectId),
                documentAPI.getByProject(projectId)
            ]);

            if (projData.success) setProject(projData.project);
            if (docData.success) setDocuments(docData.documents);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load project data.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.size > 10 * 1024 * 1024) { // 10MB
                setError("File size exceeds 10MB limit.");
                return;
            }
            setFile(selected);
            setError(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const dropped = e.dataTransfer.files[0];
        if (dropped) {
            if (dropped.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit.");
                return;
            }
            setFile(dropped);
            setError(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('projectId', projectId);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('report', file);

            const res = await documentAPI.upload(formData);
            if (res.success) {
                // Reset form
                setTitle('');
                setDescription('');
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';

                // Update list
                setDocuments([res.document, ...documents]);
            } else {
                setError(res.message || "Upload failed");
            }
        } catch (err) {
            console.error("Upload Error:", err);
            setError("Error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        try {
            const res = await documentAPI.delete(deleteModal._id);
            if (res.success) {
                setDocuments(documents.filter(d => d._id !== deleteModal._id));
                setDeleteModal(null);
            } else {
                alert(res.message || "Delete failed");
            }
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Error trying to delete document.");
        }
    };

    const getFileIcon = (mimeType, fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return <div className="file-icon-box pdf"><FaFilePdf /></div>;
        if (['doc', 'docx'].includes(ext)) return <div className="file-icon-box doc"><FaFileWord /></div>;
        if (['xls', 'xlsx'].includes(ext)) return <div className="file-icon-box doc"><FaFileExcel /></div>;
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <div className="file-icon-box img"><FaFileImage /></div>;
        return <div className="file-icon-box"><FaFileAlt /></div>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    if (loading && !project) return <div className="client-docs-container">Loading...</div>;

    return (
        <div className="client-docs-container">
            <button className="back-btn" onClick={() => navigate('/client/projects')}>
                <FaArrowLeft /> Back to Project
            </button>
            <div className="client-docs-header">
                <h1 className="client-docs-title">Client Documents</h1>
                <p className="client-docs-subtitle">{project?.name || 'Loading Project...'}</p>
            </div>

            {/* Upload Section */}
            <div className="upload-section">
                <h3 className="section-title">Upload Document</h3>
                <form onSubmit={handleUpload}>
                    <div className="upload-form-grid">
                        <div className="form-group">
                            <label>Title <span className="required-mark">*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Architectural Plan, Site Invoice"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description (optional)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Add short context if needed"
                                rows="1"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div
                            className={`drop-zone ${file ? 'has-file' : ''}`}
                            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden-input"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.xls,.xlsx"
                            />
                            {file ? (
                                <div className="selected-file-preview">
                                    <FaFileAlt /> {file.name}
                                    <button
                                        type="button"
                                        className="remove-file-btn"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : (
                                <div className="drop-content">
                                    <FaCloudUploadAlt className="upload-icon" />
                                    <span>Choose file or drag & drop</span>
                                    <span className="file-types">PDF, JPG, PNG, DOCX (Max 10MB)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

                    <button type="submit" className="submit-btn" disabled={uploading || !file || !title}>
                        {uploading ? "Uploading..." : "Upload Document"}
                    </button>
                </form>
            </div>

            {/* Document List */}
            <div className="documents-list-section">
                <h3 className="section-title">Uploaded Documents</h3>
                <div className="documents-grid">
                    {documents.map(doc => (
                        <div key={doc._id} className="document-card">
                            {getFileIcon(doc.fileType, doc.fileName)}
                            <div className="doc-info">
                                <h4 className="doc-title" title={doc.title}>{doc.title}</h4>
                                <div className="doc-meta">
                                    <span>{formatDate(doc.uploadedAt)}</span>
                                    <span>•</span>
                                    <span>{doc.uploadedBy?.fullName || "Unknown"}</span>
                                </div>
                            </div>

                            <div className="doc-actions" onClick={e => e.stopPropagation()}>
                                <button
                                    className="action-menu-btn"
                                    onClick={() => setActiveMenu(activeMenu === doc._id ? null : doc._id)}
                                >
                                    <FaEllipsisV />
                                </button>
                                {activeMenu === doc._id && (
                                    <div className="action-dropdown">
                                        <a
                                            href={`${documentAPI.BASE_URL || 'http://localhost:5000'}${doc.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="dropdown-item"
                                            download
                                            onClick={() => setActiveMenu(null)}
                                        >
                                            <FaDownload /> Download
                                        </a>


                                        {(
                                            <>
                                                <button
                                                    className="dropdown-item delete"
                                                    onClick={() => { setDeleteModal(doc); setActiveMenu(null); }}
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {documents.length === 0 && (
                        <div className="no-docs-message" style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                            No documents uploaded yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}


            {deleteModal && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <FaExclamationTriangle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
                        <h3>Delete Document?</h3>
                        <p style={{ color: '#64748b', margin: '1rem 0' }}>
                            Are you sure you want to delete "{deleteModal.title}"?
                            <br />
                            <span style={{ fontSize: '0.9rem' }}>This action cannot be undone.</span>
                        </p>
                        <div className="confirm-actions">
                            <button className="btn-cancel" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="btn-delete" onClick={handleDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientProjectDocuments;
