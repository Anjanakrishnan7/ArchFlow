import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaSearch, FaFilter, FaCalendarAlt, FaUser,
    FaCheckCircle, FaClock, FaExclamationTriangle, FaInfoCircle,
    FaArrowRight, FaCommentAlt, FaPaperclip, FaChevronRight, FaTimes, FaArrowLeft
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { clientAPI } from "../../../utils/api";
import "./ProjectTasks.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectTasks = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await clientAPI.getProjectDetails(id);
                if (data.success) {
                    setProject(data.project);
                    setTasks(data.tasks);
                    setMilestones(data.milestones);
                } else {
                    setError("Failed to fetch project details");
                }
            } catch (err) {
                console.error("Error fetching project details:", err);
                setError("Error loading project data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const filterStatus = statusFilter.toLowerCase();
            let matchesStatus = false;

            if (statusFilter === "All") {
                matchesStatus = true;
            } else if (filterStatus === "complaint") {
                matchesStatus = task.category?.toLowerCase() === "complaint" || task.status?.toLowerCase() === "complaint";
            } else {
                matchesStatus = task.status?.toLowerCase() === filterStatus;
            }

            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchTerm, statusFilter]);

    const chartData = useMemo(() => {
        const stats = {
            completed: tasks.filter(t => t.status.toLowerCase() === 'completed').length,
            inProgress: tasks.filter(t => t.status.toLowerCase() === 'in-progress').length,
            pending: tasks.filter(t => t.status.toLowerCase() === 'pending' || t.status.toLowerCase() === 'todo').length,
            delayed: tasks.filter(t => t.status.toLowerCase() === 'delayed').length,
        };

        return {
            labels: ['Completed', 'In Progress', 'Pending', 'Delayed'],
            datasets: [{
                data: [stats.completed, stats.inProgress, stats.pending, stats.delayed],
                backgroundColor: ['#22c55e', '#3b82f6', '#94a3b8', '#f59e0b'],
                borderWidth: 0,
            }]
        };
    }, [tasks]);

    if (loading) return <div className="tasks-status-container">Loading project data...</div>;
    if (error) return <div className="tasks-status-container">Error: {error}</div>;
    if (!project) return <div className="tasks-status-container">Project not found.</div>;

    return (
        <div className="tasks-status-container">
            {/* 1. Project Summary Header */}
            <div className="project-summary-card">
                <div className="summary-header">
                    <div className="project-title-area">
                        <button
                            className="back-btn"
                            onClick={() => navigate('/client/projects')}
                        >
                            <FaArrowLeft /> Back to Projects
                        </button>
                        <h1>{project.name}</h1>
                        <p>Project Status & Progress Tracking</p>
                    </div>
                    <div className="overall-progress-wrapper">
                        <div className="progress-info">
                            <span>Overall Progress</span>
                            <span>{project.progress}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="summary-details-grid">
                    <div className="detail-box">
                        <label>Location</label>
                        <span>{project.location || 'Not Specified'}</span>
                    </div>
                    <div className="detail-box">
                        <label>Start Date</label>
                        <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="detail-box">
                        <label>End Date</label>
                        <span>{(project.endDate || project.expectedEndDate) ? new Date(project.endDate || project.expectedEndDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="detail-box">
                        <label>Budget</label>
                        <span>₹{project.budget?.toLocaleString('en-IN') || 0}</span>
                    </div>
                </div>
            </div>

            {/* 2. Controls & Filters */}
            <div className="tasks-controls">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search tasks by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On-hold</option>
                        <option value="COMPLAINT">Complaint</option>
                    </select>
                </div>
            </div>

            {/* 3. Tasks Table */}
            <div className="tasks-table-wrapper">
                <table className="tasks-table">
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Category</th>
                            <th>Assigned To</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Progress</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map(task => (
                            <tr key={task._id}>
                                <td className="task-name-cell">{task.title}</td>
                                <td>
                                    <span className={`category-badge category-${task.category?.toLowerCase().replace(' ', '-')}`}>
                                        {task.category || 'Other'}
                                    </span>
                                </td>
                                <td>
                                    <div className="team-member">
                                        <div className="avatar-mini">{task.assignedTo?.fullName?.charAt(0) || '?'}</div>
                                        <span>{task.assignedTo?.fullName || 'Unassigned'}</span>
                                    </div>
                                </td>
                                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}</td>
                                <td>
                                    <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td style={{ width: '150px' }}>
                                    <div className="progress-info" style={{ fontSize: '0.75rem' }}>
                                        <span>{task.progress || (task.status.toLowerCase() === 'completed' ? 100 : 0)}%</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-fill" style={{ width: `${task.progress || (task.status.toLowerCase() === 'completed' ? 100 : 0)}%` }}></div>
                                    </div>
                                </td>
                                <td>
                                    <button className="btn-view-details" onClick={() => setSelectedTask(task)}>
                                        <FaChevronRight />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredTasks.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No tasks match your filters.
                    </div>
                )}
            </div>


            {/* 5. Task Details Modal */}
            {selectedTask && (
                <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0 }}>{selectedTask.title}</h2>
                            </div>
                            <button className="close-modal" onClick={() => setSelectedTask(null)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                                <div className="modal-left">
                                    <section style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ marginBottom: '0.5rem', color: '#64748b' }}>Description</h4>
                                        <p style={{ lineHeight: 1.6 }}>{selectedTask.description || 'No description provided.'}</p>
                                    </section>

                                    <section style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ marginBottom: '0.5rem', color: '#64748b' }}>Category</h4>
                                        <span className={`category-badge category-${selectedTask.category?.toLowerCase().replace(' ', '-')}`}>
                                            {selectedTask.category || 'Other'}
                                        </span>
                                    </section>

                                </div>

                                <div className="modal-right">
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                        <div className="staff-info-card">
                                            <span className="staff-info-header">STAFF DETAILS</span>
                                            <div className="staff-info-divider"></div>
                                            <div className="staff-info-grid">
                                                <div className="staff-info-row">
                                                    <span className="info-label">Name</span>
                                                    <span className="info-value">: {selectedTask.assignedTo?.fullName || 'Unassigned'}</span>
                                                </div>
                                                <div className="staff-info-row">
                                                    <span className="info-label">Email</span>
                                                    <span className="info-value">: {selectedTask.assignedTo?.email || 'N/A'}</span>
                                                </div>
                                                <div className="staff-info-row">
                                                    <span className="info-label">Phone</span>
                                                    <span className="info-value">: {selectedTask.assignedTo?.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectTasks;
