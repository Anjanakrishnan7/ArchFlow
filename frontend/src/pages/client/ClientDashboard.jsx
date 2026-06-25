import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from "../../context/AuthContext";
import { clientAPI } from "../../utils/api";
import "./ClientDashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const ClientDashboard = () => {
    const { user } = useAuth();


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalProjects: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            onHold: 0,
            paymentRequests: 0,
            projectUpdates: 0
        }
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await clientAPI.getDashboardStats();
                if (data.success) {
                    setDashboardData(data);
                }
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const { stats } = dashboardData;

    // Derived stats for display
    const statCards = [
        { title: "Total Projects", value: stats.totalProjects },
        { title: "Project Updates", value: stats.projectUpdates },
        { title: "Payment Request", value: stats.paymentRequests }
    ];

    const chartData = {
        labels: ['Completed', 'In-progress', 'Pending', 'On-hold'],
        datasets: [
            {
                data: [stats.completed, stats.inProgress, stats.pending, stats.onHold],
                backgroundColor: [
                    '#10b981', // Completed - Green
                    '#3b82f6', // In-progress - Blue
                    '#e5e7eb', // Pending - Light Gray
                    '#ef4444'  // On-hold - Red
                ],
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const chartOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
                position: 'right',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    color: '#6b7280'
                }
            }
        },
        maintainAspectRatio: false
    };

    if (loading) return <div className="client-dashboard-container">Loading...</div>;
    if (error) return <div className="client-dashboard-container">Error: {error}</div>;

    return (
        <div className="client-dashboard-container">
            {/* Header */}
            <div className="client-welcome-section">
                <h1 className="client-welcome-title dashboard-title-role">
                    <span className="client-role-accent">Client</span> <span className="dashboard-text">Dashboard</span>
                </h1>
            </div>

            <div className="client-dashboard-grid">
                {/* 1. Stat Cards Row */}
                <div className="client-stats-row">
                    {statCards.map((stat, index) => (
                        <div key={index} className="client-stat-card">
                            <div className="client-stat-info">
                                <span className="client-stat-value">{stat.value}</span>
                                <span className="client-stat-title">{stat.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Project Status Overview (Chart) */}
                <div className="client-content-card client-card-chart">
                    <h2 className="client-card-header">Project Status Overview</h2>
                    <div className="chart-container-wrapper">
                        <Doughnut data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* 3. Quick Status Summary */}
                <div className="client-content-card client-card-summary">
                    <h2 className="client-card-header">Quick Status Summary</h2>
                    <div className="status-summary-list">
                        <div className="status-item status-green">
                            <span className="status-label">
                                <span className="status-dot"></span> Completed
                            </span>
                            <span className="status-count">{stats.completed}</span>
                        </div>
                        <div className="status-item status-blue">
                            <span className="status-label">
                                <span className="status-dot"></span> In Progress
                            </span>
                            <span className="status-count">{stats.inProgress}</span>
                        </div>
                        <div className="status-item status-grey">
                            <span className="status-label">
                                <span className="status-dot"></span> Pending
                            </span>
                            <span className="status-count">{stats.pending}</span>
                        </div>
                        <div className="status-item status-amber">
                            <span className="status-label">
                                <span className="status-dot"></span> On-hold
                            </span>
                            <span className="status-count">{stats.onHold}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClientDashboard;
