import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, BASE_URL, getPhotoUrl, adminAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { FaEdit, FaTrash, FaGraduationCap, FaUser } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import './AdminGallery.css';

const StaffGallery = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAvailability, setFilterAvailability] = useState('all');
    const { showToast } = useToast();



    const loadStaff = useCallback(async () => {
        try {
            setLoading(true);
            const data = await usersAPI.getByRole('staff');

            if (Array.isArray(data)) {
                setStaff(data);
            } else if (data && Array.isArray(data.users)) {
                // Fallback
                setStaff(data.users);
            } else {
                console.error("Unexpected data format:", data);
                setStaff([]);
                // Don't toast here to avoid spamming if it's just empty
            }
        } catch (error) {
            showToast('Failed to load staff', 'error');
            console.error('Error loading staff:', error);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadStaff();
    }, [loadStaff]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
            try {
                await usersAPI.delete(id);
                showToast('Staff member deleted successfully', 'success');
                setStaff(staff.filter(s => s._id !== id));
            } catch (error) {
                showToast('Error deleting staff member', 'error');
            }
        }
    };

    const handleAvailabilityToggle = async (id, currentIsAvailable) => {
        try {
            const newIsAvailable = !currentIsAvailable;
            // Optimistic update
            setStaff(staff.map(s =>
                s._id === id ? { ...s, isAvailable: newIsAvailable } : s
            ));

            const res = await adminAPI.toggleAvailability(id);
            showToast(`Staff availability updated to ${res.isAvailable ? 'Available' : 'Unavailable'}`, 'success');
        } catch (error) {
            // Revert on error
            loadStaff();
            showToast('Error updating staff availability', 'error');
        }
    };

    // Filter out pending users - they are managed in Pending Approvals page
    const activeStaff = staff.filter(s => s.status === 'active');

    const filteredStaff = filterAvailability === 'all'
        ? activeStaff
        : activeStaff.filter(s => {
            if (filterAvailability === 'available') return s.isAvailable === true;
            if (filterAvailability === 'unavailable') return s.isAvailable === false;
            return true;
        });



    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-gallery-page">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Staff List</h2>
                <Link to="/admin/register-staff" className="btn btn-primary">
                    + Register Staff
                </Link>
            </div>

            <div className="filter-bar">
                <button
                    className={`filter-btn ${filterAvailability === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('all')}
                >
                    All Staff ({activeStaff.length})
                </button>
                <button
                    className={`filter-btn ${filterAvailability === 'available' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('available')}
                >
                    Available ({activeStaff.filter(s => s.isAvailable === true).length})
                </button>
                <button
                    className={`filter-btn ${filterAvailability === 'unavailable' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('unavailable')}
                >
                    Unavailable ({activeStaff.filter(s => s.isAvailable === false).length})
                </button>
            </div>

            {filteredStaff.length === 0 ? (
                <div className="empty-state">
                    <h3>No staff found</h3>
                    <p>There are no staff members matching the current filter.</p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredStaff.map((member) => (
                        <div key={member._id} className="admin-card">
                            <div className="gallery-card-header">
                                <div className="profile-image-container">
                                    <div className="profile-placeholder" style={{
                                        display: 'flex',
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {member.photo ? (
                                            <img
                                                src={getPhotoUrl(member.photo)}
                                                alt={member.fullName || member.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <FaUser style={{ fontSize: '40px', color: '#cbd5e1' }} />
                                        )}
                                    </div>
                                </div>
                                <h3 className="admin-name">{member.fullName || member.name}</h3>
                                <div className="admin-role">Staff</div>
                                <span className={`status-badge ${member.isAvailable ? 'status-active' : 'status-declined'}`}>
                                    {member.isAvailable ? 'Available' : 'Unavailable'}
                                </span>

                                <div className="contact-info" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', width: '100%' }}>
                                    <div className="info-row" style={{ justifyContent: 'flex-start' }}>
                                        <MdEmail className="info-icon" />
                                        <span style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '200px'
                                        }}>
                                            {member.email}
                                        </span>
                                    </div>
                                    <div className="info-row" style={{ justifyContent: 'flex-start' }}>
                                        <MdPhone className="info-icon" />
                                        <span>{member.phone || 'No phone number'}</span>
                                    </div>
                                    <div className="info-row" style={{ justifyContent: 'flex-start' }}>
                                        <FaGraduationCap className="info-icon" />
                                        <span>{member.qualification || 'No qualification specified'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions">
                                <Link to={`/admin/staff/edit/${member._id}`} className="btn btn-secondary btn-sm btn-full-width">
                                    <FaEdit /> View Profile
                                </Link>

                                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                    {member.status === 'active' && (
                                        <button
                                            onClick={() => handleAvailabilityToggle(member._id, member.isAvailable)}
                                            className={`btn btn-sm ${member.isAvailable ? 'btn-primary' : 'btn-success'}`}
                                            style={{ flex: 1 }}
                                            title={member.isAvailable ? 'Mark as Unavailable' : 'Mark as Available'}
                                        >
                                            {member.isAvailable ? ' Set Unavailable' : ' Set Available'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(member._id)}
                                        className="btn btn-danger-solid btn-sm"
                                        style={{ flex: 1 }}
                                        title="Delete Staff"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StaffGallery;
