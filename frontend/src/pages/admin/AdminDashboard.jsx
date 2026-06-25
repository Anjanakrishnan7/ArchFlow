import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { dashboardAPI } from "../../utils/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./AdminDashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {

  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalStaff: 0,
    totalManagers: 0,
    totalProjects: 0,
    completedProjects: 0,
    pendingApprovals: 0,
    totalComplaints: 0,
    totalReports: 0,
  });

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Use the centralized Axios instance which handles Authorization
      const data = await dashboardAPI.getStats();

      if (data.success) {
        setStats({
          totalManagers: data.totalManagers || 0,
          totalStaff: data.totalStaff || 0,
          totalClients: data.totalClients || 0,
          totalProjects: data.totalProjects || 0,
          completedProjects: 0,
          pendingApprovals: 0,
          totalComplaints: 0,
          totalReports: 0,
        });
      } else {
        console.error("Failed to fetch stats:", data.message);
        // Reset to initial state on soft failure
        setStats(prev => ({
          ...prev,
          totalManagers: 0,
          totalStaff: 0,
          totalClients: 0,
          totalProjects: 0
        }));
      }

    } catch (error) {
      console.error("Error loading dashboard:", error);
      showToast?.("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Managers",
      value: stats.totalManagers,
      onClick: () => navigate("/admin/managers"),
    },
    {
      title: "Total Staff",
      value: stats.totalStaff,
      onClick: () => navigate("/admin/staff-list"),
    },
    {
      title: "Total Clients",
      value: stats.totalClients,
      onClick: () => navigate("/admin/client-list"),
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
      onClick: () => navigate("/admin/projects"),
    },
  ];

  const chartData = {
    labels: ["Managers", "Staff", "Clients"],
    datasets: [
      {
        data: [stats.totalManagers, stats.totalStaff, stats.totalClients],
        backgroundColor: ["#4f46e5", "#10b981", "#0ea5e9"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#6b7280",
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      {loading ? (
        <div className="loading-state">Loading dashboard...</div>
      ) : (
        <div className="admin-dashboard-content">
          {/* Top Row: 4 Stats Cards */}
          <div className="stats-grid">
            {cards.map((card) => (
              <div
                key={card.title}
                className="stat-card"
                onClick={card.onClick}
              >
                <div className="stat-content">
                  <div className="stat-title">{card.title}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row: User Distribution Chart */}
          <div className="chart-section">
            <h2 className="chart-title">User Distribution</h2>
            <div className="chart-container">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
