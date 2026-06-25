import React, { useState } from 'react';
import { projectsAPI } from '../../../utils/api';
import { useToast } from '../../../context/ToastContext';
import './ProjectGallerySection.css';

const ProjectGallerySection = ({ projectId, images, onUpdate }) => {
    const { showToast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Basic validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            showToast('Only JPG, PNG, and WebP images are allowed', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('galleryImages', file);
        });

        try {
            await projectsAPI.uploadGalleryImages(projectId, formData);
            showToast('Images uploaded successfully', 'success');
            onUpdate(); // Refresh parent
            e.target.value = ''; // Reset input
        } catch (error) {
            console.error('Error uploading images:', error);
            showToast('Failed to upload images', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imagePath) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            // Encode the path to safely pass it in the URL
            const encodedPath = encodeURIComponent(imagePath);
            await projectsAPI.deleteGalleryImage(projectId, encodedPath);
            showToast('Image deleted successfully', 'success');
            onUpdate();
        } catch (error) {
            console.error('Error deleting image:', error);
            showToast('Failed to delete image', 'error');
        }
    };

    return (
        <div className="project-gallery-section">
            <div className="gallery-header">
                <h3>Project Gallery</h3>
                <div className="upload-action">
                    <input
                        type="file"
                        id="gallery-upload-input"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden-input"
                    />
                    <label
                        htmlFor="gallery-upload-input"
                        className={`btn btn-secondary ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? 'Uploading...' : '+ Add Images'}
                    </label>
                </div>
            </div>

            {(!images || images.length === 0) ? (
                <div className="empty-gallery">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No images in gallery yet.</p>
                    <p className="text-sm text-gray-400">Upload images to showcase the project</p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {images.map((img, index) => (
                        <div key={index} className="gallery-item">
                            <img
                                src={`http://localhost:5000${img}`}
                                alt={`Gallery ${index}`}
                                loading="lazy"
                                onClick={() => setSelectedImage(img)}
                            />
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(img);
                                }}
                                title="Delete Image"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Preview */}
            {selectedImage && (
                <div className="image-modal" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedImage(null)}>×</button>
                        <img src={`http://localhost:5000${selectedImage}`} alt="Full Preview" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectGallerySection;
