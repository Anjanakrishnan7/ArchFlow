import React, { useState, useEffect } from "react";
import { FiPlus, FiCalendar, FiClock, FiFileText, FiEye, FiSearch, FiDownload, FiTrash2 } from "react-icons/fi";
import { FaClipboardList } from "react-icons/fa";
import api, { managerAPI } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import "./MinutesTab.css";

const MinutesTab = ({ projectId }) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [minutes, setMinutes] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        meetingDate: new Date().toISOString().split("T")[0],
        participants: [],
        discussion: "",
        decisions: "",
        actionNotes: "",
        visibleToClient: false,
        attachments: [], // Placeholder for now
    });

    useEffect(() => {
        fetchMinutes();
        fetchTeamMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const fetchMinutes = async () => {
        try {
            const data = await managerAPI.getMinutes(projectId);
            if (data.success) {
                setMinutes(data.minutes);
            }
        } catch (error) {
            console.error("Error fetching minutes:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const data = await managerAPI.getProjectTeam(projectId);
            if (data.success) {
                setTeamMembers(data.team);
            }
        } catch (error) {
            console.error("Error fetching team:", error);
        }
    };

    const openModal = (minuteToEdit = null) => {
        if (minuteToEdit) {
            setEditingId(minuteToEdit._id);
            setFormData({
                title: minuteToEdit.title || "",
                meetingDate: minuteToEdit.meetingDate ? new Date(minuteToEdit.meetingDate).toISOString().split("T")[0] : (minuteToEdit.createdAt || new Date().toISOString()),
                participants: minuteToEdit.participants ? minuteToEdit.participants.map((p) => p._id) : [],
                discussion: minuteToEdit.discussion || "",
                decisions: minuteToEdit.decisions || "",
                actionNotes: minuteToEdit.actionNotes || "",
                visibleToClient: minuteToEdit.visibleToClient || false,
                attachments: minuteToEdit.attachments || [],
                content: minuteToEdit.content || "" // Add this line
            });
            setShowModal(true);
        }
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="minutes-tab">
            <div className="tab-header">
                <div className="header-info">
                    <h3>Project Minutes</h3>

                </div>
            </div>

            <div className="minutes-list">
                {minutes.length === 0 ? (
                    <div className="empty-state">
                        <p>No minutes recorded yet.</p>
                    </div>
                ) : (
                    minutes.map((minute) => (
                        <div
                            key={minute._id}
                            className="minutes-card"
                            onClick={() => openModal(minute)}
                        >
                            <div className="minutes-badge">
                                <FaClipboardList />
                            </div>
                            <div className="minutes-main">
                                <div className="minutes-meta">
                                    <span className="minutes-date">
                                        {new Date(minute.createdAt || minute.meetingDate).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    {minute.visibleToClient && <span className="visibility-badge client">Client Visible</span>}
                                </div>

                                <div className="minutes-section">
                                    {minute.content ? (
                                        <p>{minute.content}</p>
                                    ) : (
                                        <>
                                            <p><strong>Discussion:</strong> {minute.discussion || "No discussion"}</p>
                                            <p><strong>Participants:</strong> {minute.participants?.length || 0} Attendees</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>View Minutes</h3>
                        <div className="view-minutes-content">
                            {formData.title ? (
                                <>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <p className="static-field">{formData.title}</p>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Date</label>
                                            <p className="static-field">{formData.meetingDate}</p>
                                        </div>
                                        <div className="form-group">
                                            <label>Visible to Client</label>
                                            <p className="static-field">{formData.visibleToClient ? "Yes" : "No"}</p>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Participants</label>
                                        <div className="static-field">
                                            {formData.participants && formData.participants.length > 0 ? (
                                                <ul className="participants-list">
                                                    {teamMembers
                                                        .filter(member => formData.participants.includes(member._id))
                                                        .map(member => (
                                                            <li key={member._id}>{member.fullName} ({member.role})</li>
                                                        ))
                                                    }
                                                </ul>
                                            ) : (
                                                <p>No participants recorded</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Discussion Points</label>
                                        <div className="static-field multiline">{formData.discussion}</div>
                                    </div>

                                    <div className="form-group">
                                        <label>Decisions Taken</label>
                                        <div className="static-field multiline">{formData.decisions}</div>
                                    </div>

                                    <div className="form-group">
                                        <label>Action Notes</label>
                                        <div className="static-field multiline">{formData.actionNotes || "None"}</div>
                                    </div>
                                </>
                            ) : (
                                // Render simple minutes (Content only)
                                <div className="form-group">
                                    <label>Minutes Content</label>
                                    <div className="static-field multiline" style={{ minHeight: '150px' }}>
                                        {formData.content || "No content available."}
                                    </div>
                                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                        Recorded on: {new Date(formData.meetingDate).toLocaleString()}
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinutesTab;
