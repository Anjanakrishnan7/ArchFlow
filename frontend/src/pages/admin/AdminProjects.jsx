import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usersAPI, adminAPI } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import "./AdminProjects.css";

const AdminProjects = () => {
    // const { token } = useAuth(); // Token is not exposed by useAuth
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal States
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedManager, setSelectedManager] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchProjects();
        fetchManagers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProjects();
            if (response.success) {
                setProjects(response.projects);
            } else {
                setError(response.message || "Failed to fetch projects");
            }
        } catch (err) {
            console.error("Fetch projects error:", err);
            setError(err.response?.data?.message || err.message || "Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            // Use usersAPI to fetch managers by role
            // This uses /api/users/role/manager which returns an array of users
            const data = await usersAPI.getByRole('manager');

            if (Array.isArray(data)) {
                setManagers(data);
            } else if (data.success && data.users) {
                // Fallback in case we switch back to admin endpoint
                setManagers(data.users);
            } else {
                console.error("Unexpected response format for managers:", data);
            }
        } catch (err) {
            console.error("Error fetching managers:", err);
        }
    };

    const openAssignModal = (project) => {
        fetchManagers(); // Fetch fresh list when opening modal
        setSelectedProject(project);
        setSelectedManager(project.assignedManager?._id || "");
        setAssignModalVisible(true);
    };

    const closeAssignModal = () => {
        setAssignModalVisible(false);
        setSelectedProject(null);
        setSelectedManager("");
    };

    const handleAssignManager = async () => {
        if (!selectedManager) {
            showToast("Please select a manager", "error");
            return;
        }

        try {
            const response = await adminAPI.assignManager(selectedProject._id, selectedManager);
            if (response.success) {
                showToast("Manager assigned successfully", "success");
                closeAssignModal();
                fetchProjects();
            } else {
                showToast(response.message || "Failed to assign manager", "error");
            }
        } catch (err) {
            console.error("Assign manager error:", err);
            showToast("Error assigning manager", "error");
        }
    };

    const handleDeleteProject = async (projectId, projectName) => {
        if (window.confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) {
            try {
                const response = await adminAPI.deleteProject(projectId);
                if (response.success) {
                    showToast("Project deleted successfully", "success");
                    fetchProjects();
                } else {
                    showToast(response.message || "Failed to delete project", "error");
                }
            } catch (err) {
                console.error("Delete project error:", err);
                showToast("Error deleting project", "error");
            }
        }
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    // Filtering Logic
    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || project.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="loading">Loading projects...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-projects-container">
            {/* Header Section */}
            <div className="page-header-section">
                <h1 className="page-title">Projects (Admin)</h1>
                <Link to="/admin/add-project" className="btn-add-project">
                    + Add Project
                </Link>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Search by Project Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="status-filter"
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {/* Projects Table */}
            <div className="projects-table-wrapper">
                <table className="modern-projects-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Project Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Client</th>
                            <th>Manager</th>
                            <th>Budget</th>
                            <th>Paid</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project, index) => (
                                <tr key={project._id}>
                                    <td>{index + 1}</td>
                                    <td>{project.name}</td>
                                    <td>{project.type}</td>
                                    <td>{project.location || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${project.status?.toLowerCase()}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>{project.client}</td>
                                    <td>
                                        {project.assignedManager ? (
                                            <span className="manager-name">{project.assignedManager.fullName}</span>
                                        ) : (
                                            <span className="unassigned">Unassigned</span>
                                        )}
                                    </td>
                                    <td>{formatCurrency(project.budget)}</td>
                                    <td>{formatCurrency(project.paid)}</td>
                                    <td>
                                        <div className="action-buttons-row">
                                            <button
                                                type="button"
                                                className="btn-action btn-view-project"
                                                onClick={() => navigate(`/admin/project/${project._id}`)}
                                            >
                                                View Project
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-action btn-assign-manager"
                                                onClick={() => openAssignModal(project)}
                                            >
                                                Assign Manager
                                            </button>

                                            <div className="menu-container">
                                                <button
                                                    type="button"
                                                    className="btn-menu-trigger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === project._id ? null : project._id);
                                                    }}
                                                >
                                                    <FaEllipsisV />
                                                </button>

                                                {openMenuId === project._id && (
                                                    <div className={`dropdown-menu ${index === filteredProjects.length - 1 ? 'open-upwards' : ''}`} onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            type="button"
                                                            className="dropdown-item edit"
                                                            onClick={() => {
                                                                navigate(`/admin/edit-project/${project._id}`);
                                                                setOpenMenuId(null);
                                                            }}
                                                        >
                                                            <FaEdit /> Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="dropdown-item delete"
                                                            onClick={() => {
                                                                handleDeleteProject(project._id, project.name);
                                                                setOpenMenuId(null);
                                                            }}
                                                        >
                                                            <FaTrash /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="no-data">
                                    No projects found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assign Manager Modal */}
            {assignModalVisible && selectedProject && (
                <div className="modal-overlay">
                    <div className="modal-content assign-modal">
                        <div className="modal-header">
                            <h2>Assign Manager to {selectedProject.name}</h2>
                        </div>
                        <div className="modal-body">
                            <div className="current-manager-display" style={{ marginBottom: '15px' }}>
                                <label>Current Manager:</label>
                                <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>
                                    {selectedProject.assignedManager?.fullName || "Unassigned"}
                                </span>
                            </div>
                            <label>Select New Manager</label>
                            <select
                                value={selectedManager}
                                onChange={(e) => setSelectedManager(e.target.value)}
                                className="manager-dropdown"
                            >
                                <option value="">-- Select Manager --</option>
                                {managers
                                    .filter(mgr => mgr.isAvailable !== false || mgr._id === selectedProject?.assignedManager?._id)
                                    .map((mgr) => (
                                        <option key={mgr._id} value={mgr._id}>
                                            {mgr.fullName} {mgr.isAvailable === false ? '(Unavailable)' : ''}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeAssignModal}>
                                Cancel
                            </button>
                            <button className="btn-assign" onClick={handleAssignManager}>
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProjects;
