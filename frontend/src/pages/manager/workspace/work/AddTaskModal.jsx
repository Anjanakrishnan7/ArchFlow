import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import api, { BASE_URL } from '../../../../utils/api';
import { useToast } from '../../../../context/ToastContext';

const AddTaskModal = ({
    show,
    onClose,
    onSuccess,
    projectId,
    isEditing = false,
    taskToEdit = null,
    preFillData = null
}) => {
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        category: 'Site Work',
        status: 'Pending'
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [customCategory, setCustomCategory] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);

    const categories = ["Site Work", "Structural Work", "Electrical Work", "Plumbing Work", "Finishing Work", "Complaint", "Other"];

    const fetchTeamMembers = async () => {
        try {
            const { data } = await api.get(`/manager/projects/${projectId}/team`);
            if (data.success) {
                setTeamMembers(data.team || []);
            }
        } catch (error) {
            console.error('Error fetching team:', error);
        }
    };

    useEffect(() => {
        if (show && projectId) {
            fetchTeamMembers();
        }

        if (show) {
            if (isEditing && taskToEdit) {
                setFormData({
                    title: taskToEdit.title || '',
                    description: taskToEdit.description || '',
                    assignedTo: taskToEdit.assignedTo?._id || '',
                    dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
                    category: categories.includes(taskToEdit.category) ? taskToEdit.category : 'Other',
                    status: taskToEdit.status || 'Pending',
                    attachments: taskToEdit.attachments || []
                });

                if (!categories.includes(taskToEdit.category)) {
                    setIsOtherSelected(true);
                    setCustomCategory(taskToEdit.category);
                } else {
                    setIsOtherSelected(false);
                    setCustomCategory('');
                }
            } else if (preFillData) {
                setFormData({
                    title: preFillData.title || '',
                    description: preFillData.description || '',
                    assignedTo: '',
                    dueDate: '',
                    category: preFillData.category || 'Site Work',
                    status: 'Pending',
                    attachments: []
                });
                setIsOtherSelected(preFillData.category === 'Other');
                setCustomCategory('');
            } else {
                // Reset form for new task
                setFormData({
                    title: '',
                    description: '',
                    assignedTo: '',
                    dueDate: '',
                    category: 'Site Work',
                    status: 'Pending',
                    attachments: []
                });
                setIsOtherSelected(false);
                setCustomCategory('');
                setSelectedFiles([]);
            }
        }
    }, [show, projectId, isEditing, taskToEdit, preFillData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.assignedTo) {
            showToast('Please assign the task to a staff member', 'error');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const originalDueDate = isEditing && taskToEdit?.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '';
        if (formData.dueDate && formData.dueDate < today && formData.dueDate !== originalDueDate) {
            showToast('Due date must not be in the past', 'error');
            return;
        }

        let finalCategory = formData.category;
        if (isOtherSelected) {
            if (!customCategory.trim()) {
                showToast('Custom category cannot be empty', 'error');
                return;
            }
            finalCategory = customCategory.trim();
        }

        const dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('description', formData.description);
        dataToSend.append('assignedTo', formData.assignedTo);
        dataToSend.append('dueDate', formData.dueDate);
        dataToSend.append('category', finalCategory);
        dataToSend.append('status', formData.status);

        if (selectedFiles.length > 0) {
            selectedFiles.forEach(file => {
                dataToSend.append('attachments', file);
            });
        }

        const url = isEditing
            ? `/manager/projects/${projectId}/tasks/${taskToEdit._id}`
            : `/manager/projects/${projectId}/tasks`;

        try {
            const { data } = isEditing
                ? await api.patch(url, dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                : await api.post(url, dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            if (data.success) {
                showToast(isEditing ? 'Task updated!' : 'Task created!', 'success');
                onSuccess();
                onClose();
            } else {
                showToast(data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            showToast('Error saving task', 'error');
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '500px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {isEditing ? 'Edit Task' : 'Add New Task'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Task Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={inputStyle}
                            placeholder="e.g. Site Inspection"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                            placeholder="Enter task details..."
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Assign To *</label>
                        <select
                            required
                            value={formData.assignedTo}
                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                            style={inputStyle}
                        >
                            <option value="">-- Select Staff Member --</option>
                            {teamMembers.map(member => (
                                <option key={member._id} value={member.userId?._id}>
                                    {member.userId?.fullName || 'Unknown User'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={labelStyle}>Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData({ ...formData, category: val });
                                    setIsOtherSelected(val === 'Other');
                                }}
                                style={inputStyle}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={labelStyle}>Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                style={inputStyle}
                                min={isEditing && taskToEdit?.dueDate && new Date(taskToEdit.dueDate).toISOString().split('T')[0] < new Date().toISOString().split('T')[0] 
                                    ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] 
                                    : new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {isOtherSelected && (
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Custom Category *</label>
                            <input
                                type="text"
                                required
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                style={inputStyle}
                                placeholder="Enter custom category"
                            />
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Attachments {isEditing ? '(Optional - will append to existing)' : ''}</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                            style={inputStyle}
                        />
                        {selectedFiles.length > 0 && (
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                                {selectedFiles.length} file(s) selected
                            </div>
                        )}
                    </div>

                    {isEditing && formData.attachments && formData.attachments.length > 0 && (
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Current Attachments</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {formData.attachments.map((file, index) => {
                                    const fileName = file.split('/').pop().split('-').slice(1).join('-') || `File ${index + 1}`;
                                    return (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: '0.85rem',
                                            padding: '4px 8px',
                                            backgroundColor: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '4px'
                                        }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
                                            <a href={`${BASE_URL.replace(/\/$/, '')}${file.startsWith('/') ? '' : '/'}${file}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>View</a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ padding: '8px 16px', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                        >
                            {isEditing ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
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

export default AddTaskModal;
