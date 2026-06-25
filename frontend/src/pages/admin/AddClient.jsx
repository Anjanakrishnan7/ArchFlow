import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCamera, FaUser } from 'react-icons/fa';
import api from '../../utils/api';
import './AddClient.css';

const AddClient = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'client',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Phone validation
    if (formData.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Please provide a valid phone number (10-15 digits)');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key]);
      });
      if (selectedFile) {
        dataToSend.append('photo', selectedFile);
      }

      const { data } = await api.post('/admin/create-client', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!data.success) {
        throw new Error(data.message || 'Error creating client');
      }

      setSuccess(true);

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'client',
        address: ''
      });
      setPreviewImage(null);
      setSelectedFile(null);

      // Redirect to client list
      setTimeout(() => {
        navigate('/admin/client-list');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error creating client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-client">
      <h1>Register Client</h1>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          color: '#dc2626',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          background: '#d1fae5',
          border: '1px solid #6ee7b7',
          borderRadius: '6px',
          color: '#059669',
          marginBottom: '20px'
        }}>
          Client registered successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="client-form">
        <div className="profile-image-upload-section" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <div className="profile-image-wrapper" style={{ position: 'relative', width: '120px', height: '120px' }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {previewImage ? (
                <img src={previewImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FaUser size={50} color="#9ca3af" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <FaCamera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="client@example.com"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                required
                minLength="8"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Registering...' : 'Register Client'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/client-list')}
            style={{
              background: 'white',
              color: '#6b7280',
              padding: '12px 24px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClient;
