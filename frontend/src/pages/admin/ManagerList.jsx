import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, adminAPI, getPhotoUrl } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import './AdminGallery.css';

const ManagerList = () => {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAvailability, setFilterAvailability] = useState('all');
    const { showToast } = useToast();



    const loadManagers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await usersAPI.getByRole('manager');

            if (Array.isArray(data)) {
                setManagers(data);
            } else if (data.success && Array.isArray(data.users)) {
                // Fallback for previous response structure
                setManagers(data.users);
            } else {
                console.error("Unexpected data format:", data);
                setManagers([]);
                showToast('Received invalid data from server', 'error');
            }
        } catch (error) {
            showToast('Failed to load managers', 'error');
            console.error('Error loading managers:', error);
            setManagers([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadManagers();
    }, [loadManagers]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this manager? This action cannot be undone.')) {
            try {
                await usersAPI.delete(id);
                showToast('Manager deleted successfully', 'success');
                setManagers(managers.filter(m => m._id !== id));
            } catch (error) {
                console.error("Delete manager error:", error);
                showToast('Error deleting manager', 'error');
            }
        }
    };

    const handleAvailabilityToggle = async (id, currentIsAvailable) => {
        try {
            const newIsAvailable = !currentIsAvailable;
            // Optimistic update
            setManagers(managers.map(m =>
                m._id === id ? { ...m, isAvailable: newIsAvailable } : m
            ));

            const res = await adminAPI.toggleAvailability(id);

            if (res.success) {
                showToast(`Manager availability updated to ${res.isAvailable ? 'Available' : 'Unavailable'}`, 'success');
            } else {
                // Revert on error
                loadManagers();
                showToast('Error updating manager availability', 'error');
            }
        } catch (error) {
            // Revert on error
            loadManagers();
            showToast('Error updating manager availability', 'error');
        }
    };

    // Filter out pending users - they are managed in Pending Approvals page
    const activeManagers = managers.filter(m => m.status === 'active');

    const filteredManagers = filterAvailability === 'all'
        ? activeManagers
        : activeManagers.filter(m => {
            if (filterAvailability === 'available') return m.isAvailable === true;
            if (filterAvailability === 'unavailable') return m.isAvailable === false;
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
                <h2 className="text-2xl font-bold">Managers</h2>
                <Link to="/admin/register-manager" className="btn btn-primary">
                    + Register Manager
                </Link>
            </div>

            <div className="filter-bar">
                <button
                    className={`filter-btn ${filterAvailability === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('all')}
                >
                    All Managers ({activeManagers.length})
                </button>
                <button
                    className={`filter-btn ${filterAvailability === 'available' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('available')}
                >
                    Available ({activeManagers.filter(m => m.isAvailable === true).length})
                </button>
                <button
                    className={`filter-btn ${filterAvailability === 'unavailable' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('unavailable')}
                >
                    Unavailable ({activeManagers.filter(m => m.isAvailable === false).length})
                </button>
            </div>

            {filteredManagers.length === 0 ? (
                <div className="empty-state">
                    <h3>No managers found</h3>
                    <p>There are no managers matching the current filter.</p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredManagers.map((manager) => (
                        <div key={manager._id} className="admin-card">
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
                                        {manager.photo ? (
                                            <img
                                                src={getPhotoUrl(manager.photo)}
                                                alt={manager.fullName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <FaUser style={{ fontSize: '40px', color: '#cbd5e1' }} />
                                        )}
                                    </div>
                                </div>
                                <h3 className="admin-name">{manager.fullName || manager.name}</h3>
                                <div className="admin-role">Manager</div>
                                <span className={`status-badge ${manager.isAvailable ? 'status-active' : 'status-declined'}`}>
                                    {manager.isAvailable ? 'Available' : 'Unavailable'}
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
                                            {manager.email}
                                        </span>
                                    </div>
                                    <div className="info-row" style={{ justifyContent: 'flex-start' }}>
                                        <MdPhone className="info-icon" />
                                        <span>{manager.phone || 'No phone number'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions">
                                <Link to={`/admin/managers/edit/${manager._id}`} className="btn btn-secondary btn-sm btn-full-width">
                                    <FaEdit /> View Profile
                                </Link>

                                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                    {manager.status === 'active' && (
                                        <button
                                            onClick={() => handleAvailabilityToggle(manager._id, manager.isAvailable)}
                                            className={`btn btn-sm ${manager.isAvailable ? 'btn-primary' : 'btn-success'}`}
                                            style={{ flex: 1 }}
                                            title={manager.isAvailable ? 'Mark as Unavailable' : 'Mark as Available'}
                                        >
                                            {manager.isAvailable ? ' Set Unavailable' : ' Set Available'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(manager._id)}
                                        className="btn btn-danger-solid btn-sm"
                                        style={{ flex: 1 }}
                                        title="Delete Manager"
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

export default ManagerList;
