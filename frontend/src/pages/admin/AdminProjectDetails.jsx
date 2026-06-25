import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaFileAlt,
    FaInfoCircle
} from "react-icons/fa";
import { BASE_URL, adminAPI } from "../../utils/api";
import "./AdminProjects.css";

const AdminProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await adminAPI.getProjectDetails(id);
                if (response.success && response.project) {
                    setProject(response.project);
                } else {
                    setError("Project not found or failed to load");
                }
            } catch (err) {
                console.error("Error connecting to server:", err);
                setError(err.response?.data?.message || err.message || "Error connecting to server");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, token]);

    const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

    if (loading) return <div className="loading-container"><div className="loader"></div><p>Loading project details...</p></div>;
    if (error) return <div className="error-message-container"><FaInfoCircle /> {error}</div>;
    if (!project) return <div className="error-message-container"><FaInfoCircle /> Project not found</div>;

    const getStatusClass = (status) => {
        const s = status?.toLowerCase();
        if (s === 'ongoing') return 'status-ongoing';
        if (s === 'completed') return 'status-completed';
        if (s === 'pending') return 'status-pending';
        return 'status-default';
    };

    return (
        <div className="admin-project-details-page">
            <div className="project-main-card">
                <div className="project-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '30px' }}>
                    <div className="header-left">
                        <button onClick={() => navigate('/admin/projects')} className="btn-back-nav" style={{ marginBottom: '20px' }}>
                            <FaArrowLeft /> Back to Projects
                        </button>
                        <div className="header-title-area">
                            <h1 style={{ margin: 0, fontSize: '32px' }}>{project.name}</h1>
                        </div>
                        <p className="project-subtitle" style={{ marginTop: '8px' }}>
                            {project.type} Building Project
                        </p>
                    </div>
                    <button onClick={() => navigate(`/admin/projects/${id}/reports`)} className="btn-view-reports-nav">
                        <FaFileAlt /> View Reports
                    </button>
                </div>

                <div className="project-card-grid">
                    <div className="details-info-section">
                        <div className="info-group">
                            <div className="info-item">
                                <div className="info-content">
                                    <label>Client</label>
                                    <span>{project.client}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-content">
                                    <label>Manager</label>
                                    <span>{project.assignedManager?.fullName || 'Not assigned'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-group">
                            <div className="info-item">
                                <div className="info-content">
                                    <label>Location</label>
                                    <span>{project.location || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-content">
                                    <label>Status</label>
                                    <span className={`project-status-badge ${getStatusClass(project.status)}`}>
                                        {project.status || 'Ongoing'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="info-group duration-row">
                            <div className="info-item">
                                <div className="info-content">
                                    <label>Duration</label>
                                    <span>
                                        {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB') : 'N/A'}
                                        {' → '}
                                        {project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="financial-summary-section">
                        <div className="financial-card">
                            <h3>Financial Summary</h3>
                            <div className="financial-rows">
                                <div className="fin-row">
                                    <span className="fin-label">Total Budget</span>
                                    <span className="fin-value budget-main">{formatCurrency(project.budget)}</span>
                                </div>
                                <div className="fin-row">
                                    <span className="fin-label">Amount Paid</span>
                                    <span className="fin-value paid-main">{formatCurrency(project.paid)}</span>
                                </div>
                                <div className="fin-row total-row">
                                    <span className="fin-label">Remaining Balance</span>
                                    <span className="fin-value remaining-main">
                                        {formatCurrency((project.budget || 0) - (project.paid || 0))}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProjectDetails;
