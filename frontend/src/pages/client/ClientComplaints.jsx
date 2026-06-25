import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaClock, FaCheckCircle, FaTimes, FaPaperPlane, FaImage, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { clientAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import './ClientComplaints.css';

const ClientComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: '',
        attachments: []
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchComplaints = useCallback(async () => {
        try {
            setLoading(true);
            const response = await clientAPI.getComplaints();
            if (response.success) {
                setComplaints(response.complaints);
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComplaints();

        const fetchProjects = async () => {
            try {
                const response = await clientAPI.getProjects();
                if (response.success) {
                    setProjects(response.projects);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, [fetchComplaints]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            attachments: Array.from(e.target.files)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.projectId) {
            toast.error('Please fill in all fields and select a project');
            return;
        }

        try {
            setSubmitting(true);

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('projectId', formData.projectId);

            formData.attachments.forEach(file => {
                submitData.append('complaintAttachments', file);
            });

            const response = await clientAPI.submitComplaint(submitData);
            if (response.success) {
                toast.success('Complaint submitted successfully');
                setIsModalOpen(false);
                setFormData({ title: '', description: '', projectId: '', attachments: [] });
                fetchComplaints(); // Refresh list
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            toast.error(error.message || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'PENDING';
            case 'resolved': return 'RESOLVED';
            default: return status.toUpperCase();
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent opening detail/image
        if (!window.confirm('Are you sure you want to delete this complaint?')) return;

        try {
            const response = await clientAPI.deleteComplaint(id);
            if (response.success) {
                toast.success('Complaint deleted successfully');
                fetchComplaints(); // Refresh list
            }
        } catch (error) {
            console.error('Error deleting complaint:', error);
            toast.error(error.message || 'Failed to delete complaint');
        }
    };

    return (
        <div className="complaints-container">
            {/* Header Area */}
            <div className="complaints-header">
                <h1 className="complaints-title">Client Complaints</h1>
                <button
                    className="send-complaint-btn"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus size={14} />
                    Send Complaint
                </button>
            </div>

            {/* Complaints Grid */}
            <div className="complaints-grid">
                {loading ? (
                    <div className="loading-state">Loading complaints...</div>
                ) : complaints.length === 0 ? (
                    <div className="empty-state">No complaints submitted yet.</div>
                ) : (
                    complaints.map((complaint) => (
                        <div key={complaint._id} className="complaint-card">
                            <button
                                className="delete-complaint-btn"
                                onClick={(e) => handleDelete(e, complaint._id)}
                                title="Delete Complaint"
                            >
                                <FaTrash size={12} />
                            </button>
                            <div className="complaint-thumbnail-placeholder">
                                <FaExclamationTriangle className="placeholder-icon" />
                            </div>

                            <div className="complaint-content">
                                <div>
                                    <div className="complaint-header-row">
                                        <h3 className="complaint-card-title">{complaint.title}</h3>
                                        {complaint.project && (
                                            <span className="complaint-project-badge">
                                                {complaint.project.name || 'Unknown'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="complaint-description">{complaint.description}</p>
                                </div>

                                <div className="complaint-footer">
                                    <div className="complaint-date">
                                        <FaClock size={12} />
                                        <span>Submitted on {formatDate(complaint.createdAt)}</span>
                                    </div>
                                    <span className={`status-badge status-${complaint.status}`}>
                                        {complaint.status === 'resolved' ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaCheckCircle size={10} /> RESOLVED
                                            </span>
                                        ) : getStatusText(complaint.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Send Complaint Modal */}
            {isModalOpen && (
                <div className="complaint-modal-overlay">
                    <div className="complaint-modal">
                        <div className="modal-header">
                            <h2>Send New Complaint</h2>
                            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="complaint-form">
                            <div className="form-group">
                                <label htmlFor="title">Subject / Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Briefly describe the issue"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="projectId">Project</label>
                                <select
                                    id="projectId"
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleChange}
                                    className="project-select"
                                    required
                                >
                                    <option value="">Select a project</option>
                                    {projects.map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Detailed Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="5"
                                    placeholder="Provide more details about the problem..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="attachments">Attachments (Optional)</label>
                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        id="attachments"
                                        name="attachments"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="file-input"
                                    />
                                    <div className="file-input-ui">
                                        <FaImage />
                                        <span>
                                            {formData.attachments.length > 0
                                                ? `${formData.attachments.length} files selected`
                                                : 'Choose pictures/files'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : (
                                        <>
                                            <FaPaperPlane size={14} />
                                            Send Complaint
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientComplaints;
