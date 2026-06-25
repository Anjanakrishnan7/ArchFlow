import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './MilestoneDetailsModal.css';

const MilestoneDetailsModal = ({ isOpen, onClose, milestone, projectName }) => {
    if (!isOpen || !milestone) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>{milestone.title || milestone.name}</h2>
                        <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Project: {projectName || 'Unknown'}
                        </p>
                    </div>
                    <button className="close-modal" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="modal-body">
                    <section className="detail-section">
                        <h4>Description</h4>
                        <p>{milestone.description || 'No description provided.'}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MilestoneDetailsModal;
