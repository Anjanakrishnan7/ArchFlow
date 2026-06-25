import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaUser, FaProjectDiagram, FaClock, FaTimes, FaChevronRight } from 'react-icons/fa';
import { adminAPI, BASE_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './AdminComplaints.css';

const AdminComplaints = () => {
    const { token } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getComplaints();
            if (response.success) {
                setComplaints(response.complaints);
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [token]);

    const filteredComplaints = complaints.filter(c => {
        const matchesFilter = filter === 'All' || c.status.toLowerCase() === filter.toLowerCase();
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.project?.name && c.project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.submittedBy && c.submittedBy.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
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
        <div className="admin-complaints-container">
            <div className="page-header">
                <h1>Complaints Management</h1>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="complaints-list">
                {loading ? (
                    <div className="loading-text">Loading complaints...</div>
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
                                        <FaClock className="meta-icon" />
                                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="item-actions">
                                <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                                    {complaint.status}
                                </span>
                                <button
                                    className="details-btn"
                                    onClick={() => setSelectedComplaint(complaint)}
                                >
                                    <span>View Details</span>
                                    <FaChevronRight />
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaints;
