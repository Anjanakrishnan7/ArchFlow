import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaPhone, FaUserTag, FaIdBadge } from 'react-icons/fa';
import { getPhotoUrl } from '../../../utils/api'; // Import getPhotoUrl

const StaffProfileModal = ({ member, onClose }) => {
    const [imgError, setImgError] = useState(false);

    if (!member) return null;

    const user = member.userId || member; // Handle both populated team member or direct user object

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="profile-header">
                    <div className="profile-avatar-large">
                        {user.photo && !imgError ? (
                            <img
                                src={getPhotoUrl(user.photo)}
                                alt={user.fullName}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="avatar-placeholder-large">
                                {user.fullName?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <h2>{user.fullName}</h2>
                    <span className="profile-role">{member.roleInProject || user.role}</span>
                </div>

                <div className="profile-body">
                    <div className="profile-section">
                        <h3>Staff Details</h3>
                        <div className="profile-info-item">
                            <FaEnvelope />
                            <span>{user.email}</span>
                        </div>
                        <div className="profile-info-item">
                            <FaPhone />
                            <span>{user.phone || 'N/A'}</span>
                        </div>
                        <div className="profile-info-item">
                            <FaIdBadge />
                            <span><strong>Qualification:</strong> {user.qualification || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .profile-modal {
                    max-width: 500px;
                    width: 90%;
                    padding: 0;
                    overflow: hidden;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .profile-header {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    color: white !important;
                    padding: 30px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }
                .profile-avatar-large {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: white;
                    padding: 4px;
                    margin-bottom: 15px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .avatar-placeholder-large {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: #3b82f6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: bold;
                }
                .profile-avatar-large img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .profile-header h2 {
                    margin: 0 0 5px 0;
                    font-size: 1.5rem;
                    color: white !important;
                }
                .profile-role {
                    background: rgba(255,255,255,0.2);
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 0.85rem;
                    color: white !important;
                }
                .profile-body {
                    padding: 25px;
                }
                .profile-section {
                    margin-bottom: 0;
                }
                .profile-section h3 {
                    font-size: 1rem;
                    color: #64748b;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 5px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .profile-info-item {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 10px;
                    margin-bottom: 12px;
                    color: #334155;
                    font-size: 0.95rem;
                }
                .profile-info-item svg {
                    color: #3b82f6;
                    font-size: 1.1rem;
                    min-width: 20px; /* Ensure icon has space */
                }
                .modal-close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                    z-index: 10;
                }
                .modal-close-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
};

export default StaffProfileModal;
