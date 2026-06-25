import React, { useEffect, useState, useCallback } from "react";
import { FaPlus, FaUserTie } from "react-icons/fa";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "../admin/AdminProjects.css"; // Reuse Admin styles

const ManagerTasks = () => {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    // Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assignedTo: "",
        category: "Site Work",
        deadline: "",
    });

    const [customCategory, setCustomCategory] = useState("");
    const [isOtherSelected, setIsOtherSelected] = useState(false);

    const categories = ["Site Work", "Structural Work", "Electrical Work", "Plumbing Work", "Finishing Work", "Other"];

    useEffect(() => {
        fetchTasks();
        fetchStaff();
    }, [fetchTasks, fetchStaff]);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/api/manager/tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setTasks(data.tasks || data.data);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchStaff = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/manager/staff`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setStaffList(data.staff || data.data);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
        }
    }, [token]);

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.assignedTo || !newTask.deadline) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        let finalCategory = newTask.category;
        if (isOtherSelected) {
            if (!customCategory.trim()) {
                showToast("Custom category cannot be empty", "error");
                return;
            }
            finalCategory = customCategory.trim();
        }

        const payload = { ...newTask, category: finalCategory };

        try {
            const res = await fetch(`${BASE_URL}/api/manager/task`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Task created successfully", "success");
                setModalVisible(false);
                setNewTask({ title: "", description: "", assignedTo: "", category: "Site Work", deadline: "" });
                setCustomCategory("");
                setIsOtherSelected(false);
                fetchTasks();
            } else {
                showToast(data.message || "Failed to create task", "error");
            }
        } catch (error) {
            console.error("Error creating task:", error);
            showToast("Error creating task", "error");
        }
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Site Work': return { color: '#007bff' };
            case 'Structural Work': return { color: '#fd7e14' };
            case 'Electrical Work': return { color: '#ffc107' };
            case 'Plumbing Work': return { color: '#17a2b8' };
            case 'Finishing Work': return { color: '#28a745' };
            default: return { color: '#6c757d' };
        }
    };

    const filteredTasks = tasks.filter(task => filter === "All" || task.status === filter);

    if (loading) return <div className="loading">Loading tasks...</div>;

    return (
        <div className="admin-projects-container">
            <div className="page-header-section">
                <h1 className="page-title">Task Management</h1>
                <button className="btn-add-project" onClick={() => setModalVisible(true)}>
                    <FaPlus style={{ marginRight: '8px' }} /> Create Task
                </button>
            </div>

            <div className="filter-section">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="status-filter"
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <div className="projects-table-wrapper">
                <table className="modern-projects-table">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Assigned To</th>
                            <th>Category</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <tr key={task._id}>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{task.title}</div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{task.description}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <FaUserTie style={{ marginRight: '5px', color: '#6c757d' }} />
                                            {task.assignedTo?.fullName || "Unassigned"}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            color: getCategoryStyles(task.category).color,
                                            fontWeight: '600',
                                            fontSize: '12px'
                                        }}>
                                            {task.category}
                                        </span>
                                    </td>
                                    <td>{new Date(task.deadline).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${task.status?.toLowerCase().replace(' ', '-')}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action" style={{ color: '#007bff' }}>View</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">No tasks found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Task Modal */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create New Task</h2>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '15px' }}>
                                <label>Task Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="search-input"
                                    style={{ width: '100%' }}
                                    placeholder="Enter task title"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="search-input"
                                    style={{ width: '100%', minHeight: '80px' }}
                                    placeholder="Enter task details"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Assign To</label>
                                <select
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                    className="manager-dropdown"
                                >
                                    <option value="">-- Select Staff --</option>
                                    {staffList.filter(staff => staff.isAvailable !== false).map(staff => (
                                        <option key={staff._id} value={staff._id}>{staff.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Category</label>
                                    <select
                                        value={newTask.category}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNewTask({ ...newTask, category: val });
                                            setIsOtherSelected(val === "Other");
                                        }}
                                        className="manager-dropdown"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Deadline</label>
                                    <input
                                        type="date"
                                        value={newTask.deadline}
                                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                        className="search-input"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                            {isOtherSelected && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Custom Category</label>
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        className="search-input"
                                        style={{ width: '100%' }}
                                        placeholder="Enter custom category"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setModalVisible(false)}>Cancel</button>
                            <button className="btn-assign" onClick={handleCreateTask}>Create Task</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTasks;
