import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, BASE_URL, getPhotoUrl } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import './AdminGallery.css';

const ClientGallery = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAvailability, setFilterAvailability] = useState('all');
    const { showToast } = useToast();



    const loadClients = useCallback(async () => {
        try {
            setLoading(true);
            const data = await usersAPI.getByRole('client');

            if (Array.isArray(data)) {
                setClients(data);
            } else if (data && Array.isArray(data.users)) {
                setClients(data.users);
            } else if (!data || (data.success && !data.users)) {
                setClients([]);
            } else {
                console.error("Unexpected data format:", data);
                setClients([]);
            }
        } catch (error) {
            const isNetworkError = error.response || error.request || error.message === 'Network Error';
            if (isNetworkError) {
                showToast('Failed to load clients', 'error');
            }
            console.error('Error loading clients:', error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
            try {
                await usersAPI.delete(id);
                showToast('Client deleted successfully', 'success');
                setClients(clients.filter(c => c._id !== id));
            } catch (error) {
                showToast('Error deleting client', 'error');
            }
        }
    };

    const handleAvailabilityToggle = async (id, currentIsActive) => {
        try {
            const newIsActive = !currentIsActive;
            // Optimistic update
            setClients(clients.map(c =>
                c._id === id ? { ...c, isActive: newIsActive } : c
            ));

            await usersAPI.update(id, { isActive: newIsActive });
            showToast(`Client availability updated to ${newIsActive ? 'Available' : 'Unavailable'}`, 'success');
        } catch (error) {
            // Revert on error
            loadClients();
            showToast('Error updating client status', 'error');
        }
    };

    // Filter out pending users - they are managed in Pending Approvals page
    const activeClients = clients.filter(c => c.status === 'active');

    const filteredClients = filterAvailability === 'all'
        ? activeClients
        : activeClients.filter(c => {
            if (filterAvailability === 'available') return c.isActive === true;
            if (filterAvailability === 'unavailable') return c.isActive === false;
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
                <h2 className="text-2xl font-bold">Client List</h2>
                <Link to="/admin/register-client" className="btn btn-primary">
                    + Register Client
                </Link>
            </div>

            <div className="filter-bar">
                <button
                    className={`filter-btn ${filterAvailability === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('all')}
                >
                    All Clients ({activeClients.length})
                </button>
                <button
                    className={`filter-btn ${filterAvailability === 'available' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('available')}
                >
                    Available ({activeClients.filter(c => c.isActive === true).length})
                </button>
                <button
                    className={`filter-btn ${filterAvailability === 'unavailable' ? 'active' : ''}`}
                    onClick={() => setFilterAvailability('unavailable')}
                >
                    Unavailable ({activeClients.filter(c => c.isActive === false).length})
                </button>
            </div>

            {filteredClients.length === 0 ? (
                <div className="empty-state">
                    <h3>No clients found</h3>
                    <p>There are no clients matching the current filter.</p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredClients.map((client) => (
                        <div key={client._id} className="admin-card">
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
                                        {client.photo ? (
                                            <img
                                                src={getPhotoUrl(client.photo)}
                                                alt={client.fullName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <FaUser style={{ fontSize: '40px', color: '#cbd5e1' }} />
                                        )}
                                    </div>
                                </div>
                                <h3 className="admin-name">{client.fullName || client.name}</h3>
                                <div className="admin-role">Client</div>
                                <span className={`status-badge ${client.isActive ? 'status-active' : 'status-declined'}`}>
                                    {client.isActive ? 'Available' : 'Unavailable'}
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
                                            {client.email}
                                        </span>
                                    </div>
                                    <div className="info-row" style={{ justifyContent: 'flex-start' }}>
                                        <MdPhone className="info-icon" />
                                        <span>{client.phone || 'No phone number'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions">
                                <Link to={`/admin/clients/edit/${client._id}`} className="btn btn-secondary btn-sm btn-full-width">
                                    <FaEdit /> View Profile
                                </Link>

                                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                    {client.status === 'active' && (
                                        <button
                                            onClick={() => handleAvailabilityToggle(client._id, client.isActive)}
                                            className={`btn btn-sm ${client.isActive ? 'btn-primary' : 'btn-success'}`}
                                            style={{ flex: 1 }}
                                            title={client.isActive ? 'Mark as Unavailable' : 'Mark as Available'}
                                        >
                                            {client.isActive ? ' Set Unavailable' : ' Set Available'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(client._id)}
                                        className="btn btn-danger-solid btn-sm"
                                        style={{ flex: 1 }}
                                        title="Delete Client"
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

export default ClientGallery;
