import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { usersAPI, adminAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import './AddProject.css'; // Reusing styles

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [managers, setManagers] = useState([]);
    const [clients, setClients] = useState([]);
    const [originalStartDate, setOriginalStartDate] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        name: '',
        type: 'Residential',
        location: '',
        clientId: '',
        budget: '',
        managerId: '',
        startDate: '',
        endDate: '',
        description: '',
        status: 'pending'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
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

                // Fetch Project Details
                const response = await adminAPI.getProjectDetails(id);
                if (response.success && response.project) {
                    const project = response.project;
                    setFormData({
                        name: project.name || '',
                        type: project.type || 'Residential',
                        location: project.location || '',
                        clientId: project.clientId?._id || project.clientId || '',
                        budget: project.budget || '',
                        managerId: project.assignedManager?._id || project.assignedManager || '',
                        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
                        description: project.description || '',
                        status: project.status || 'pending'
                    });
                    const dateStr = project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '';
                    setOriginalStartDate(dateStr);
                } else {
                    showToast(response.message || "Failed to fetch project details", "error");
                    navigate('/admin/projects');
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                showToast("Failed to load project data", "error");
                navigate('/admin/projects');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, showToast]);

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

        if (formData.startDate && formData.startDate < today && formData.startDate !== originalStartDate) {
            showToast('Start date must not be in the past', 'error');
            return;
        }

        if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            showToast('End date must be after start date', 'error');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...formData,
                budget: parseFloat(formData.budget),
                managerId: formData.managerId || null,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined
            };

            const response = await adminAPI.updateProject(id, payload);

            if (response.success) {
                showToast('Project updated successfully!', 'success');
                setTimeout(() => {
                    navigate('/admin/projects');
                }, 1500);
            } else {
                showToast(response.message || 'Failed to update project', 'error');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error updating project';
            showToast(errorMsg, 'error');
            console.error('Project update error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading" style={{ padding: '50px', textAlign: 'center' }}>Loading project data...</div>;

    return (
        <div className="add-project-container">
            <div className="add-project-header">
                <h1>Edit Project: {formData.name}</h1>
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
                        <label htmlFor="managerId">Assign Manager</label>
                        <select
                            id="managerId"
                            name="managerId"
                            value={formData.managerId}
                            onChange={handleChange}
                        >
                            <option value="">-- Select Manager --</option>
                            {managers.map((mgr) => (
                                <option key={mgr._id} value={mgr._id}>
                                    {mgr.fullName} {mgr.isAvailable === false ? '(Unavailable)' : ''}
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
                            min={originalStartDate < today ? originalStartDate : today}
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
                            min={formData.startDate || today}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="pending">Pending</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="on-hold">On-Hold</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter project description"
                        rows="4"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/projects')}
                        className="btn-cancel"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={saving}
                    >
                        {saving ? 'Updating...' : 'Update Project'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProject;
