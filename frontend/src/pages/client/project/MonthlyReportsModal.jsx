import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaCalendarCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { clientAPI, BASE_URL } from '../../../utils/api';
import "../../manager/workspace/ReportsTab.css"; // Reuse styling

const MonthlyReportsModal = ({ project, onClose }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await clientAPI.getMonthlyReports(project._id);
            if (data.success) {
                setReports(data.reports || []);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (project?._id) fetchReports();
    }, [project?._id]);

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content minutes-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Monthly Reports</h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{project.name}</span>
                    </div>
                    <button className="close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading reports...</div>
                    ) : (
                        <div className="reports-timeline">
                            {Object.keys(groupedReports).length === 0 ? (
                                <div className="empty-state">
                                    <FaFileAlt size={48} color="#cbd5e1" />
                                    <p>No monthly reports available for this project yet.</p>
                                </div>
                            ) : (
                                Object.keys(groupedReports).map(month => (
                                    <div key={month} className="month-section">
                                        <h4 className="month-title"><FaCalendarCheck /> {month}</h4>
                                        <div className="reports-list">
                                            {groupedReports[month].map(report => (
                                                <div key={report._id} className="report-card">
                                                    <div className="report-badge">
                                                        <FaFileAlt />
                                                    </div>
                                                    <div className="report-main">
                                                        <div className="report-meta">
                                                            <span className="report-date">{formatFullDate(report.createdAt)}</span>
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
                                                                            href={`${BASE_URL}${img}`}
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthlyReportsModal;
