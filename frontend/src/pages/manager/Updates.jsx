import React, { useEffect, useState } from "react";
import { FaFileUpload, FaImage, FaFilePdf, FaDownload } from "react-icons/fa";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "../admin/AdminProjects.css"; // Reuse Admin styles

const ManagerUpdates = () => {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [updates, setUpdates] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectFilter, setSelectedProjectFilter] = useState("All");

    // Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState("");
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState("");

    useEffect(() => {
        fetchUpdates();
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUpdates = async () => {
        try {
            setLoading(true);
            // Assuming an endpoint to get all updates/files for manager's projects
            const res = await fetch(`${BASE_URL}/api/manager/project-updates`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUpdates(data.updates || data.data);
            }
        } catch (error) {
            console.error("Error fetching updates:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/manager/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects || data.data);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const handleUpload = async () => {
        if (!selectedProject || !file) {
            showToast("Please select a project and a file", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("caption", caption);

        try {
            const res = await fetch(`${BASE_URL}/api/manager/project/${selectedProject}/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                showToast("File uploaded successfully", "success");
                setModalVisible(false);
                setFile(null);
                setCaption("");
                setSelectedProject("");
                fetchUpdates();
            } else {
                showToast(data.message || "Failed to upload file", "error");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            showToast("Error uploading file", "error");
        }
    };

    const filteredUpdates = selectedProjectFilter === "All"
        ? updates
        : updates.filter(u => u.projectId === selectedProjectFilter);

    if (loading) return <div className="loading">Loading updates...</div>;

    return (
        <div className="admin-projects-container">
            <div className="page-header-section">
                <h1 className="page-title">Project Updates & Files</h1>
                <button className="btn-add-project" onClick={() => setModalVisible(true)}>
                    <FaFileUpload style={{ marginRight: '8px' }} /> Upload New
                </button>
            </div>

            <div className="filter-section">
                <select
                    value={selectedProjectFilter}
                    onChange={(e) => setSelectedProjectFilter(e.target.value)}
                    className="status-filter"
                >
                    <option value="All">All Projects</option>
                    {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="dashboard-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {filteredUpdates.length > 0 ? (
                    filteredUpdates.map((update) => (
                        <div key={update._id} className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{
                                height: '150px',
                                background: '#f8f9fa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderBottom: '1px solid #e9ecef'
                            }}>
                                {update.fileType?.startsWith('image') ? (
                                    <img src={`${BASE_URL}${update.filePath}`} alt={update.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <FaFilePdf style={{ fontSize: '48px', color: '#dc3545' }} />
                                )}
                            </div>
                            <div style={{ padding: '15px' }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{update.caption || "No Caption"}</h4>
                                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6c757d' }}>
                                    Project: {update.projectName}
                                </p>
                                <p style={{ margin: '0', fontSize: '11px', color: '#adb5bd' }}>
                                    {new Date(update.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                        No updates found.
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Upload Project File</h2>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '15px' }}>
                                <label>Select Project</label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="manager-dropdown"
                                >
                                    <option value="">-- Select Project --</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Select File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="search-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label>Caption</label>
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Enter file caption..."
                                    className="search-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setModalVisible(false)}>Cancel</button>
                            <button className="btn-assign" onClick={handleUpload}>Upload</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerUpdates;
