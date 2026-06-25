import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { staffAPI } from '../../utils/api';
import './StaffDashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const StaffDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await staffAPI.getDashboardStats();
                if (response.success) {
                    setStats(response.stats);
                } else {
                    setError('Failed to load dashboard data');
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Something went wrong. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);


    // Chart Data
    const pieData = stats ? {
        labels: ['In Progress', 'Pending', 'Completed'],
        datasets: [
            {
                data: [
                    stats.statusDistribution.inProgress,
                    stats.statusDistribution.pending,
                    stats.statusDistribution.completed,
                ],
                backgroundColor: [
                    '#3b82f6', // Blue
                    '#94a3b8', // Grey (was Yellow/Orange #f59e0b)
                    '#22c55e', // Green
                ],
                borderColor: [
                    '#ffffff',
                    '#ffffff',
                    '#ffffff',
                ],
                borderWidth: 2,
            },
        ],
    } : null;

    const pieOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    if (loading) {
        return <div className="dashboard-loading">Loading Dashboard Stats...</div>;
    }

    if (error) {
        return <div className="dashboard-error">{error}</div>;
    }

    if (!stats) return null;

    return (
        <div className="staff-dashboard-container">
            {/* 1. Header Area */}
            <div className="dashboard-header">
                <h1 className="staff-welcome-title dashboard-title-role">
                    <span className="staff-role-accent">Staff</span> <span className="dashboard-text">Dashboard</span>
                </h1>
            </div>

            {/* 2. Metrics Cards Section */}
            <div className="metrics-section">
                <div className="metric-card">
                    <span className="metric-title">Total Projects</span>
                    <span className="metric-value">{stats.totalProjects}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-title">Ongoing Tasks</span>
                    <span className="metric-value">{stats.ongoingTasks}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-title">Total Tasks</span>
                    <span className="metric-value">{stats.totalTasks}</span>
                </div>
            </div>

            {/* 3. Lower Section Layout */}
            <div className="dashboard-lower-section">
                {/* LEFT Column: Task Status Overview (Pie Chart) */}
                <div className="lower-card">
                    <h3 className="section-title">Task Status Overview</h3>
                    <div className="pie-chart-container" style={{ height: '250px' }}>
                        <Pie data={pieData} options={pieOptions} />
                    </div>
                </div>

                {/* RIGHT Column: Quick Status Summary */}
                <div className="lower-card">
                    <h3 className="section-title">Quick Status Summary</h3>
                    <div className="status-summary-list">
                        <div className="status-item status-blue">
                            <span className="status-label">
                                <span className="status-dot"></span> In Progress
                            </span>
                            <span className="status-count">{stats.statusDistribution.inProgress}</span>
                        </div>
                        <div className="status-item status-grey">
                            <span className="status-label">
                                <span className="status-dot"></span> Pending
                            </span>
                            <span className="status-count">{stats.statusDistribution.pending}</span>
                        </div>
                        <div className="status-item status-green">
                            <span className="status-label">
                                <span className="status-dot"></span> Completed
                            </span>
                            <span className="status-count">{stats.statusDistribution.completed}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
