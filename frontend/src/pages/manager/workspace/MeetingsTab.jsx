import React, { useState, useEffect } from 'react';
import { FaPlus, FaCalendarAlt, FaUsers, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { BASE_URL } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import "./MeetingsTab.css";

const MeetingsTab = ({ projectId }) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [meetings, setMeetings] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        attendees: [],
        agenda: '',
        notes: ''
    });

    useEffect(() => {
        fetchMeetings();
        fetchTeamMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const fetchMeetings = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/manager/projects/${projectId}/meetings`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setMeetings(data.meetings);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/manager/projects/${projectId}/team`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setTeamMembers(data.team);
            }
        } catch (error) {
            console.error('Error fetching team:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const today = new Date().toISOString().split('T')[0];
        if (formData.date && formData.date < today) {
            showToast('Meeting date must not be in the past', 'error');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/manager/projects/${projectId}/meetings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                showToast('Meeting scheduled successfully', 'success');
                setShowModal(false);
                setFormData({
                    title: '',
                    date: '',
                    time: '',
                    location: '',
                    attendees: [],
                    agenda: '',
                    notes: ''
                });
                fetchMeetings();
            } else {
                showToast(data.message || 'Failed to schedule meeting', 'error');
            }
        } catch (error) {
            showToast('Error scheduling meeting', 'error');
        }
    };

    const handleAttendeeChange = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setFormData({ ...formData, attendees: selectedValues });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="meetings-tab">
            <div className="tab-header">
                <div className="header-info">
                    <h3>Project Meetings</h3>
                    <p>Schedule and track project meetings and minutes</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <FaPlus /> Schedule Meeting
                </button>
            </div>

            <div className="meetings-list">
                {meetings.length === 0 ? (
                    <div className="no-data">No meetings scheduled yet.</div>
                ) : (
                    meetings.map(meeting => (
                        <div key={meeting._id} className="meeting-card">
                            <div className="meeting-date-box">
                                <span className="day">{new Date(meeting.date).getDate()}</span>
                                <span className="month">{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            </div>

                            <div className="meeting-content">
                                <div className="meeting-header">
                                    <h4>{meeting.title}</h4>
                                    <span className="meeting-time">
                                        <FaClock /> {meeting.time}
                                    </span>
                                </div>

                                <div className="meeting-details">
                                    {meeting.location && (
                                        <div className="detail-item">
                                            <FaMapMarkerAlt /> {meeting.location}
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <FaUsers /> {meeting.attendees?.length || 0} Attendees
                                    </div>
                                </div>

                                {meeting.agenda && (
                                    <div className="meeting-agenda">
                                        <strong>Agenda:</strong> {meeting.agenda}
                                    </div>
                                )}

                                {meeting.notes && (
                                    <div className="meeting-notes">
                                        <strong>Minutes/Notes:</strong>
                                        <p>{meeting.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Schedule Meeting Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Schedule New Meeting</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Meeting Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Location/Link</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Conference Room A or Zoom Link"
                                />
                            </div>

                            <div className="form-group">
                                <label>Attendees</label>
                                <select
                                    multiple
                                    className="multi-select"
                                    value={formData.attendees}
                                    onChange={handleAttendeeChange}
                                >
                                    {teamMembers.map(member => (
                                        <option key={member._id} value={member._id}>
                                            {member.fullName}
                                        </option>
                                    ))}
                                </select>
                                <small className="form-help">Hold Ctrl/Cmd to select multiple</small>
                            </div>

                            <div className="form-group">
                                <label>Agenda</label>
                                <textarea
                                    rows="3"
                                    value={formData.agenda}
                                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Minutes/Notes (Optional)</label>
                                <textarea
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Can be added later..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingsTab;
