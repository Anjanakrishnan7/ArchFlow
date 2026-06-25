import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { usersAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import './AddProject.css';

const AddProject = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [managers, setManagers] = useState([]);
    const [clients, setClients] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Residential',
        location: '',
        clientId: '',
        budget: '',
        managerId: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Managers
                const managerData = await usersAPI.getByRole('manager');
                if (Array.isArray(managerData)) {
                    setManagers(managerData);
                } else if (managerData.success && managerData.users) {
                    setManagers(managerData.users);
                }

                // Fetch Clients
                const clientData = await usersAPI.getByRole('client');
                if (Array.isArray(clientData)) {
                    setClients(clientData);
                } else if (clientData.success && clientData.users) {
                    setClients(clientData.users);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                showToast("Failed to load users", "error");
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.clientId || !formData.budget) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (formData.startDate && formData.startDate < today) {
            showToast('Start date must not be in the past', 'error');
            return;
        }

        if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            showToast('End date must be after start date', 'error');
            return;
        }

        try {
            setLoading(true);

            // Create Project Payload
            const payload = {
                ...formData,
                budget: parseFloat(formData.budget),
                location: formData.location || '',
                // Ensure optional fields are handled correctly
                managerId: formData.managerId || null,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined
            };

            // Use centralized api instance - Authorization header added automatically
            const { data } = await api.post('/admin/projects', payload);

            if (data.success) {
                showToast('Project created successfully!', 'success');
                setTimeout(() => {
                    navigate('/admin/projects');
                }, 1500);
            } else {
                showToast(data.message || 'Failed to create project', 'error');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error creating project';
            showToast(errorMsg, 'error');
            console.error('Project creation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-project-container">
            <div className="add-project-header">
                <h1>Add New Project</h1>
                <button onClick={() => navigate('/admin/projects')} className="btn-back">
                    ← Back to Projects
                </button>
            </div>

            <form onSubmit={handleSubmit} className="add-project-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Project Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter project name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Project Type *</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Infrastructure">Infrastructure</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter project location"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="clientId">Client *</label>
                        <select
                            id="clientId"
                            name="clientId"
                            value={formData.clientId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select Client --</option>
                            {clients.map((client) => (
                                <option key={client._id} value={client._id}>
                                    {client.fullName} ({client.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="budget">Budget (₹) *</label>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            placeholder="Enter budget amount"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="managerId">Assign Manager (Optional)</label>
                        <select
                            id="managerId"
                            name="managerId"
                            value={formData.managerId}
                            onChange={handleChange}
                        >
                            <option value="">-- Select Manager --</option>
                            {managers.filter(mgr => mgr.isAvailable !== false).map((mgr) => (
                                <option key={mgr._id} value={mgr._id}>
                                    {mgr.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="startDate">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="endDate">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/projects')}
                        className="btn-cancel"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProject;
