import React, { useState } from 'react';
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import "./ReportsTab.css";

const MonthlyReportModal = ({ isOpen, onClose, projectId, onSubmit }) => {
    const [formData, setFormData] = useState({
        summary: '',
        issuesOrBlockers: '',
        workImages: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            workImages: [...prev.workImages, ...files]
        }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.workImages.length === 0) {
            alert("Please upload at least one work progress file.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Use FormData for image upload
            const data = new FormData();
            data.append('summary', formData.summary);
            data.append('issuesOrBlockers', formData.issuesOrBlockers);
            formData.workImages.forEach(image => {
                data.append('workImages', image);
            });

            await onSubmit(projectId, data);

            setFormData({
                summary: '',
                issuesOrBlockers: '',
                workImages: []
            });
            onClose();
        } catch (error) {
            console.error("Failed to submit report:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                <h3 className="modal-title">Create Monthly Report</h3>

                <form className="report-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Summary *</label>
                        <textarea
                            name="summary"
                            className="form-textarea"
                            rows="4"
                            value={formData.summary}
                            onChange={handleChange}
                            placeholder="Describe what has been done this month..."
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Attachments Upload (Multiple) *</label>
                        <div className="image-upload-wrapper">
                            <input
                                type="file"
                                id="workImages"
                                name="workImages"
                                multiple
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                                style={{ display: 'none' }}
                                required={formData.workImages.length === 0}
                            />
                            <label htmlFor="workImages" className="image-upload-label">
                                <FaCloudUploadAlt />
                                <span>Click to upload files</span>
                            </label>
                        </div>

                        <div style={{ marginTop: '5px', fontSize: '0.9rem', color: '#666' }}>
                            {formData.workImages.length} file(s) selected
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Issues/Blockers</label>
                        <textarea
                            name="issuesOrBlockers"
                            className="form-textarea"
                            rows="3"
                            value={formData.issuesOrBlockers}
                            onChange={handleChange}
                            placeholder="Any blockers or issues faced? (Optional)"
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MonthlyReportModal;
