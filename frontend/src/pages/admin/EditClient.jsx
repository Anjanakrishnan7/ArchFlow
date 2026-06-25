import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI, usersAPI, getPhotoUrl } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { FaEye, FaEyeSlash, FaCamera, FaUser } from 'react-icons/fa';
import './EditClient.css';

const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      const data = await usersAPI.get(id);
      setFormData({
        fullName: data.fullName || data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        password: '' // Always empty initially
      });
      if (data.photo) {
        setPreviewImage(getPhotoUrl(data.photo));
      }
    } catch (error) {
      console.error('Error loading client:', error);
    }
  };

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
    setLoading(true);
    setError('');

    if (formData.password && formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Phone validation
    if (formData.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Please provide a valid phone number (10-15 digits)');
        setLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'password' || formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (selectedFile) {
        formDataToSend.append('photo', selectedFile);
      }

      await adminAPI.updateClient(id, formDataToSend);
      showToast('Client profile updated successfully', 'success');
      navigate('/admin/client-list');
    } catch (err) {
      const msg = err.message || 'Error updating client';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-client">
      <h1>Edit Client</h1>
      {error && <div className="alert alert-danger">{error}</div>}
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
            <label>Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
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
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New password (min 8 chars)"
                minLength="8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {/* Empty spacer to keep password on the left or matching grid if needed, 
              but usually single item fills or sits left. 
              If user wanted password on RIGHT, we'd add <div className="form-group"></div> before it.
              Assuming standard flow (Left) is fine now that Address is moved.
           */}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Client'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/client-list')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClient;




