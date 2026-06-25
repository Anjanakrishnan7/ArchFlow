import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaUserPlus, FaUserCheck, FaFilter, FaIdBadge } from 'react-icons/fa';
import api, { BASE_URL } from '../../../utils/api';
import { useToast } from '../../../context/ToastContext';
import './AddMember.css'; // We will create this CSS file

const AddMember = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [staff, setStaff] = useState([]);
    const [existingTeam, setExistingTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch all staff and existing team members in parallel
            const [staffRes, teamRes] = await Promise.all([
                api.get('/manager/staff'),
                api.get(`/manager/projects/${id}/team`)
            ]);

            if (staffRes.data.success) {
                setStaff(staffRes.data.data || []);
            }

            if (teamRes.data.success) {
                setExistingTeam(teamRes.data.team || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter staff based on search and exclude already assigned members (optional, but requested to "Disable" them)
    // The requirement says "Disable staff already assigned", so we keep them in list but disable selection.
    const filteredStaff = staff.filter(member => {
        const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.qualification && member.qualification.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const isAssigned = (staffId) => {
        return existingTeam.some(member => (member.userId?._id || member.userId) === staffId);
    };

    const toggleSelection = (id) => {
        const member = staff.find(m => m._id === id);
        if (isAssigned(id) || member?.isAvailable === false) return;

        setSelectedStaff(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleAddMembers = async () => {
        if (selectedStaff.length === 0) {
            showToast('Please select at least one staff member', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.patch(`/manager/projects/${id}/assign-staff`, {
                staffIds: selectedStaff
            });

            if (response.data.success) {
                showToast(`${selectedStaff.length} members added successfully`, 'success');
                navigate(`/manager/project/${id}/team`);
            }
        } catch (error) {
            console.error('Error adding members:', error);
            showToast('Failed to add members', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

    return (
        <div className="add-member-page">
            <div className="add-member-header">
                <div className="header-left">
                    <button className="back-button" onClick={() => navigate(`/manager/project/${id}/team`)}>
                        <FaArrowLeft /> Back to Project
                    </button>
                </div>
                <div className="header-right">
                    <div className="selection-count">
                        <span>{selectedStaff.length} selected</span>
                    </div>
                    <button
                        className="add-selected-btn"
                        onClick={handleAddMembers}
                        disabled={selectedStaff.length === 0 || submitting}
                    >
                        {submitting ? 'Adding...' : 'Add Selected Members'}
                    </button>
                </div>
            </div>

            <div className="add-member-content">
                <div className="filter-bar">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or qualification..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Add more filters here if needed later */}
                </div>

                <div className="staff-list-container">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th width="50">Select</th>
                                <th>Staff Member</th>
                                <th>Qualification</th>
                                <th>Contact</th>

                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.length > 0 ? (
                                filteredStaff.map(member => {
                                    const assigned = isAssigned(member._id);
                                    const unavailable = member.isAvailable === false;
                                    const selected = selectedStaff.includes(member._id);
                                    const disabled = assigned || unavailable;

                                    return (
                                        <tr
                                            key={member._id}
                                            className={`${assigned ? 'row-disabled' : ''} ${unavailable ? 'row-unavailable' : ''} ${selected ? 'row-selected' : ''}`}
                                            style={unavailable ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                            onClick={() => !disabled && toggleSelection(member._id)}
                                        >
                                            <td className="checkbox-cell">
                                                {assigned ? (
                                                    <FaUserCheck className="assigned-icon" title="Already Assigned" />
                                                ) : unavailable ? (
                                                    <span className="unavailable-indicator" title="Currently Unavailable" style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>
                                                        N/A
                                                    </span>
                                                ) : (
                                                    <div className={`custom-checkbox ${selected ? 'checked' : ''}`}>
                                                        {selected && <FaUserPlus />}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="staff-info-cell">
                                                    <div className="staff-avatar-placeholder">
                                                        {member.fullName.charAt(0)}
                                                    </div>
                                                    <div className="staff-details">
                                                        <span className="staff-name">{member.fullName}</span>
                                                        <span className="staff-role">{member.role || 'Staff'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="qualification-badge">
                                                    <FaIdBadge />
                                                    {member.qualification || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-details">
                                                    <div className="email">{member.email}</div>
                                                    <div className="phone">{member.phone || 'No phone'}</div>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-results">
                                        No staff members found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AddMember;
