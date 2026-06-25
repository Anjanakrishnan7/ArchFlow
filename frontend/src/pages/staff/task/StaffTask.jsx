import React, { useState, useEffect } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import ActionsDropdown from './components/ActionsDropdown';
import WorkUpdateModal from './components/WorkUpdateModal';
import MinutesModal from './components/MinutesModal';
import DesignHistoryModal from './components/DesignHistoryModal';
import MinutesHistoryModal from './components/MinutesHistoryModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import { staffAPI } from '../../../utils/api';
import './staffTask.css';

const StaffTask = () => {
    // --- State ---
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeModal, setActiveModal] = useState({ type: null, taskId: null, projectId: null, staffId: null });
    const [expandedTasks, setExpandedTasks] = useState({}); // { taskId: boolean }
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [taskForDetails, setTaskForDetails] = useState(null);

    // --- Fetch Tasks ---
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await staffAPI.getMyTasks();
            setTasks(data.tasks || []);
            // Set first task as selected by default to show minutes if any
            if (data.tasks && data.tasks.length > 0 && !selectedTaskId) {
                setSelectedTaskId(data.tasks[0]._id);
            }
            setError(null);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
            setError("Failed to load tasks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // --- Action Handler from Dropdown ---
    const handleAction = (action, task) => {
        setSelectedTaskId(task._id);
        setActiveModal({
            type: action,
            taskId: task._id,
            projectId: task.project?._id || task.project,
            staffId: task.assignedTo
        });
    };

    const closeModal = () => {
        setActiveModal({ type: null, taskId: null, projectId: null, staffId: null });
    };

    const toggleTaskDescription = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const handleViewDetails = (task) => {
        setTaskForDetails(task);
        setIsDetailsModalOpen(true);
    };

    // --- API Handlers ---
    const handleStatusUpdate = async (task, newStatus) => {
        const currentStatus = task.status?.toLowerCase();
        if (currentStatus === newStatus) return;

        // Optimistic Update
        const originalTasks = [...tasks];
        setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));

        try {
            await staffAPI.updateTaskStatus(task._id, newStatus);
        } catch (err) {
            console.error("Status update failed", err);
            alert("Failed to update status");
            setTasks(originalTasks); // Revert
        }
    };


    const handleWorkUpdateSubmit = async (taskId, updateData) => {
        try {
            const formData = new FormData();
            formData.append('description', updateData.description);
            formData.append('type', updateData.type);

            if (updateData.images && updateData.images.length > 0) {
                updateData.images.forEach(image => {
                    formData.append('images', image);
                });
            }

            await staffAPI.addTaskWorkUpdate(taskId, formData);
            alert("Update submitted successfully");
            closeModal();
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert("Failed to submit update: " + (err.message || "Unknown error"));
        }
    };

    const handleAddMinutes = async (taskId, data) => {
        try {
            await staffAPI.addTaskMinutes(taskId, data);
            alert("Minutes saved successfully");
            closeModal();
            // Optional: if history modal is open, it might need refresh, 
            // but usually we add minutes then close modal.
        } catch (err) {
            console.error(err);
            alert("Failed to save minutes");
        }
    };


    // --- Helpers ---
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'status-completed';
            case 'pending': return 'status-pending';
            case 'in-progress': return 'status-in-progress';
            case 'in progress': return 'status-in-progress';
            default: return '';
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const getCategoryClass = (category) => {
        switch (category) {
            case 'Site Work': return 'category-site';
            case 'Structural Work': return 'category-structural';
            case 'Electrical Work': return 'category-electrical';
            case 'Plumbing Work': return 'category-plumbing';
            case 'Finishing Work': return 'category-finishing';
            case 'Complaint': return 'category-complaint';
            default: return 'category-other';
        }
    };

    if (loading) return <div className="loading-state">Loading tasks...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="staff-task-page">
            <div className="page-header">
                <h1 className="page-title">My Tasks</h1>
            </div>

            <div className="task-table-card">
                {tasks.length === 0 ? (
                    <div className="empty-state">No tasks assigned yet.</div>
                ) : (
                    <table className="task-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Task Title</th>
                                <th>Project</th>
                                <th>Due Date</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Details</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task, index) => (
                                <tr
                                    key={task._id}
                                    onClick={() => setSelectedTaskId(task._id)}
                                    className={selectedTaskId === task._id ? 'selected-row' : ''}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>{index + 1}</td>
                                    <td className="task-title-cell">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <strong>{task.title}</strong>
                                        </div>
                                    </td>
                                    <td>{task.project?.name || "Unknown"}</td>
                                    <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`category-badge ${getCategoryClass(task.category)}`}>
                                            {task.category || 'Other'}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className={`status-select ${getStatusClass(task.status)}`}
                                            value={task.status?.toLowerCase() || 'pending'}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleStatusUpdate(task, e.target.value)}
                                        >
                                            {['pending', 'in-progress', 'completed'].map(status => (
                                                <option key={status} value={status} className="status-option">
                                                    {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-view-action-like"
                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(task); }}
                                        >
                                            View
                                        </button>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                                        <ActionsDropdown
                                            task={task}
                                            onAction={handleAction}
                                        />
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modals */}
            <WorkUpdateModal
                isOpen={activeModal.type === 'add_work_update'}
                onClose={closeModal}
                taskId={activeModal.taskId}
                onSubmit={handleWorkUpdateSubmit}
            />
            <MinutesModal
                isOpen={activeModal.type === 'add_minutes'}
                onClose={closeModal}
                taskId={activeModal.taskId}
                projectId={activeModal.projectId}
                staffId={activeModal.staffId}
                onSubmit={handleAddMinutes}
            />
            <DesignHistoryModal
                isOpen={activeModal.type === 'view_updates'}
                onClose={closeModal}
                taskId={activeModal.taskId}
            />
            <MinutesHistoryModal
                isOpen={activeModal.type === 'view_minutes'}
                onClose={closeModal}
                taskId={activeModal.taskId}
                projectId={activeModal.projectId}
            />

            <TaskDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                task={taskForDetails}
            />
        </div>
    );
};

export default StaffTask;

