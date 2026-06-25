import React, { useState } from 'react';
import { usersAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const SecuritySection = () => {
    const { showToast } = useToast();
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            await usersAPI.changePassword({
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            showToast('Password updated successfully!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || error.message || 'Failed to update password', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="edit-card right-card">
            <div className="card-header">
                <h3 className="profile-section-heading">ACCOUNT SECURITY</h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="edit-form">
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm password"
                        className="form-input"
                    />
                </div>

                <button type="submit" className="save-btn" disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

export default SecuritySection;
