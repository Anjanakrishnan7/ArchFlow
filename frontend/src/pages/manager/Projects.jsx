import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./Projects.css";

const ManagerProjects = () => {
    const { token, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/api/manager/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects || data.data || []);
            } else {
                showToast(data.message || "Failed to fetch projects", "error");
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            showToast("Error connecting to server", "error");
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter((project) =>
        project.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProgressPercentage = (project) => {
        if (project.progress !== undefined) return project.progress;
        // Calculate based on status if no progress field
        switch (project.status) {
            case "Completed":
                return 100;
            case "Ongoing":
                return 60;
            case "Pending":
                return 25;
            default:
                return 0;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "ongoing":
                return "in-progress";
            case "completed":
                return "completed";
            case "pending":
                return "pending";
            case "delayed":
                return "delayed";
            default:
                return "pending";
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                Loading projects...
            </div>
        );
    }

    return (
        <div className="projects-page-container">
            {/* Header */}
            <div className="projects-header">
                <div className="header-left">
                    <div className="profile-badge">
                        {user?.name?.charAt(0).toUpperCase() || "CM"}
                    </div>
                    <div className="header-text">
                        <h1>Construction Manager — Projects</h1>
                        <p>Click a project card to open its Project Workspace</p>
                    </div>
                </div>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="search-projects"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn-new-project" onClick={() => navigate('/manager/projects/new')}>
                        + New Project
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="projects-grid">
                    {filteredProjects.map((project) => {
                        const progress = getProgressPercentage(project);
                        return (
                            <div
                                key={project._id}
                                className="project-card"
                                onClick={() => navigate(`/manager/project/${project._id}`)}
                            >
                                <div className="project-card-header">
                                    <div>
                                        <h3 className="project-title">{project.name}</h3>
                                        <p className="project-meta">
                                            {project.client?.fullName || project.client || "No Client"} • {project.location || "Location N/A"}
                                        </p>
                                    </div>
                                    <span className={`project-status-badge ${getStatusClass(project.status)}`}>
                                        {project.status || "Pending"}
                                    </span>
                                </div>

                                <div className="project-progress-section">
                                    <div className="progress-label-row">
                                        <span className="progress-label">Progress</span>
                                        <span className="progress-percentage">{progress}%</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="project-card-footer">
                                    <div className="project-dates">
                                        {formatDate(project.startDate)} <span className="arrow">→</span> {formatDate(project.endDate)}
                                    </div>
                                    <div className="project-team">
                                        Team: <span>{project.teamSize || project.assignedStaff?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <h3>No projects found</h3>
                    <p>Try adjusting your search or create a new project.</p>
                </div>
            )}
        </div>
    );
};

export default ManagerProjects;
