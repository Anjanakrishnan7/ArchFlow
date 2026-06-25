import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaProjectDiagram, FaChevronRight, FaPlus, FaTimes, FaDownload } from 'react-icons/fa';
import api, { managerAPI, BASE_URL } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import "./ManagerComplaints.css";
import AddTaskModal from './workspace/work/AddTaskModal';


const ManagerComplaints = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // State for Add Task Modal popup
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [taskPreFillData, setTaskPreFillData] = useState(null);
    const [activeProjectId, setActiveProjectId] = useState(null);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await managerAPI.getComplaints();
            if (response.success) {
                setComplaints(response.complaints);
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
            showToast('Failed to load complaints', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleStatusUpdate = async (complaintId, newStatus) => {
        try {
            const response = await managerAPI.updateComplaintStatus(complaintId, newStatus);
            if (response.success) {
                setComplaints(complaints.map(c =>
                    c._id === complaintId ? response.complaint : c
                ));
                showToast(`Complaint marked as ${newStatus}`, 'success');
                if (selectedComplaint?._id === complaintId) {
                    setSelectedComplaint({ ...selectedComplaint, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Failed to update status', 'error');
        }
    };

    const handleCreateTask = (complaint) => {
        if (!complaint.project?._id) {
            showToast('Complaint must be linked to a project to create a task', 'error');
            return;
        }

        setTaskPreFillData({
            title: complaint.title,
            description: complaint.description,
            category: 'Complaint'
        });
        setActiveProjectId(complaint.project._id);
        setShowAddTaskModal(true);
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesFilter = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.project && c.project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.submittedBy && c.submittedBy.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved': return 'success';
            case 'pending': return 'danger';
            default: return 'default';
        }
    };

    return (
        <div className="manager-complaints-container">
            <div className="page-header">
                <h1>Complaints Management</h1>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="complaints-list">
                {loading ? (
                    <div className="no-data">Loading complaints...</div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="no-data">No complaints found.</div>
                ) : (
                    filteredComplaints.map(complaint => (
                        <div key={complaint._id} className="complaint-list-item">
                            <div className="item-main-info">
                                <div className="title-row">
                                    <h4 className="complaint-title">{complaint.title}</h4>
                                </div>
                                <div className="meta-row">
                                    <div className="meta-item">
                                        <FaUser className="meta-icon" />
                                        <span>{complaint.submittedBy?.fullName || 'Unknown'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <FaProjectDiagram className="meta-icon" />
                                        <span>{complaint.project?.name || 'No Project'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <FaCalendarAlt className="meta-icon" />
                                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="item-actions">
                                <span
                                    className={`status-badge ${getStatusColor(complaint.status)} clickable`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newStatus = complaint.status === 'pending' ? 'resolved' : 'pending';
                                        handleStatusUpdate(complaint._id, newStatus);
                                    }}
                                    title="Click to toggle status"
                                >
                                    {complaint.status}
                                </span>
                                <button
                                    className="details-btn"
                                    onClick={() => setSelectedComplaint(complaint)}
                                >
                                    <span>View Details</span>
                                    <FaChevronRight />
                                </button>
                                <button
                                    className="create-task-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreateTask(complaint);
                                    }}
                                    title="Create task from this complaint"
                                >
                                    <span>Create Task</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedComplaint && (
                <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
                    <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Complaint Details</h3>
                            <button className="modal-close-btn" onClick={() => setSelectedComplaint(null)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <h4 className="section-title">Issue Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Subject</label>
                                        <p className="detail-value">{selectedComplaint.title}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Status</label>
                                        <select
                                            value={selectedComplaint.status}
                                            onChange={(e) => handleStatusUpdate(selectedComplaint._id, e.target.value)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                    <div className="detail-item">
                                        <label>Project</label>
                                        <p className="detail-value">{selectedComplaint.project?.name || 'No Project'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Reported By</label>
                                        <p className="detail-value">{selectedComplaint.submittedBy?.fullName || 'Unknown'}</p>
                                    </div>
                                    <div className="detail-item full-width">
                                        <label>Detailed Description</label>
                                        <p className="detail-description">{selectedComplaint.description}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                                <div className="detail-section">
                                    <h4 className="section-title">Attachments</h4>
                                    <div className="attachments-grid">
                                        {selectedComplaint.attachments.map((url, idx) => (
                                            <div key={idx} className="attachment-card" onClick={() => window.open(`${BASE_URL}${url}`, '_blank')}>
                                                <img
                                                    src={`${BASE_URL}${url}`}
                                                    alt={`Attachment ${idx + 1}`}
                                                    className="attachment-img"
                                                />
                                                <div className="attachment-overlay">
                                                    <span>View Full Image</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            backgroundColor: '#f9fafb'
                        }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedComplaint(null)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontWeight: '500'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Task Modal Popup */}
            <AddTaskModal
                show={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                onSuccess={() => {
                    // Success toast is handled by AddTaskModal
                }}
                projectId={activeProjectId}
                preFillData={taskPreFillData}
            />
        </div>
    );
};

export default ManagerComplaints;

