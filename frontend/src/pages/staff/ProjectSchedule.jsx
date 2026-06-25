import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaMoneyBillWave, FaBriefcase } from 'react-icons/fa';
import api from '../../utils/api';
import MilestoneDetailsModal from './components/MilestoneDetailsModal';
import './ProjectSchedule.css';
import '../../styles/dashboard.css';

const ProjectSchedule = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProjectName, setSelectedProjectName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Assigned Projects (now includes milestones)
                const { data: projectsData } = await api.get('/staff/projects');

                if (!projectsData.success) {
                    throw new Error(projectsData.message || 'Failed to fetch projects');
                }

                setProjects(projectsData.projects);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load schedule data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="loading-spinner">Loading schedules...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="project-schedule-page">
            <header className="page-header">
                <h1>My Project Schedules & Milestones</h1>
            </header>

            <div className="projects-container">
                {projects.length === 0 ? (
                    <div className="no-data">No projects assigned yet.</div>
                ) : (
                    projects.map((project) => (
                        <div key={project._id} className="project-section-card">
                            {/* Project Details Header */}
                            <div className="project-details-header">
                                <div className="project-title-block">
                                    <h2>{project.name}</h2>
                                    <div className="project-meta">
                                        <span className="meta-item"><FaBriefcase /> {project.type}</span>
                                        <span className="meta-item"><FaMapMarkerAlt /> {project.location || 'N/A'}</span>
                                        <span className="meta-item budget"><FaMoneyBillWave /> ${project.budget?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>

                            </div>

                            {/* Milestones Table */}
                            <div className="schedule-table-container" style={{ marginTop: '0.5rem' }}>
                                <h3>Project Milestones</h3>
                                {project.milestones && project.milestones.length > 0 ? (
                                    <table className="schedule-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Dates</th>
                                                <th>Status</th>
                                                <th>Progress</th>
                                                <th>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.milestones.map((item) => (
                                                <tr key={item._id}>
                                                    <td className="task-title">
                                                        <strong>{item.title || item.name}</strong>
                                                    </td>
                                                    <td className="date-col">
                                                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="days-col">
                                                        <span className={`status-badge status-${item.status ? item.status.toLowerCase() : 'pending'}`}>
                                                            {item.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="progress-text">{item.progress || 0}%</span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn-view-action-like"
                                                            onClick={() => {
                                                                setSelectedMilestone(item);
                                                                setSelectedProjectName(project.name);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="no-schedules">No milestones found.</div>
                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>

            <MilestoneDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                milestone={selectedMilestone}
                projectName={selectedProjectName}
            />
        </div>
    );
};

export default ProjectSchedule;
