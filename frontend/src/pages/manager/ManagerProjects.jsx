import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaEllipsisV, FaFolderOpen } from 'react-icons/fa';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import "./ManagerProjects.css";



const ManagerProjects = () => {

    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/manager/projects');

            if (data.success) {
                setProjects(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (projectId) => {
        navigate(`/manager/project/${projectId}`);
    };

    const handleStatusUpdate = async (e, projectId, newStatus) => {
        if (e) e.stopPropagation();
        try {
            const { data } = await api.patch(`/manager/projects/${projectId}/status`, { status: newStatus });
            if (data.success) {
                setProjects(prevProjects =>
                    prevProjects.map(p => p._id === projectId ? { ...p, status: newStatus } : p)
                );
                showToast(`Project status updated to ${newStatus}`, 'success');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Failed to update project status', 'error');
        } finally {
            setActiveMenu(null);
        }
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const toggleMenu = (e, projectId) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === projectId ? null : projectId);
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredProjects = projects.filter(project =>
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="manager-projects-container">
            <div className="projects-header">
                <h1>My Projects</h1>
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search projects by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredProjects.length === 0 ? (
                <div className="no-projects">
                    <FaFolderOpen />
                    <h3>No Projects Found</h3>
                    <p>You don't have any assigned projects yet.</p>
                </div>
            ) : (
                <div className="projects-grid">
                    {filteredProjects.map((project) => (
                        <div
                            key={project._id}
                            className="manager-project-card"
                            onClick={(e) => {
                                // Only navigate if the click was not on the menu or its children
                                if (e.target.closest('.project-menu-container')) return;
                                handleCardClick(project._id);
                            }}
                        >
                            <div className="project-card-header">
                                <div className="header-main-content">
                                    <h2 className="project-name">{project.name}</h2>
                                    {project.location && (
                                        <div className="project-location">
                                            <FaMapMarkerAlt className="location-icon" />
                                            <span>{project.location}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="project-menu-container">
                                    <button
                                        className="project-menu-btn"
                                        onClick={(e) => toggleMenu(e, project._id)}
                                    >
                                        <FaEllipsisV />
                                    </button>

                                    {activeMenu === project._id && (
                                        <div className="status-dropdown" onClick={(e) => e.stopPropagation()}>
                                            <div className="dropdown-header">Update Status</div>
                                            <div className="dropdown-options">
                                                {['pending', 'ongoing', 'completed', 'on-hold'].map((status) => (
                                                    <button
                                                        key={status}
                                                        className={`status-option ${status} ${project.status === status ? 'active' : ''}`}
                                                        onClick={(e) => handleStatusUpdate(e, project._id, status)}
                                                    >
                                                        {status.replace('-', ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="project-status-section">
                                <span className={`project-status-badge ${project.status?.toLowerCase() || 'pending'}`}>
                                    {project.status || 'Pending'}
                                </span>
                            </div>

                            <div className="project-progress-section">
                                <div className="progress-label">
                                    <span>Progress</span>
                                    <span className="progress-percentage">
                                        {project.progress || 0}%
                                    </span>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${project.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="project-dates">
                                <div className="date-item">
                                    <span className="date-label">Start Date</span>
                                    <span className="date-value">{formatDate(project.startDate)}</span>
                                </div>
                                <div className="date-item">
                                    <span className="date-label">End Date</span>
                                    <span className="date-value">{formatDate(project.endDate)}</span>
                                </div>
                            </div>

                            <div className="project-footer">
                                <div className="team-count">
                                    <FaUsers className="team-icon" />
                                    <span>{project.teamCount || 0} Team Members</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default ManagerProjects;
