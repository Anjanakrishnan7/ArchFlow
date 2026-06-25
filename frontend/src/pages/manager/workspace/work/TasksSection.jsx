import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import api from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import AddTaskModal from './AddTaskModal';


const TasksSection = ({ projectId }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const location = useLocation();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [preFillData, setPreFillData] = useState(null);

    useEffect(() => {
        fetchTasks();

        // Handle pre-filled data from location state (legacy redirection)
        if (location.state && location.state.preFillTask) {
            const { title, description, category, projectId: stateProjectId } = location.state.preFillTask;
            if (stateProjectId === projectId) {
                setPreFillData({ title, description, category });
                setShowModal(true);
                window.history.replaceState({}, document.title);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, location.state]);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get(`/manager/projects/${projectId}/tasks`);
            if (data.success) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (task) => {
        setIsEditing(true);
        setSelectedTask(task);
        setPreFillData(null);
        setShowModal(true);
    };

    const handleCreateClick = () => {
        setIsEditing(false);
        setSelectedTask(null);
        setPreFillData(null);
        setShowModal(true);
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const { data } = await api.delete(`/manager/projects/${projectId}/tasks/${taskId}`);
            if (data.success) {
                showToast('Task deleted successfully', 'success');
                fetchTasks();
            }
        } catch (error) {
            showToast('Error deleting task', 'error');
        }
    };


    const formatDate = (date) => {
        if (!date) return 'No due date';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Site Work': return { bg: '#dbeafe', color: '#1d4ed8' }; // blue
            case 'Structural Work': return { bg: '#ffedd5', color: '#ea580c' }; // orange
            case 'Electrical Work': return { bg: '#fef9c3', color: '#ca8a04' }; // yellow
            case 'Plumbing Work': return { bg: '#cffafe', color: '#0891b2' }; // cyan
            case 'Finishing Work': return { bg: '#dcfce7', color: '#16a34a' }; // green
            case 'Complaint': return { bg: '#fee2e2', color: '#dc2626' }; // red
            default: return { bg: '#f3f4f6', color: '#4b5563' }; // grey
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
        <div className="tasks-section">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleCreateClick}
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
                    <FaPlus style={{ fontSize: '1rem' }} /> Add Task
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="no-data" style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px dashed #d1d5db',
                    color: '#6b7280'
                }}>
                    <FaCheckCircle style={{ fontSize: '2rem', marginBottom: '10px', color: '#d1d5db' }} />
                    <p>No tasks added yet. Create your first task to get started!</p>
                </div>
            ) : (
                <div className="tasks-table-container" style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={thStyle}>Task Title</th>
                                <th style={thStyle}>Assigned To</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Due Date</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '500', color: '#111827' }}>{task.title}</div>
                                        {task.description && <div style={{ fontSize: '0.75rem', color: '#6b7280', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.description}</div>}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#4b5563', fontWeight: 'bold' }}>
                                                {task.assignedTo?.fullName?.charAt(0) || '?'}
                                            </div>
                                            <span>{task.assignedTo?.fullName || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: getCategoryStyles(task.category).bg,
                                            color: getCategoryStyles(task.category).color,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {task.category}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{formatDate(task.dueDate)}</td>
                                    <td style={tdStyle}>
                                        <span className={`status-badge ${task.status?.toLowerCase().replace(' ', '-')}`} style={{
                                            padding: '4px 10px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            display: 'inline-block',
                                            textTransform: 'capitalize',
                                            backgroundColor: task.status?.toLowerCase() === 'completed' ? '#ecfdf5' : '#fff7ed',
                                            color: task.status?.toLowerCase() === 'completed' ? '#065f46' : '#9a3412'
                                        }}>
                                            {task.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => handleEditClick(task)}
                                                style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                                                title="Edit Task"
                                            >
                                                <FaPlus style={{ fontSize: '1rem' }} /> {/* Replaced FaEdit with FaPlus for some reason in original or user preference? Wait, original had FaEdit. User might want FaPlus? No, FaEdit is better for edit. I'll stick to FaEdit. Actually, I was looking at original code... let me check icons. Original had FaEdit. I'll use FaEdit. */}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                                                title="Delete Task"
                                            >
                                                <FaTrash style={{ fontSize: '0.9rem' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AddTaskModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchTasks}
                projectId={projectId}
                isEditing={isEditing}
                taskToEdit={selectedTask}
                preFillData={preFillData}
            />
        </div>
    );
};

// Styles objects for cleanliness in inline-styles
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

export default TasksSection;
