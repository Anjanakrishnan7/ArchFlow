import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaMapMarkerAlt,
    FaUsers,
    FaCalendarAlt,
    FaEllipsisV,
    FaUser,
    FaArrowLeft,
    FaFileAlt
} from 'react-icons/fa';
import api, { BASE_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './ProjectWorkspace.css';

// Import tab components


import TasksSection from './workspace/work/TasksSection';
import MilestonesSection from './workspace/work/MilestonesSection';
import MinutesTab from './workspace/MinutesTab';
import ReportsTab from './workspace/ReportsTab';
import TeamTab from './workspace/TeamTab';
import UpdatesTab from './workspace/UpdatesTab';
import ProjectDocumentsModal from './workspace/ProjectDocumentsModal';
import ClientDetailsModal from './workspace/ClientDetailsModal';

const ProjectWorkspace = () => {
    const { id, activeTab: routeTab } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    // Remove local state for activeTab since it's now derived or controlled by URL, 
    // but generic `activeTab` variable is useful for the switch.

    const activeTab = routeTab || 'schedule'; // Default to schedule
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/manager/projects/${id}/details`);

            if (data.success) {
                setProject(data.project);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const tabs = [
        { id: 'schedule', label: 'Project Schedule' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'updates', label: 'Project Updates' },
        { id: 'minutes', label: 'Minutes' },
        { id: 'reports', label: 'Reports' },
        { id: 'team', label: 'Team' }
    ];


    const renderTabContent = () => {
        switch (activeTab) {
            case 'tasks':
                return <TasksSection projectId={id} />;
            case 'schedule':
            case 'milestones': // handle legacy or alternative URL just in case
                return <MilestonesSection projectId={id} onUpdate={fetchProjectDetails} />;
            case 'updates':
                return <UpdatesTab projectId={id} />;
            case 'minutes':
                return <MinutesTab projectId={id} />;
            case 'reports':
                return <ReportsTab projectId={id} />;
            case 'team':
                return <TeamTab projectId={id} />;
            default:
                return <TasksSection projectId={id} />;
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="error-message">
                <h2>Project not found</h2>
            </div>
        );
    }

    return (
        <div className="project-workspace">
            {/* Project Header */}
            <div className="project-header">
                <div className="project-header-top">
                    <div className="project-title-section">
                        <button
                            className="back-btn"
                            onClick={() => navigate(user?.role === 'staff' ? '/staff/project-schedule' : '/manager/projects')}
                            title="Back to Projects"
                        >
                            <FaArrowLeft /> Back to Projects
                        </button>
                        <h1>{project.name}</h1>
                        <div className="project-meta">
                            <div className="meta-item">
                                <span className={`status-badge-inline ${project.status?.toLowerCase()}`}>
                                    {project.status || 'Pending'}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span>|</span>
                            </div>
                            {project.location && (
                                <div className="meta-item">
                                    <FaMapMarkerAlt />
                                    <span>{project.location}</span>
                                </div>
                            )}
                            <div className="meta-item">
                                <FaCalendarAlt />
                                <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                            </div>
                            <div className="meta-item">
                                <FaUsers />
                                <span>{project.teamCount || 0} Team Members</span>
                            </div>
                            {project.type && (
                                <div className="meta-item">
                                    <span>• {project.type}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="project-menu">
                        <button
                            className="btn-primary"
                            onClick={() => setShowClientModal(true)}
                            title="View Client Details"
                        >
                            <FaUser />
                            <span>Client Details</span>
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => setShowDocsModal(true)}
                            title="View Client Documents"
                        >
                            <FaFileAlt />
                            <span>Client Documents</span>
                        </button>
                    </div>
                </div>

                {/* Large Progress Bar */}
                <div className="large-progress-section">
                    <div className="large-progress-label">
                        <span>Overall Progress</span>
                        <span className="large-progress-percentage">
                            {Math.round(project.progress || 0)}%
                        </span>
                    </div>
                    <div className="large-progress-bar">
                        <div
                            className="large-progress-fill"
                            style={{ width: `${project.progress || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => navigate(`/manager/project/${id}/${tab.id}`)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {renderTabContent()}
            </div>

            {/* Client Documents Modal */}
            {showDocsModal && (
                <ProjectDocumentsModal
                    project={project}
                    onClose={() => setShowDocsModal(false)}
                />
            )}

            {showClientModal && (
                <ClientDetailsModal
                    client={project.clientId}
                    onClose={() => setShowClientModal(false)}
                />
            )}
        </div>
    );
};

export default ProjectWorkspace;
