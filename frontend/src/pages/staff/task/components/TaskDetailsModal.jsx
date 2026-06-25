import { FaTimes, FaChevronRight, FaFileAlt } from 'react-icons/fa';
import { BASE_URL } from '../../../../utils/api';
import './TaskDetailsModal.css';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
    if (!isOpen || !task) return null;

    const projectData = task.project || task.projectId || {};

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="task-details-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>{task.title}</h2>
                        <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Project: {projectData.name || 'Unknown'}
                        </p>
                    </div>
                    <button className="close-modal" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="modal-body">
                    <div className="modal-grid">
                        <div className="modal-left">
                            <section className="detail-section">
                                <h4>Description</h4>
                                <p>{task.description || 'No description provided.'}</p>
                            </section>

                            <section className="detail-section">
                                <h4>Category</h4>
                                <span className={`category-badge category-${task.category?.toLowerCase().replace(' ', '-')}`}>
                                    {task.category || 'Other'}
                                </span>
                            </section>

                            {task.attachments && task.attachments.length > 0 && (
                                <section className="detail-section">
                                    <h4>Attachments</h4>
                                    <div className="attachments-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {task.attachments.map((file, index) => {
                                            const fileName = file.split('/').pop().split('-').slice(1).join('-') || `Document ${index + 1}`;
                                            return (
                                                <a
                                                    key={index}
                                                    href={`${BASE_URL.replace(/\/$/, '')}${file.startsWith('/') ? '' : '/'}${file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px 12px',
                                                        backgroundColor: '#f1f5f9',
                                                        borderRadius: '6px',
                                                        color: '#3b82f6',
                                                        textDecoration: 'none',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <FaFileAlt />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {fileName}
                                                    </span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="modal-right">
                            <div className="info-card">
                                <span className="info-card-header">PROJECT DETAILS</span>
                                <div className="info-card-divider"></div>
                                <div className="info-card-grid">
                                    <div className="info-row">
                                        <span className="info-label">Project</span>
                                        <span className="info-value">: {projectData.name || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Client</span>
                                        <span className="info-value">: {projectData.clientId?.fullName || projectData.client || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Location</span>
                                        <span className="info-value">: {projectData.location || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Due Date</span>
                                        <span className="info-value">: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Status</span>
                                        <span className="info-value">
                                            : <span className={`status-text status-${task.status?.toLowerCase().replace(' ', '-')}`}>
                                                {task.status || 'Pending'}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsModal;
