import React, { useState, useEffect, useRef } from 'react';
import {
    FaTimes, FaCloudUploadAlt, FaFilePdf, FaFileWord,
    FaFileExcel, FaFileImage, FaFileAlt, FaDownload,
    FaTrash, FaSync, FaExclamationTriangle
} from 'react-icons/fa';
import { documentAPI } from "../../../utils/api";
import "./ProjectDocumentsModal.css";

const ProjectDocumentsModal = ({ project, onClose }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Delete State
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        if (project) {
            fetchDocuments();
        }
    }, [project]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await documentAPI.getByProject(project._id);
            if (data.success) {
                setDocuments(data.documents);
            }
        } catch (err) {
            console.error("Error fetching documents:", err);
            setError("Failed to load documents.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.size > 10 * 1024 * 1024) {
                alert("File size exceeds 10MB");
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
                alert("File size exceeds 10MB");
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
            formData.append('projectId', project._id);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('report', file);

            const res = await documentAPI.upload(formData);
            if (res.success) {
                setTitle('');
                setDescription('');
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                // Add to list immediately
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

    const handleDelete = async (docId) => {
        try {
            const res = await documentAPI.delete(docId);
            if (res.success) {
                setDocuments(documents.filter(d => d._id !== docId));
                setDeleteConfirm(null);
            } else {
                alert(res.message || "Delete failed");
            }
        } catch (err) {
            alert("Error deleting document");
        }
    };



    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return <div className="doc-icon-small pdf"><FaFilePdf /></div>;
        if (['doc', 'docx'].includes(ext)) return <div className="doc-icon-small doc"><FaFileWord /></div>;
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <div className="doc-icon-small img"><FaFileImage /></div>;
        return <div className="doc-icon-small"><FaFileAlt /></div>;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="doc-modal-content" onClick={e => e.stopPropagation()}>
                <div className="doc-modal-header">
                    <div>
                        <span className="doc-modal-title">Project Documents</span>
                        <span className="doc-project-name">- {project.name}</span>
                    </div>
                    <button className="close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="doc-modal-body">
                    {/* Compact Upload Form */}
                    <div className="compact-upload-form">
                        <form onSubmit={handleUpload}>
                            <div className="upload-form-grid">
                                {/* Left: Inputs */}
                                <div className="compact-inputs-col">
                                    <input
                                        type="text"
                                        className="compact-input"
                                        placeholder="Document Title *"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        className="compact-textarea"
                                        placeholder="Description (optional)"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows="2"
                                    />
                                    <div className="form-actions-row" style={{ marginTop: 'auto', justifyContent: 'flex-start', width: '100%' }}>
                                        {error ? <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</span> : <span></span>}
                                        <button type="submit" className="btn-upload-compact" disabled={uploading || !file || !title}>
                                            {uploading ? "Uploading..." : "Upload Document"}
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Drop Zone */}
                                <div
                                    className="compact-drop-zone"
                                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                                    />
                                    {file ? (
                                        <div className="selected-file-compact">
                                            <FaFileAlt />
                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{file.name}</span>
                                            <button type="button" className="remove-file-mini" onClick={e => { e.stopPropagation(); setFile(null); }}>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="drop-content-wrapper">
                                            <FaCloudUploadAlt style={{ fontSize: '1.5rem', color: '#94a3b8' }} />
                                            <span className="drop-text-compact">Click to Upload</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Document List */}
                    <div className="doc-list-section">
                        <h4 className="doc-list-header">Uploaded Documents</h4>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading...</div>
                        ) : documents.length > 0 ? (
                            <div className="doc-list-grid">
                                {documents.map(doc => (
                                    <div key={doc._id} className="doc-card-compact">
                                        {getFileIcon(doc.fileName)}
                                        <div className="doc-info-compact">
                                            <a
                                                href={`${documentAPI.BASE_URL || 'http://localhost:5000'}${doc.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="doc-title-link"
                                                title={doc.title}
                                            >
                                                {doc.title}
                                            </a>
                                            <div className="doc-meta-compact">
                                                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="doc-actions-compact">
                                            {/* Download */}
                                            <a
                                                href={`${documentAPI.BASE_URL || 'http://localhost:5000'}${doc.fileUrl}`}
                                                download
                                                className="action-btn-icon"
                                                title="Download"
                                            >
                                                <FaDownload />
                                            </a>

                                            {/* Delete */}
                                            <button
                                                className="action-btn-icon delete"
                                                title="Delete"
                                                onClick={() => setDeleteConfirm(doc)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                No documents uploaded yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={e => e.stopPropagation()}>
                    <div className="doc-modal-content" style={{ width: '90%', maxWidth: '400px', height: 'auto', textAlign: 'center', padding: '2rem' }}>
                        <FaExclamationTriangle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 1rem' }}>Delete Document?</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete "{deleteConfirm.title}"?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{ padding: '0.5rem 1rem', border: 'none', background: '#f1f5f9', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm._id)}
                                style={{ padding: '0.5rem 1rem', border: 'none', background: '#ef4444', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDocumentsModal;
