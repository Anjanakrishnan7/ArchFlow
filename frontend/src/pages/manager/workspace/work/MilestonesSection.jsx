import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaFlag } from 'react-icons/fa';
import api from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';

const MilestonesSection = ({ projectId, onUpdate }) => {
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth();
    const { showToast } = useToast();

    const [milestones, setMilestones] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'pending',
        progress: 0
    });

    useEffect(() => {
        fetchMilestones();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const fetchMilestones = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/manager/projects/${projectId}/milestones`);
            if (data.success) {
                setMilestones(data.milestones);
            }
        } catch (error) {
            console.error('Error fetching milestones:', error);
            showToast('Failed to load milestones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let updated = { ...prev, [name]: value };

            if (name === 'progress') {
                if (value === '') {
                    updated.progress = '';
                    updated.status = 'pending';
                } else {
                    const progressNum = Number(value);
                    if (progressNum >= 100) {
                        updated.status = 'completed';
                        updated.progress = 100;
                    } else if (progressNum <= 0) {
                        updated.status = 'pending';
                        updated.progress = 0;
                    } else {
                        updated.status = 'in-progress';
                        updated.progress = progressNum;
                    }
                }
            } else if (name === 'status') {
                // status logic is kept for internal state sync if needed, 
                // though it's hidden from UI now
                if (value === 'completed') {
                    updated.progress = 100;
                } else if (value === 'pending') {
                    updated.progress = 0;
                } else if (value === 'in-progress' && (prev.progress === 0 || prev.progress === 100)) {
                    updated.progress = 50;
                }
            }

            return updated;
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            status: 'pending',
            progress: 0
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (milestone) => {
        setFormData({
            title: milestone.title || milestone.name || '',
            description: milestone.description || '',
            startDate: milestone.startDate ? milestone.startDate.split('T')[0] : '',
            endDate: milestone.endDate ? milestone.endDate.split('T')[0] : '',
            status: milestone.status?.toLowerCase() || 'pending',
            progress: milestone.progress || 0
        });
        setIsEditing(true);
        setCurrentId(milestone._id);
        setShowModal(true);
    };

    const validateForm = () => {
        if (!formData.title || !formData.startDate || !formData.endDate) {
            showToast('Please fill in all required fields', 'error');
            return false;
        }

        const today = new Date().toISOString().split('T')[0];
        const originalMilestone = isEditing ? milestones.find(m => m._id === currentId) : null;
        const originalStartDate = originalMilestone?.startDate ? originalMilestone.startDate.split('T')[0] : '';
        
        if (formData.startDate < today && formData.startDate !== originalStartDate) {
            showToast('Start date must not be in the past', 'error');
            return false;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            showToast('End date must be after start date', 'error');
            return false;
        }
        
        if (!isEditing && milestones.length > 0) {
            const sortedMilestones = [...milestones].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            const latestMilestone = sortedMilestones[sortedMilestones.length - 1];
            
            const lastEndDate = new Date(latestMilestone.endDate);
            lastEndDate.setHours(0, 0, 0, 0);
            const newStartDate = new Date(formData.startDate);
            newStartDate.setHours(0, 0, 0, 0);
            
            if (newStartDate <= lastEndDate) {
                showToast(`New milestone must start after the last milestone's end date (${lastEndDate.toLocaleDateString()})`, 'error');
                return false;
            }
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (isEditing) {
                const { data } = await api.patch(`/manager/projects/${projectId}/milestones/${currentId}`, formData);
                if (data.success) {
                    showToast('Milestone updated successfully', 'success');
                }
            } else {
                const { data } = await api.post(`/manager/projects/${projectId}/milestones`, formData);
                if (data.success) {
                    showToast('Milestone created successfully', 'success');
                }
            }
            setShowModal(false);
            fetchMilestones();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error saving milestone:', error);
            showToast(error.response?.data?.message || 'Error saving milestone', 'error');
        }
    };

    const handleDelete = async (milestoneId) => {
        if (!window.confirm('Are you sure you want to delete this milestone?')) return;

        try {
            const { data } = await api.delete(`/manager/projects/${projectId}/milestones/${milestoneId}`);
            if (data.success) {
                showToast('Milestone deleted successfully', 'success');
                fetchMilestones();
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Error deleting milestone:', error);
            showToast('Error deleting milestone', 'error');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'completed': return '#10b981';
            case 'in-progress': return '#3b82f6';
            case 'pending': return '#6b7280';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="milestones-section">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={openAddModal}
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
                    <FaPlus style={{ fontSize: '1rem' }} /> Add Milestone
                </button>
            </div>

            {milestones.length === 0 ? (
                <div className="no-data" style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px dashed #d1d5db',
                    color: '#6b7280'
                }}>
                    <FaFlag style={{ fontSize: '2rem', marginBottom: '10px', color: '#d1d5db' }} />
                    <p>No milestones added yet. Create your first milestone to get started!</p>
                </div>
            ) : (
                <div className="schedule-table-container" style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={thStyle}>Title</th>
                                <th style={thStyle}>Start Date</th>
                                <th style={thStyle}>End Date</th>
                                <th style={thStyle}>Progress</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {milestones.map((milestone, index) => {
                                // Replicate backend logic to determine if editable/deletable
                                let isEditable = true;
                                let isDeletable = true;
                                let lockedReason = '';

                                // 1. Check previous milestone
                                if (index > 0) {
                                    const previousMilestone = milestones[index - 1];
                                    if (previousMilestone.status !== 'completed') {
                                        isEditable = false;
                                        lockedReason = `Previous milestone "${previousMilestone.title}" must be completed first.`;
                                    }
                                }

                                // 2. Check next milestone
                                if (index < milestones.length - 1) {
                                    const nextMilestone = milestones[index + 1];
                                    if (nextMilestone.status !== 'pending' || nextMilestone.progress > 0) {
                                        isEditable = false;
                                        isDeletable = false;
                                        lockedReason = `Next milestone "${nextMilestone.title}" is already in progress.`;
                                    }
                                }

                                // 3. Special rule for deletion
                                if (milestone.status === 'completed' && index < milestones.length - 1) {
                                    isDeletable = false;
                                    if (!lockedReason) lockedReason = 'Cannot delete a completed milestone with subsequent milestones.';
                                }

                                return (
                                <tr key={milestone._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '500', color: '#111827' }}>{milestone.title}</div>
                                        {milestone.description && (
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {milestone.description}
                                            </div>
                                        )}
                                    </td>
                                    <td style={tdStyle}>{formatDate(milestone.startDate)}</td>
                                    <td style={tdStyle}>{formatDate(milestone.endDate)}</td>
                                    <td style={tdStyle} width="20%">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${milestone.progress}%`,
                                                    backgroundColor: '#3b82f6',
                                                    height: '100%',
                                                    borderRadius: '9999px',
                                                    transition: 'width 0.3s ease'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#6b7280', minWidth: '32px' }}>{milestone.progress}%</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: `${getStatusColor(milestone.status)}15`,
                                            color: getStatusColor(milestone.status)
                                        }}>
                                            {milestone.status}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => isEditable && openEditModal(milestone)}
                                                disabled={!isEditable}
                                                style={{ 
                                                    color: isEditable ? '#3b82f6' : '#9ca3af', 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: isEditable ? 'pointer' : 'not-allowed', 
                                                    padding: '0', 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    opacity: isEditable ? 1 : 0.5
                                                }}
                                                title={isEditable ? "Edit Milestone" : lockedReason}
                                            >
                                                <FaEdit style={{ fontSize: '1rem' }} />
                                            </button>
                                            <button
                                                onClick={() => isDeletable && handleDelete(milestone._id)}
                                                disabled={!isDeletable}
                                                style={{ 
                                                    color: isDeletable ? '#ef4444' : '#9ca3af', 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: isDeletable ? 'pointer' : 'not-allowed', 
                                                    padding: '0', 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    opacity: isDeletable ? 1 : 0.5
                                                }}
                                                title={isDeletable ? "Delete Milestone" : lockedReason}
                                            >
                                                <FaTrash style={{ fontSize: '0.9rem' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (() => {
                const today = new Date().toISOString().split('T')[0];
                const originalMilestone = isEditing ? milestones.find(m => m._id === currentId) : null;
                const milestoneIndex = isEditing ? milestones.findIndex(m => m._id === currentId) : -1;
                const previousMilestone = milestoneIndex > 0 ? milestones[milestoneIndex - 1] : null;
                const isLocked = isEditing && previousMilestone && previousMilestone.status?.toLowerCase() !== 'completed';

                return (
                    <div className="modal-overlay" onClick={() => setShowModal(false)} style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                            backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '500px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                                {isEditing ? 'Edit Milestone' : 'Add New Milestone'}
                            </h3>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        placeholder="e.g. Foundation Complete"
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                                        placeholder="Brief description of the milestone..."
                                    />
                                </div>

                                <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label style={labelStyle}>Start Date *</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            required
                                            style={inputStyle}
                                            min={isEditing && originalMilestone?.startDate && originalMilestone.startDate.split('T')[0] < today 
                                                ? originalMilestone.startDate.split('T')[0] 
                                                : today}
                                        />
                                    </div>

                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label style={labelStyle}>End Date *</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            required
                                            style={inputStyle}
                                            min={formData.startDate || today}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ ...labelStyle, opacity: isLocked ? 0.5 : 1 }}>Progress (%)</label>
                                    <input
                                        type="number"
                                        name="progress"
                                        min="0"
                                        max="100"
                                        value={formData.progress}
                                        onChange={handleInputChange}
                                        disabled={isLocked}
                                        style={{ ...inputStyle, backgroundColor: isLocked ? '#f3f4f6' : 'white', cursor: isLocked ? 'not-allowed' : 'default' }}
                                        placeholder="e.g. 50"
                                    />
                                </div>

                                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ padding: '8px 16px', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                                    >
                                        {isEditing ? 'Save Changes' : 'Create Milestone'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

// Styles reused
const thStyle = {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '12px 16px',
    fontSize: '0.875rem',
    color: '#374151',
    verticalAlign: 'middle',
    borderBottom: '1px solid #f3f4f6'
};

const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
};

const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem'
};

export default MilestonesSection;
