import React, { useState } from "react";
import { FaTimes, FaCloudUploadAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage } from "react-icons/fa";
import { documentAPI } from "../../../utils/api";
import "./DocumentUploadModal.css";

const DocumentUploadModal = ({ project, onClose, userRole }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) {
                alert("File size exceeds 10MB limit");
                e.target.value = "";
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append("projectId", project._id);
            formData.append("title", title);
            formData.append("description", description);
            formData.append("report", file);

            const res = await documentAPI.upload(formData);
            if (res.success) {
                alert("Document uploaded successfully");
                onClose();
            } else {
                setError(res.message || "Upload failed");
            }
        } catch (err) {
            console.error("Error uploading document:", err);
            setError("Error occurred during upload");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content doc-upload-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Upload Document</h2>
                    <button className="close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    <form className="upload-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Title <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Architectural Plan, Invoice"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief details (optional)"
                                    rows="1"
                                />
                            </div>
                        </div>

                        <div className="file-upload-zone">
                            <input
                                type="file"
                                id="document-file-input"
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.xlsx,.jpg,.png,.jpeg"
                                required
                                className="hidden-input"
                            />
                            <label htmlFor="document-file-input" className={`file-label ${file ? 'has-file' : ''}`}>
                                <FaCloudUploadAlt className="upload-icon" />
                                <span>{file ? file.name : "Choose file"}</span>
                            </label>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="upload-submit-btn"
                            disabled={loading || !file || !title}
                        >
                            {loading ? "Uploading..." : "Upload Document"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadModal;
