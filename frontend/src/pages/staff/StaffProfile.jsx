import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, getPhotoUrl } from '../../utils/api';

import { FaCamera, FaUser } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import '../../styles/ProfileShared.css';
import SecuritySection from '../../components/SecuritySection';

const StaffProfile = () => {
    const { user, setUser } = useAuth();
    const fileInputRef = useRef(null);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Profile State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        qualification: '',
        address: ''
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageError, setImageError] = useState(false);

    // Initialize Data
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                qualification: user.qualification || '',
                address: user.address || ''
            });

            if (user.photo) {
                setPreviewImage(getPhotoUrl(user.photo));
            }
        }
    }, [user]);

    // Handlers
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageTrigger = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
            setImageError(false);
        }
    };

    // Save Profile Information
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!formData.email.trim()) {
            showToast("Email is required", "error");
            return;
        }

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
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('qualification', formData.qualification);
            data.append('address', formData.address);
            if (selectedFile) {
                data.append('photo', selectedFile);
            }

            const response = await usersAPI.updateProfile(user.id || user._id, data);

            if (response.success) {
                // Update context immediately
                if (response.user) {
                    setUser(prev => ({ ...prev, ...response.user }));
                }

                showToast(response.message || 'Profile updated successfully!', 'success');
                setSelectedFile(null); // Clear selected file after success
            } else {
                showToast(response.message || 'Failed to update profile', 'error');
            }

        } catch (error) {
            console.error('Error updating staff profile:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update profile';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="profile-edit-page">
            <div className="profile-edit-container">

                <div className="edit-grid">

                    {/* Personal Information Column */}
                    <div className="edit-card left-card">
                        <div className="card-header">
                            <h3 className="profile-section-heading">PERSONAL INFORMATION</h3>
                        </div>

                        <div className="profile-image-upload-section">
                            <div className="profile-image-wrapper-small">
                                {previewImage && !imageError ? (
                                    <img
                                        src={previewImage}
                                        alt="Profile"
                                        className="profile-image-small"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="profile-image-placeholder-small">
                                        <FaUser />
                                    </div>
                                )}
                                <button
                                    className="profile-image-edit-btn-small"
                                    onClick={handleImageTrigger}
                                    type="button"
                                >
                                    <FaCamera />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="edit-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="form-input"
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    className="form-input"
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Contact Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Qualification</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    placeholder="Enter qualification"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter location"
                                    className="form-input"
                                />
                            </div>

                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>

                    <SecuritySection />

                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
