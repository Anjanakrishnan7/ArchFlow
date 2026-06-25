import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL, adminAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { FaArrowLeft, FaFileAlt, FaCalendarCheck, FaExclamationTriangle } from 'react-icons/fa';
import "../manager/workspace/ReportsTab.css"; // Reusing manager styles
import "./AdminProjects.css"; // Base admin styles for nav buttons

const ProjectReports = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProjectReports(id);
            if (response.success) {
                setReports(response.reports || []);
            } else {
                setError(response.message || "Failed to load reports");
            }
        } catch (err) {
            console.error("Fetch reports error:", err);
            setError(err.response?.data?.message || err.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchReports();
    }, [id, token]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    const formatFullDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    // Group reports by Month
    const groupedReports = reports.reduce((acc, report) => {
        const month = formatDate(report.createdAt);
        if (!acc[month]) acc[month] = [];
        acc[month].push(report);
        return acc;
    }, {});

    if (loading) return (
        <div className="admin-project-details-page">
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading reports...</p>
            </div>
        </div>
    );

    return (
        <div className="admin-project-details-page">
            <div className="project-main-card">
                <div className="project-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 30px' }}>
                    <div className="header-info">
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Monthly Reports</h1>
                        <p style={{ margin: '4px 0 0', color: '#6c757d', fontSize: '14px' }}>Track project progress and issues monthly</p>
                    </div>
                    <button onClick={() => navigate(`/admin/project/${id}`)} className="btn-back-nav">
                        <FaArrowLeft /> Back to Project
                    </button>
                </div>

                <div className="reports-tab" style={{ padding: '30px' }}>
                    <div className="reports-timeline">
                        {Object.keys(groupedReports).length === 0 ? (
                            <div className="empty-state">
                                <FaFileAlt size={48} color="#cbd5e1" />
                                <p>No monthly reports submitted yet for this project.</p>
                            </div>
                        ) : (
                            Object.keys(groupedReports).map(month => (
                                <div key={month} className="month-section">
                                    <h4 className="month-title">{month}</h4>
                                    <div className="reports-list">
                                        {groupedReports[month].map(report => (
                                            <div key={report._id} className="report-card">
                                                <div className="report-badge">
                                                    <FaFileAlt />
                                                </div>
                                                <div className="report-main">
                                                    <div className="report-meta">
                                                        <span className="report-date">{formatFullDate(report.createdAt)}</span>
                                                        <span className="submitted-by" style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                            By: {report.submittedBy?.fullName || 'Manager'}
                                                        </span>
                                                    </div>

                                                    <div className="report-section">
                                                        <label>Summary</label>
                                                        <p>{report.summary}</p>
                                                    </div>

                                                    <div className="report-section">
                                                        <label className="error"><FaExclamationTriangle /> Issues/Blockers</label>
                                                        <p>{report.issuesOrBlockers || "Nil"}</p>
                                                    </div>

                                                    {report.workImages && report.workImages.length > 0 && (
                                                        <div className="report-section">
                                                            <label><FaFileAlt /> Attachments</label>
                                                            <div className="report-images-links">
                                                                {report.workImages.map((img, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={`${BASE_URL.replace('/api', '')}${img}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="file-link"
                                                                    >
                                                                        View Attachment {idx + 1}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectReports;

