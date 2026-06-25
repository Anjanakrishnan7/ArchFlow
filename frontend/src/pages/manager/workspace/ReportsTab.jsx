import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaCalendarCheck, FaImage, FaUserEdit, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from "../../../context/AuthContext";
import { managerAPI, clientAPI, BASE_URL } from '../../../utils/api';
import "./ReportsTab.css";
import MonthlyReportModal from './MonthlyReportModal';

const ReportsTab = ({ projectId }) => {
    const { showToast } = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { user } = useAuth();

    const fetchReports = async () => {
        try {
            setLoading(true);
            let data;
            if (user?.role === 'manager') {
                data = await managerAPI.getMonthlyReports(projectId);
                setUserRole('manager');
            } else {
                data = await clientAPI.getMonthlyReports(projectId);
                setUserRole('client');
            }
            setReports(data.reports || []);
        } catch (err) {
            console.error("Failed to fetch reports", err);
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchReports();
    }, [projectId, showToast]);

    const handleReportSubmit = async (pid, formData) => {
        try {
            await managerAPI.addMonthlyReport(pid, formData);
            showToast('Report submitted successfully', 'success');
            fetchReports(); // Refresh the list
        } catch (error) {
            console.error("Error submitting report:", error);
            showToast(error.message || 'Failed to submit report', 'error');
            throw error;
        }
    };

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

    if (loading) return <div className="loading-state">Loading reports...</div>;

    return (
        <div className="reports-tab">
            <div className="tab-header">
                <div className="header-info">
                    <h3>Monthly Reports</h3>
                    <p>Track project progress and issues monthly</p>
                </div>
                {userRole === 'manager' && (
                    <button className="btn-add-report" onClick={() => setIsModalOpen(true)}>
                        <FaPlus /> Create Monthly Report
                    </button>
                )}
            </div>

            <div className="reports-timeline">
                {Object.keys(groupedReports).length === 0 ? (
                    <div className="empty-state">
                        <FaFileAlt size={48} color="#cbd5e1" />
                        <p>No monthly reports submitted yet.</p>
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

            <MonthlyReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
                onSubmit={handleReportSubmit}
            />
        </div>
    );
};

export default ReportsTab;
