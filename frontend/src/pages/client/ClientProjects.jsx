import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaUsers, FaClipboardList, FaPhone, FaTimes, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import "./ClientProjects.css";

import ProjectDocumentsModal from "./project/ProjectDocumentsModal"; // New Compact Modal
import ProjectUpdatesModal from "./project/ProjectUpdatesModal";
import MonthlyReportsModal from "./project/MonthlyReportsModal";
import defaultProjectIcon from "../../assets/images/projects/default_project_icon.png";
import { clientAPI } from "../../utils/api";

const ClientProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedManager, setSelectedManager] = useState(null);
    const [minutes, setMinutes] = useState([]);
    const [selectedMinutesProject, setSelectedMinutesProject] = useState(null);
    const [fetchingMinutes, setFetchingMinutes] = useState(false);
    const [selectedTeamProject, setSelectedTeamProject] = useState(null);
    const [fetchingTeam, setFetchingTeam] = useState(false);
    const [selectedDocumentProject, setSelectedDocumentProject] = useState(null); // Re-enabled
    const [selectedUpdatesProject, setSelectedUpdatesProject] = useState(null);
    const [selectedReportsProject, setSelectedReportsProject] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await clientAPI.getProjects();
                if (data.success) {
                    setProjects(data.projects);
                } else {
                    setError("Failed to fetch projects");
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Error loading projects");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);



    // Fetch minutes for a specific project
    const handleViewMinutes = async (project) => {
        console.log("Fetching minutes for project:", project._id);
        try {
            setFetchingMinutes(true);
            setSelectedMinutesProject(project);
            const data = await clientAPI.getProjectMinutes(project._id);
            if (data.success) {
                setMinutes(data.minutes);
                console.log("Minutes fetched:", data.minutes);
            } else {
                console.error("Failed to fetch minutes");
            }
        } catch (err) {
            console.error("Error fetching minutes:", err);
        } finally {
            setFetchingMinutes(false);
        }
    };

    const handleViewTeam = async (project) => {
        try {
            setFetchingTeam(true);
            setSelectedTeamProject(project);
            const data = await clientAPI.getProjectTeam(project._id);
            if (data.success) {
                setTeamMembers(data.team);
            } else {
                console.error("Failed to fetch team members");
            }
        } catch (err) {
            console.error("Error fetching team members:", err);
        } finally {
            setFetchingTeam(false);
        }
    };

    if (loading) return <div className="client-projects-container">Loading projects...</div>;
    if (error) return <div className="client-projects-container">Error: {error}</div>;

    return (
        <div className="client-projects-container">
            {/* Page Header */}
            <div className="client-projects-header">
                <h1 className="client-projects-title">My Projects</h1>
                <p className="client-projects-subtitle">View details and monitor progress of your construction projects.</p>
            </div>

            {/* Projects Grid */}
            <div className="client-projects-grid">
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <div key={project._id} className="client-project-card">
                            {/* 1. Project Cover Image */}
                            <div className="project-image-wrapper">
                                <img
                                    src={defaultProjectIcon}
                                    alt="Project Logo"
                                    className="project-cover-image"
                                />
                            </div>

                            {/* 2. Project Info Section */}
                            <div className="project-info-section">
                                <div className="project-name-row">
                                    <h2 className="project-name">{project.name}</h2>
                                    <span className="project-type-badge">{project.type}</span>
                                </div>
                                <div className="project-status-badge-row">
                                    <span className={`project-status-badge status-${project.status}`}>
                                        {project.status === 'on-hold' ? 'On-hold' :
                                            project.status === 'ongoing' ? 'In Progress' :
                                                project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                    </span>
                                </div>
                                <div className="project-details-row">
                                    <div className="detail-item">
                                        <span className="detail-label">Location</span>
                                        <span className="detail-value">{project.location}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Budget</span>
                                        <span className="detail-value">₹{project.budget?.toLocaleString('en-IN') || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Action Buttons Section */}
                            <div className="project-actions">
                                <button
                                    className="btn-action primary-btn"
                                    onClick={() => navigate(`/client/project/${project._id}/tasks`)}
                                >
                                    View Tasks & Status
                                </button>
                                <button
                                    className="btn-action secondary-btn"
                                    onClick={() => setSelectedUpdatesProject(project)}
                                >
                                    Project Updates
                                </button>
                                <button
                                    className="btn-action secondary-btn"
                                    onClick={() => setSelectedReportsProject(project)}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    Monthly Reports
                                </button>
                            </div>

                            {/* 4. Bottom Action Row (Documents, Team, Minutes) */}
                            <div className="project-status-icons">
                                <div
                                    className="status-icon-box blue"
                                    title="Upload Document"
                                    onClick={() => setSelectedDocumentProject(project)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FaFileAlt />
                                </div>
                                <div
                                    className="status-icon-box black"
                                    title="Team"
                                    onClick={() => handleViewTeam(project)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FaUsers />
                                </div>
                                <div
                                    className="status-icon-box yellow"
                                    title="Minutes History"
                                    onClick={() => handleViewMinutes(project)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FaClipboardList title="Minutes History" />
                                </div>
                                <div
                                    className="status-icon-box green"
                                    title="Manager Details"
                                    onClick={() => setSelectedManager(project.managerId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FaPhone title="Manager Details" style={{ transform: 'scaleX(-1)' }} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-projects-message">No projects found.</div>
                )}
            </div>

            {/* Manager Details Modal */}
            {selectedManager && (
                <div className="modal-overlay" onClick={() => setSelectedManager(null)}>
                    <div className="modal-content info-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ margin: 0 }}>Manager Contact</h2>
                            <button className="close-modal" onClick={() => setSelectedManager(null)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="staff-info-card" style={{ minHeight: 'auto', marginBottom: 0 }}>
                                <span className="staff-info-header">MANAGER DETAILS</span>
                                <div className="staff-info-divider"></div>
                                <div className="staff-info-grid">
                                    <div className="staff-info-row">
                                        <span className="info-label">Name</span>
                                        <span className="info-value">: {selectedManager.fullName}</span>
                                    </div>
                                    <div className="staff-info-row">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">: {selectedManager.email}</span>
                                    </div>
                                    <div className="staff-info-row">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">: {selectedManager.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="team-actions" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
                                {selectedManager.phone && (
                                    <>
                                        <a href={`tel:${selectedManager.phone}`} title="Call manager" className="team-action-link phone">
                                            <FaPhone style={{ transform: 'scaleX(-1)' }} />
                                        </a>
                                        <a href={`https://wa.me/${selectedManager.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp manager" className="team-action-link whatsapp">
                                            <FaWhatsapp />
                                        </a>
                                    </>
                                )}
                                <a href={`mailto:${selectedManager.email}`} title="Email manager" className="team-action-link mail">
                                    <FaEnvelope />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Minutes History Modal */}
            {selectedMinutesProject && (
                <div className="modal-overlay" onClick={() => setSelectedMinutesProject(null)}>
                    <div className="modal-content minutes-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0 }}>Minutes History</h2>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedMinutesProject.name}</span>
                            </div>
                            <button className="close-modal" onClick={() => setSelectedMinutesProject(null)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {fetchingMinutes ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading minutes...</div>
                            ) : minutes.length > 0 ? (
                                <div className="minutes-list">
                                    {minutes.map((minute) => (
                                        <div key={minute._id} className="minute-item-card">
                                            <div className="minute-item-header">
                                                <span className="minute-date">
                                                    {new Date(minute.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                <span className="minute-staff">By: {minute.createdBy?.fullName || 'Manager'}</span>
                                            </div>
                                            <h3 className="minute-title">Site Meeting Note</h3>
                                            <div className="minute-full-summary">
                                                {minute.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-minutes-message">
                                    <FaClipboardList size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No minutes recorded for this project yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Project Team Modal */}
            {selectedTeamProject && (
                <div className="modal-overlay" onClick={() => setSelectedTeamProject(null)}>
                    <div className="modal-content team-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0 }}>Project Team Members</h2>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedTeamProject.name}</span>
                            </div>
                            <button className="close-modal" onClick={() => setSelectedTeamProject(null)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {fetchingTeam ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading team members...</div>
                            ) : teamMembers.length > 0 ? (
                                <div className="team-table-container">
                                    <table className="team-table">
                                        <thead>
                                            <tr>
                                                <th>Role</th>
                                                <th>Type</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teamMembers.map((member) => (
                                                <tr key={member._id} className={member.isManager ? 'manager-row' : ''}>
                                                    <td>
                                                        <span className={`role-badge ${member.isManager ? 'manager' : 'staff'}`}>
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td>{member.type || 'N/A'}</td>
                                                    <td>
                                                        <div className="member-name-cell">
                                                            {member.fullName}
                                                        </div>
                                                    </td>
                                                    <td className="member-email-cell">{member.email}</td>
                                                    <td>{member.phone || 'N/A'}</td>
                                                    <td>
                                                        <div className="team-actions">
                                                            {member.phone && (
                                                                <>
                                                                    <a href={`tel:${member.phone}`} title="Call member" className="team-action-link phone">
                                                                        <FaPhone style={{ transform: 'scaleX(-1)' }} />
                                                                    </a>
                                                                    <a href={`https://wa.me/${member.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp member" className="team-action-link whatsapp">
                                                                        <FaWhatsapp />
                                                                    </a>
                                                                </>
                                                            )}
                                                            <a href={`mailto:${member.email}`} title="Email member" className="team-action-link mail">
                                                                <FaEnvelope />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-team-message">
                                    <FaUsers size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No team assigned for this project yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Document Modal (New) */}
            {selectedDocumentProject && (
                <ProjectDocumentsModal
                    project={selectedDocumentProject}
                    onClose={() => setSelectedDocumentProject(null)}
                />
            )}



            {/* Project Updates Modal */}
            {selectedUpdatesProject && (
                <ProjectUpdatesModal
                    project={selectedUpdatesProject}
                    onClose={() => setSelectedUpdatesProject(null)}
                />
            )}

            {/* Monthly Reports Modal */}
            {selectedReportsProject && (
                <MonthlyReportsModal
                    project={selectedReportsProject}
                    onClose={() => setSelectedReportsProject(null)}
                />
            )}
        </div>
    );
};

export default ClientProjects;
