import React, { useState, useEffect } from 'react';
import { FaTasks, FaClock, FaMoneyBillWave, FaUsers, FaChartLine } from 'react-icons/fa';
import { BASE_URL } from '../../../utils/api';
import { FiActivity, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { useAuth } from '../../../context/AuthContext';
import "./OverviewTab.css";

const OverviewTab = ({ projectId }) => {
    const { user } = useAuth();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/api/manager/projects/${projectId}/overview`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                setOverview(data.overview);
            }
        } catch (error) {
            console.error('Error fetching overview:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    if (!overview) {
        return <div>No overview data available</div>;
    }

    const { project, recentTasks, upcomingDeadlines, pendingPayments, todayUpdates } = overview;

    return (
        <div className="overview-tab">
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe' }}>
                        <FaTasks style={{ color: '#3b82f6' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{recentTasks?.length || 0}</div>
                        <div className="stat-label">Recent Tasks</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7' }}>
                        <FaClock style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{upcomingDeadlines?.length || 0}</div>
                        <div className="stat-label">Upcoming Deadlines</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fee2e2' }}>
                        <FaMoneyBillWave style={{ color: '#ef4444' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{pendingPayments?.length || 0}</div>
                        <div className="stat-label">Pending Payments</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#d1fae5' }}>
                        <FaUsers style={{ color: '#10b981' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{project?.teamCount || 0}</div>
                        <div className="stat-label">Team Members</div>
                    </div>
                </div>
            </div>

            {/* Today's Updates */}
            {todayUpdates && todayUpdates.length > 0 && (
                <div className="section-card">
                    <h3 className="section-title">Today's Updates</h3>
                    <div className="updates-list">
                        {todayUpdates.map(task => (
                            <div key={task._id} className="update-item">
                                <div className="update-content">
                                    <div className="update-title">{task.title}</div>
                                    <div className="update-meta">
                                        Updated by {task.assignedTo?.fullName || 'Unknown'}
                                    </div>
                                </div>
                                <span className={`status-badge ${task.status?.toLowerCase()}`}>
                                    {task.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Tasks */}
            <div className="section-card">
                <h3 className="section-title">Recent Tasks</h3>
                {recentTasks && recentTasks.length > 0 ? (
                    <div className="tasks-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Assigned To</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTasks.map(task => (
                                    <tr key={task._id}>
                                        <td>{task.title}</td>
                                        <td>{task.assignedTo?.fullName || 'Unassigned'}</td>
                                        <td>{formatDate(task.dueDate)}</td>
                                        <td>
                                            <span className={`status-badge ${task.status?.toLowerCase()}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-data">No recent tasks</p>
                )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="section-card">
                <h3 className="section-title">Upcoming Deadlines (Next 7 Days)</h3>
                {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                    <div className="deadlines-list">
                        {upcomingDeadlines.map(task => (
                            <div key={task._id} className="deadline-item">
                                <div className="deadline-content">
                                    <div className="deadline-title">{task.title}</div>
                                    <div className="deadline-meta">
                                        Assigned to: {task.assignedTo?.fullName || 'Unassigned'}
                                    </div>
                                </div>
                                <div className="deadline-date">
                                    <FaClock />
                                    <span>{formatDate(task.dueDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No upcoming deadlines</p>
                )}
            </div>

            {/* Pending Payments Summary */}
            {pendingPayments && pendingPayments.length > 0 && (
                <div className="section-card">
                    <h3 className="section-title">Pending Payments</h3>
                    <div className="payments-summary">
                        <div className="payment-total">
                            <span>Total Pending:</span>
                            <strong>
                                ₹{pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN')}
                            </strong>
                        </div>
                        <div className="payment-count">
                            {pendingPayments.length} payment request(s) pending approval
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;
