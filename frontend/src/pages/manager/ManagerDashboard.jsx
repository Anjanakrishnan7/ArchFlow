import React, { useEffect, useState } from "react";
import {
    FaProjectDiagram,
    FaTasks,
    FaExclamationCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { managerAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import "./ManagerDashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const ManagerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProjects: 0,
        pendingTasks: 0,
        totalTasks: 0,
        upcomingDeadlines: 0,
        activeProjects: 0,
        totalStaff: 0,

        totalComplaints: 0,
        statusDistribution: {
            ongoing: 0,
            completed: 0,
            pending: 0,
            onHold: 0
        }
    });
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchStats = async () => {
        try {
            const data = await managerAPI.getDashboardStats();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-screen">Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title-role">
                    <span className="manager-role-accent">Manager</span> <span className="dashboard-text">Dashboard</span>
                </h1>
            </div>

            <div className="dashboard-grid">
                {/* Top Metrics Bar */}
                <div className="metrics-row">
                    <div className="metric-card">
                        <div className="metric-info">
                            <h3>{stats.totalProjects}</h3>
                            <p>Total Projects</p>
                        </div>
                        <div className="metric-icon">
                            <FaProjectDiagram />
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-info">
                            <h3>{stats.totalTasks}</h3>
                            <p>Total Tasks</p>
                        </div>
                        <div className="metric-icon">
                            <FaTasks />
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-info">
                            <h3>{stats.totalStaff}</h3>
                            <p>Total Staff</p>
                        </div>
                        <div className="metric-icon">
                            <FaTasks />
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-info">
                            <h3>{stats.totalComplaints}</h3>
                            <p>Total Complaints</p>
                        </div>
                        <div className="metric-icon">
                            <FaExclamationCircle />
                        </div>
                    </div>
                </div>

                {/* Lower Charts & Summary Section */}
                <div className="dashboard-card progress-summary-card">
                    <div className="chart-container">
                        <div className="chart-wrapper">
                            <Doughnut
                                data={{
                                    labels: ['Ongoing', 'Completed', 'Pending', 'On Hold'],
                                    datasets: [
                                        {
                                            data: stats.totalProjects > 0 ? [
                                                stats.statusDistribution?.ongoing || 0,
                                                stats.statusDistribution?.completed || 0,
                                                stats.statusDistribution?.pending || 0,
                                                stats.statusDistribution?.onHold || 0
                                            ] : [1],
                                            backgroundColor: stats.totalProjects > 0
                                                ? ['#4f46e5', '#10b981', '#6b7280', '#ef4444']
                                                : ['#e2e8f0'],
                                            borderWidth: 0,
                                            hoverOffset: stats.totalProjects > 0 ? 4 : 0
                                        },
                                    ],
                                }}
                                options={{
                                    cutout: '70%',
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            titleColor: '#1f2937',
                                            bodyColor: '#1f2937',
                                            borderColor: '#e5e7eb',
                                            borderWidth: 1,
                                            padding: 12,
                                            boxPadding: 4
                                        }
                                    },
                                    maintainAspectRatio: false
                                }}
                            />
                            <div className="chart-center-text">
                                <span className="total-value">{stats.totalProjects || 0}</span>
                                <span className="total-label">Total</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card quick-summary-card">
                    <h3 className="section-title">Quick Status Summary</h3>
                    <div className="status-summary-list">
                        <div className="status-item status-ongoing">
                            <span className="status-label">
                                <span className="status-dot"></span> Ongoing
                            </span>
                            <span className="status-count">{stats.statusDistribution?.ongoing || 0}</span>
                        </div>
                        <div className="status-item status-pending">
                            <span className="status-label">
                                <span className="status-dot"></span> Pending
                            </span>
                            <span className="status-count">{stats.statusDistribution?.pending || 0}</span>
                        </div>
                        <div className="status-item status-completed">
                            <span className="status-label">
                                <span className="status-dot"></span> Completed
                            </span>
                            <span className="status-count">{stats.statusDistribution?.completed || 0}</span>
                        </div>
                        <div className="status-item status-onhold">
                            <span className="status-label">
                                <span className="status-dot"></span> On Hold
                            </span>
                            <span className="status-count">{stats.statusDistribution?.onHold || 0}</span>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default ManagerDashboard;
