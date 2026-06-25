import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usersAPI, getPhotoUrl, BASE_URL } from '../../utils/api';
import './Profile.css';

const Profile = () => {
    const { user, loadingUser, setUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        photo: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Fetch complete profile data from API
    useEffect(() => {
        if (user && !loadingUser && user._id) {
            fetchProfile();
        }
        // eslint-disable-next-line
    }, [user, loadingUser]);

    const fetchProfile = async () => {
        try {
            const data = await usersAPI.get(user._id);

            // Update AuthContext with complete user data
            const completeUser = {
                ...user,
                ...data,
                _id: data._id || data.id || user._id
            };
            setUser(completeUser);

            // Update form data
            setFormData({
                fullName: data.fullName || data.name || '',
                phone: data.phone || '',
                photo: null
            });
        } catch (error) {
            console.error('[Common Profile] Error fetching profile:', error);
            showToast('Failed to load profile data', 'error');
        }
    };

    // Safety check only (ProtectedRoute already ensures user exists)
    if (loadingUser) {
        return <div className="spinner"></div>;
    }

    if (!user?._id) {
        return <div className="spinner"></div>;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        // Phone validation
        if (formData.phone) {
            const phoneRegex = /^\+?[\d\s-]{10,15}$/;
            if (!phoneRegex.test(formData.phone)) {
                showToast("Please provide a valid phone number (10-15 digits)", "error");
                return;
            }
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phone', formData.phone);
            if (formData.photo) {
                data.append('photo', formData.photo);
            }

            const result = await usersAPI.updateProfile(user._id, data);
            const updatedUser = result.user || result;

            // Update context with new data, preserving existing fields just in case
            setUser(prev => ({ ...prev, ...updatedUser }));

            showToast('Profile updated successfully', 'success');
            setIsEditModalOpen(false);
            setPreviewUrl(null); // Clear preview
        } catch (error) {
            console.error('Update error:', error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/users/change-password`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to change password');

            showToast('Password changed successfully', 'success');
            setIsPasswordModalOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const newStatus = user.status === 'active' ? 'pending' : 'active';
            setLoading(true);

            const res = await fetch(`${BASE_URL}/api/users/${user._id}`, {
                method: 'PUT',
                credentials: 'include', // IMPORTANT: Send auth cookies
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update status');
            }

            const updatedUser = data.user || data;
            setUser(updatedUser);
            showToast(`Status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}`, 'success');
        } catch (error) {
            console.error('Status update error:', error);
            showToast(error.message || 'Failed to update status', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="loading-spinner">Loading profile...</div>;

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'badge-primary';
            case 'staff': return 'badge-info';
            case 'client': return 'badge-success';
            default: return 'badge-secondary';
        }
    };

    const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;

    return (
        <div className="profile-page">
            {/* Header Card */}
            <div className="profile-header-card">
                <div className="profile-avatar-wrapper">
                    {user.photo ? (
                        <img
                            key={user.photo} // Force re-render when photo changes
                            src={getPhotoUrl(user.photo)}
                            alt={user.fullName}
                            className="profile-avatar"
                            onError={(e) => {
                                console.error('Image failed to load:', e.target.src);
                                e.target.onerror = null;
                                e.target.src = 'https://ui-avatars.com/api/?name=' + (user.fullName || 'User');
                            }}
                        />
                    ) : (
                        <div className="profile-avatar-placeholder">
                            <FaUser />
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    <h1 className="profile-name">
                        {user.fullName || user.name}
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                            {user.role.toUpperCase()}
                        </span>
                    </h1>
                    <div className="profile-meta">
                        <span>{user.email}</span>
                        <span>{user.phone || 'No phone number'}</span>
                    </div>
                    {joinedDate && (
                        <div className="profile-joined">
                            Joined on {joinedDate}
                        </div>
                    )}
                </div>

                <div className="profile-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="profile-content-grid">
                {/* Basic Info Section */}
                <div className="profile-section-card">
                    <div className="section-header">
                        <h2 className="section-title">Basic Information</h2>
                    </div>

                    <div className="info-group">
                        <label className="info-label">Full Name</label>
                        <div className="info-value">{user.fullName || user.name}</div>
                    </div>

                    <div className="info-group">
                        <label className="info-label">Email Address</label>
                        <div className="info-value readonly">
                            {user.email}
                            <span style={{ fontSize: '0.8em', marginLeft: '8px', color: '#94a3b8' }}>(Read-only)</span>
                        </div>
                    </div>

                    <div className="info-group">
                        <label className="info-label">Phone Number</label>
                        <div className="info-value">{user.phone || 'Not provided'}</div>
                    </div>
                </div>

                {/* Account Settings / Security Section */}
                <div className="profile-section-card">
                    <div className="section-header">
                        <h2 className="section-title">Account Security</h2>
                    </div>

                    <div className="info-group">
                        <label className="info-label">Password</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="info-value">••••••••••••</span>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsPasswordModalOpen(true)}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>

                    <div className="info-group">
                        <label className="info-label">Account Status</label>
                        <div className="info-value">
                            <button
                                className={`btn btn-sm ${user.status === 'active' ? 'btn-success' : 'btn-danger'}`}
                                style={{ minWidth: '120px', fontWeight: 'bold' }}
                                onClick={handleToggleStatus}
                                disabled={loading}
                                title="Click to toggle status"
                            >
                                {loading ? 'Updating...' : (user.status === 'active' ? 'ACTIVE' : 'INACTIVE')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) setIsEditModalOpen(false);
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Profile</h3>
                            <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="modal-body">
                                <div className="upload-preview-container">
                                    {previewUrl || user.photo ? (
                                        <img
                                            src={previewUrl || getPhotoUrl(user.photo)}
                                            alt="Preview"
                                            className="upload-preview"
                                        />
                                    ) : (
                                        <div className="profile-avatar-placeholder upload-preview">
                                            <FaUser />
                                        </div>
                                    )}
                                    <div className="upload-btn-wrapper">
                                        <button type="button" className="btn btn-secondary btn-sm">Change Photo</button>
                                        <input
                                            type="file"
                                            name="photo"
                                            className="upload-input"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label className="info-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="info-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) setIsPasswordModalOpen(false);
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Change Password</h3>
                            <button className="modal-close" onClick={() => setIsPasswordModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpdatePassword}>
                            <div className="modal-body">
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label className="info-label">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label className="info-label">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="info-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="form-control"
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
