import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../staffTask.css';

const ManpowerModal = ({ isOpen, onClose, taskId, onSubmit }) => {
    const [formData, setFormData] = useState({
        designation: '',
        name: '',
        contact: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(taskId, formData);
        onClose();
        setFormData({ designation: '', name: '', contact: '' });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                <h3 className="modal-title">Add Manpower</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Designation</label>
                        <select
                            name="designation"
                            className="form-select"
                            value={formData.designation}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Designation</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Labor">Labor</option>
                            <option value="Engineer">Engineer</option>
                            <option value="Architect">Architect</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Enter Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact</label>
                        <input
                            type="text"
                            name="contact"
                            className="form-input"
                            placeholder="Enter Contact Number"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Add Manpower
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManpowerModal;
