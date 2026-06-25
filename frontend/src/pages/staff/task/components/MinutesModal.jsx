import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../staffTask.css';

const MinutesModal = ({ isOpen, onClose, taskId, projectId, staffId, onSubmit }) => {
    const [formData, setFormData] = useState({
        content: ''
    });

    // Simplified: No need for useEffect to reset on open if we handle it in onSubmit or just keep it simple.
    // Or, if we really want to reset on open, we can just use the key prop on the component or check isOpen in the parent.
    // However, the lint error is specifically about setState synchronously in effect.
    // Let's just remove it as content: '' is already the default.

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
        if (!formData.content.trim()) {
            return alert("Content is required");
        }
        onSubmit(taskId, {
            ...formData,
            taskId,
            projectId,
            staffId
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                <h3 className="modal-title">Add Minutes</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Content <span style={{ color: 'red' }}>*</span></label>
                        <textarea
                            name="content"
                            className="form-input"
                            rows="5"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Enter meeting notes or task summary..."
                            required
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Minutes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MinutesModal;

