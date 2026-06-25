import React, { useState } from 'react';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import '../staffTask.css';

const WorkUpdateModal = ({ isOpen, onClose, taskId, onSubmit }) => {
    const [description, setDescription] = useState('');
    const [type, setType] = useState('work-progress');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
            setError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!type) {
            setError('Please select an update type.');
            return;
        }

        if (!description.trim()) {
            setError('Please describe today\'s progress/work performed.');
            return;
        }

        const formData = {
            description,
            type,
            images: files
        };

        onSubmit(taskId, formData);

        // Reset state
        setDescription('');
        setType('work-progress');
        setFiles([]);
        setError('');
    };

    const handleClose = () => {
        setDescription('');
        setType('work-progress');
        setFiles([]);
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={handleClose}>
                    <FaTimes />
                </button>
                <div className="modal-header-section">
                    <h3 className="modal-title">Add Update</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Update Type <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="type"
                            className="form-input"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        >
                            <option value="site-visit">Site Visit</option>
                            <option value="work-progress">Work Progress</option>
                            <option value="documents">Documents Submission</option>
                            <option value="design">Design Work</option>
                            <option value="material-check">Material Check</option>
                            <option value="general">Others</option>
                        </select>
                    </div>


                    <div className="form-group">
                        <label className="form-label">Description <span style={{ color: 'red' }}>*</span></label>
                        <textarea
                            className={`form-input ${error && !description ? 'input-error' : ''}`}
                            placeholder="Describe today's progress/work performed"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Images / Documents</label>
                        <div className="file-upload-wrapper">
                            <label htmlFor="update-file-upload" style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                                <FaCloudUploadAlt size={40} color={files.length > 0 ? "#4a90e2" : "#9ca3af"} />
                                <p style={{ margin: '12px 0 0', color: files.length > 0 ? '#374151' : '#6b7280', fontWeight: files.length > 0 ? 500 : 400 }}>
                                    {files.length > 0 ? `${files.length} files selected` : "Click to upload or drag and drop"}
                                </p>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>SVG, PNG, JPG or PDF</span>
                            </label>
                            <input
                                id="update-file-upload"
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept=".svg,.png,.jpg,.jpeg,.pdf"
                                multiple
                            />
                        </div>
                        {files.length > 0 && (
                            <div className="selected-files-list" style={{ marginTop: '8px' }}>
                                {files.map((f, i) => (
                                    <div key={i} style={{ fontSize: '12px', color: '#4b5563' }}>• {f.name}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-cancel" onClick={handleClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Submit Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkUpdateModal;
