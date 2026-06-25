import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes, FaFileAlt, FaCheck, FaBan, FaPaperPlane } from 'react-icons/fa';
import api, { getPhotoUrl } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import './UpdatesTab.css';

const UpdatesTab = ({ projectId }) => {
    const { user } = useAuth();
    const isStaff = user?.role === 'staff';
    const isManager = user?.role === 'manager' || user?.role === 'admin';

    const [updates, setUpdates] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMilestone, setSelectedMilestone] = useState('');
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUpdates();
        fetchMilestones();
    }, [projectId]);

    const fetchUpdates = async () => {
        try {
            const { data } = await api.get(`/manager/projects/${projectId}/updates`);
            if (data.success) {
                setUpdates(data.updates);
            }
        } catch (err) {
            console.error('Error fetching updates:', err);
            setError('Failed to load updates');
        } finally {
            setLoading(false);
        }
    };

    const fetchMilestones = async () => {
        try {
            const { data } = await api.get(`/manager/projects/${projectId}/milestones`);
            if (data.success) {
                setMilestones(data.milestones);
            }
        } catch (err) {
            console.error('Error fetching milestones:', err);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (selectedMilestone) formData.append('milestoneId', selectedMilestone);

            files.forEach(file => {
                formData.append('updateImage', file);
            });

            const { data } = await api.post(`/staff/projects/${projectId}/updates`, formData);
            if (data.success) {
                // Reset form
                setTitle('');
                setDescription('');
                setSelectedMilestone('');
                setFiles([]);
                fetchUpdates();
            }
        } catch (err) {
            console.error('Error submitting update:', err);
            setError(err.response?.data?.message || 'Failed to submit update');
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="updates-tab">
            {isStaff && (
                <div className="update-form-section">
                    <h3>Submit Project Update</h3>
                    <form onSubmit={handleSubmit} className="project-update-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Update Title <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Excavation Completed"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Milestone (Optional)</label>
                                <select
                                    value={selectedMilestone}
                                    onChange={(e) => setSelectedMilestone(e.target.value)}
                                >
                                    <option value="">Select Milestone</option>
                                    {milestones.map(m => (
                                        <option key={m._id} value={m._id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description of Work Completed <span className="required">*</span></label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Details of the work performed..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Attachments (Images, PDF, Documents)</label>
                            <div className="file-upload-zone">
                                <input
                                    type="file"
                                    id="project-update-files"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden-input"
                                />
                                <label htmlFor="project-update-files" className="upload-label">
                                    <FaCloudUploadAlt />
                                    <span>{files.length > 0 ? `${files.length} files selected` : 'Click to upload files'}</span>
                                </label>
                            </div>
                            {files.length > 0 && (
                                <div className="file-preview-list">
                                    {files.map((f, i) => (
                                        <div key={i} className="file-preview-item">
                                            <FaFileAlt /> <span>{f.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && <div className="form-error">{error}</div>}

                        <button type="submit" className="submit-update-btn" disabled={submitting}>
                            {submitting ? 'Submitting...' : <><FaPaperPlane /> Submit Update</>}
                        </button>
                    </form>
                </div>
            )}

            <div className="updates-list-section">
                <h3>Project Updates History</h3>
                <div className="updates-chronological-list">
                    {updates.length === 0 ? (
                        <div className="no-data">No updates submitted yet.</div>
                    ) : (
                        updates.map((update) => (
                            <div key={update._id} className="update-card">
                                <div className="update-card-header">
                                    <div className="staff-info">
                                        <div className="staff-details">
                                            <h4>{update.title}</h4>
                                            <p>Submitted by {update.staffId?.fullName} • {new Date(update.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="update-card-body">
                                    <p className="description">{update.description}</p>

                                    {update.milestoneId && (
                                        <div className="linked-milestone">
                                            <strong>Milestone:</strong> {update.milestoneId.title}
                                        </div>
                                    )}

                                    {update.images && update.images.length > 0 && (
                                        <div className="attachments-section">
                                            <h5>Attachments:</h5>
                                            <div className="attachments-grid">
                                                {update.images.map((img, idx) => (
                                                    <a key={idx} href={getPhotoUrl(img)} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                                        <FaFileAlt /> {img.split('\\').pop().split('/').pop()}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>


                                <div className="client-feedback-section">
                                    <h5>Client Feedback:</h5>
                                    <p className={update.feedback?.message ? 'feedback-text' : 'no-feedback'}>
                                        {update.feedback?.message || 'no feedback provided by client'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdatesTab;
