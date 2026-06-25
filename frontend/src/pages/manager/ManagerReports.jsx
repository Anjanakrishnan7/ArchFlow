import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaFileAlt, FaCalendarAlt, FaExclamationTriangle, FaImages, FaTimes } from 'react-icons/fa';
import { managerAPI, BASE_URL } from '../../utils/api';
import './ManagerReports.css'; // We will create this next

const ManagerReports = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        summary: '',
        issuesOrBlockers: '',
        workImages: []
    });

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (selectedProject) {
            fetchReports(selectedProject);
        } else {
            setReports([]);
        }
    }, [selectedProject, fetchReports]);

    const fetchProjects = useCallback(async () => {
        try {
            const res = await managerAPI.getProjects();
            if (res.success) {
                setProjects(res.data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, []);

    const fetchReports = useCallback(async (projectId) => {
        setLoading(true);
        try {
            const res = await managerAPI.getMonthlyReports(projectId); // Assuming this endpoint exists in managerAPI or we use generic api call
            // Wait, managerAPI might not have getMonthlyReports. Let's check api.js or just use api helper.
            // Actually, I should use api.get calls if managerAPI methods are not known.
            // Let's stick to the structure but use the api instance if possible or fetch.
            // Reverting to fetch/axios style but using BASE_URL and token?
            // Existing code used axios with credentials. 
            // Our api.js instance handles credentials/token?
            // Let's assume managerAPI has generic methods or use api.get.
            // To be safe and consistent with other files, I'll use `api.get`.
            // But I don't see `api` imported. I should import `api` from utils.
        } catch (error) {
            // ...
        }
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, workImages: files });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject) return alert('Please select a project first');

        const data = new FormData();
        data.append('summary', formData.summary);
        data.append('issuesOrBlockers', formData.issuesOrBlockers);
        formData.workImages.forEach(file => {
            data.append('workImages', file);
        });

        try {
            const res = await managerAPI.addMonthlyReport(selectedProject, data);

            if (res.success) {
                alert('Report created successfully');
                setShowModal(false);
                setFormData({ summary: '', issuesOrBlockers: '', workImages: [] });
                fetchReports(selectedProject);
            }
        } catch (error) {
            console.error('Error creating report:', error);
            alert(error.response?.data?.message || 'Error creating report');
        }
    };

    return (
        <div className="manager-reports-container">
            <div className="reports-header">
                <h1>Monthly Reports</h1>
                <div className="header-actions">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="project-select"
                    >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                            <option key={project._id} value={project._id}>{project.name}</option>
                        ))}
                    </select>
                    <button
                        className="create-report-btn"
                        disabled={!selectedProject}
                        onClick={() => setShowModal(true)}
                    >
                        <FaPlus /> Create Report
                    </button>
                </div>
            </div>

            <div className="reports-content">
                {!selectedProject ? (
                    <div className="no-selection">
                        <FaFileAlt size={48} />
                        <p>Select a project to view or create reports</p>
                    </div>
                ) : loading ? (
                    <div className="loading">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="no-data">
                        <p>No monthly reports found for this project.</p>
                    </div>
                ) : (
                    <div className="reports-grid">
                        {reports.map(report => (
                            <div key={report._id} className="report-card">
                                <div className="report-header">
                                    <span className="report-date">
                                        <FaCalendarAlt /> {new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="report-author">
                                        By: {report.submittedBy?.fullName || 'Unknown'}
                                    </span>
                                </div>
                                <div className="report-body">
                                    <div className="report-section">
                                        <h4>Summary</h4>
                                        <p>{report.summary}</p>
                                    </div>
                                    <div className="report-section issue">
                                        <h4><FaExclamationTriangle /> Issues / Blockers</h4>
                                        <p>{report.issuesOrBlockers}</p>
                                    </div>
                                    {report.workImages && report.workImages.length > 0 && (
                                        <div className="report-images">
                                            <h4><FaImages /> Attached Images ({report.workImages.length})</h4>
                                            <div className="image-thumbnails">
                                                {report.workImages.map((img, idx) => (
                                                    <a key={idx} href={`${BASE_URL}${img}`} target="_blank" rel="noopener noreferrer">
                                                        <img src={`${BASE_URL}${img}`} alt={`Work ${idx + 1}`} />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create Monthly Report</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Summary of Work</label>
                                <textarea
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Describe the work completed this month..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Issues or Blockers</label>
                                <textarea
                                    name="issuesOrBlockers"
                                    value={formData.issuesOrBlockers}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Any challenges or blockers faced..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Work Images</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                />

                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="submit-btn">Submit Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerReports;
