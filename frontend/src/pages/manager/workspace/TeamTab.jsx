import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserCircle, FaEnvelope, FaPhone, FaUserTag } from 'react-icons/fa';
import api, { getPhotoUrl } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import StaffProfileModal from './StaffProfileModal';
import ConfirmRemoveModal from './ConfirmRemoveModal';
import './TeamTab.css';

const TeamTab = ({ projectId }) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [selectedMember, setSelectedMember] = useState(null); // For Profile View
    const [memberToRemove, setMemberToRemove] = useState(null); // For Remove Confirmation
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        fetchTeam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const fetchTeam = async () => {
        try {
            const { data } = await api.get(`/manager/projects/${projectId}/team`);
            if (data.success) {
                setTeam(data.team);
            }
        } catch (error) {
            console.error('Error fetching team:', error);
            showToast('Failed to load team members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (member) => {
        setSelectedMember(member);
    };

    const handleRemoveClick = (member) => {
        setMemberToRemove(member);
    };

    const confirmRemoveMember = async () => {
        if (!memberToRemove) return;

        try {
            setIsRemoving(true);
            await api.delete(`/manager/projects/${projectId}/team/${memberToRemove.userId?._id}`);
            showToast('Team member removed successfully', 'success');
            fetchTeam();
            setMemberToRemove(null);
        } catch (error) {
            console.error(error);
            showToast('Failed to remove member', 'error');
        } finally {
            setIsRemoving(false);
        }
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="team-tab">
            <div className="tab-header">
                <div className="header-info">
                    <h3>Project Team</h3>
                    <p>Manage staff members assigned to this project</p>
                </div>
                <button
                    onClick={() => window.location.href = `/manager/project/${projectId}/add-member`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <FaPlus style={{ fontSize: '1rem' }} /> Add Member
                </button>
            </div>

            <div className="team-list-container">
                {team.length === 0 ? (
                    <div className="no-data">No team members assigned yet.</div>
                ) : (
                    <table className="team-table">
                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Email</th>
                                <th>Qualification</th>
                                <th>Contact</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.map(member => (
                                <tr key={member._id}>
                                    <td>
                                        <div className="member-details">
                                            <span className="member-name">{member.userId?.fullName || 'Unknown User'}</span>
                                        </div>
                                    </td>
                                    <td>{member.userId?.email || 'N/A'}</td>
                                    <td>
                                        <span className="qual-text">{member.userId?.qualification || 'N/A'}</span>
                                    </td>
                                    <td>{member.userId?.phone || 'N/A'}</td>
                                    <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            className="view-profile-btn"
                                            onClick={() => handleViewProfile(member)}
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            className="remove-member-btn"
                                            onClick={() => handleRemoveClick(member)}
                                            style={{
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Staff Profile Modal */}
            {selectedMember && (
                <StaffProfileModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}

            {/* Confirm Remove Modal */}
            {memberToRemove && (
                <ConfirmRemoveModal
                    memberName={memberToRemove.userId?.fullName}
                    onConfirm={confirmRemoveMember}
                    onCancel={() => setMemberToRemove(null)}
                    isDeleting={isRemoving}
                />
            )}
        </div>
    );
};

export default TeamTab;
